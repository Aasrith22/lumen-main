# train_churn.py
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import roc_auc_score, classification_report, confusion_matrix
import lightgbm as lgb
from .model_utils import save_model, save_meta
import json

BASE = Path(__file__).resolve().parents[2]
PROCESSED = BASE / "data" / "processed"
MODELS = BASE / "models"

def load_training_data():
    """Load preprocessed subscription data"""
    data_file = PROCESSED / "subscriptions_labeled.csv"
    if not data_file.exists():
        raise FileNotFoundError("Run preprocessing first: python -m app.services.preprocessing")
    
    df = pd.read_csv(data_file)
    print(f"Loaded data shape: {df.shape}")
    print(f"Churn rate: {df['churn_30d'].mean():.2%}")
    return df

def prepare_features(df):
    """Prepare features for training"""
    # Define feature columns based on what we actually have
    numeric_features = [
        'days_since_start', 'days_until_end', 'is_near_end',
        'num_events_total', 'num_renewals', 'num_events_last_30d',
        'total_amount', 'avg_amount', 'num_payments', 'num_failed_payments'
    ]
    
    # Add any price columns that exist
    price_cols = [col for col in df.columns if 'price' in col.lower() or 'Price' in col]
    numeric_features.extend(price_cols)
    
    # Define categorical features based on actual columns
    categorical_features = []
    if 'subscription_type' in df.columns:
        categorical_features.append('subscription_type')
    if 'status' in df.columns:
        categorical_features.append('status')
    
    # Filter to only include columns that actually exist
    existing_numeric = [col for col in numeric_features if col in df.columns]
    existing_categorical = [col for col in categorical_features if col in df.columns]
    
    print(f"Using numeric features: {existing_numeric}")
    print(f"Using categorical features: {existing_categorical}")
    
    # Prepare feature matrix
    X = df[existing_numeric + existing_categorical].copy()
    
    # Handle missing values
    X[existing_numeric] = X[existing_numeric].fillna(0)
    X[existing_categorical] = X[existing_categorical].fillna('unknown')
    
    # Encode categorical variables
    for col in existing_categorical:
        X[col] = X[col].astype('category')
    
    # Target variable
    y = df['churn_30d']
    
    print(f"Features shape: {X.shape}")
    print(f"Feature columns: {list(X.columns)}")
    
    return X, y, list(X.columns)

def train_churn_model(X, y, feature_names):
    """Train LightGBM churn prediction model"""
    # Split data temporally (simple version - can be improved with actual date splits)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Train shape: {X_train.shape}, Test shape: {X_test.shape}")
    print(f"Train churn rate: {y_train.mean():.2%}, Test churn rate: {y_test.mean():.2%}")
    
    # LightGBM parameters
    params = {
        'objective': 'binary',
        'metric': 'auc',
        'boosting_type': 'gbdt',
        'num_leaves': 31,
        'learning_rate': 0.05,
        'feature_fraction': 0.9,
        'bagging_fraction': 0.8,
        'bagging_freq': 5,
        'verbose': 0,
        'random_state': 42
    }
    
    # Create datasets
    train_data = lgb.Dataset(X_train, label=y_train)
    valid_data = lgb.Dataset(X_test, label=y_test, reference=train_data)
    
    # Train model
    model = lgb.train(
        params,
        train_data,
        valid_sets=[train_data, valid_data],
        valid_names=['train', 'eval'],
        num_boost_round=1000,
        callbacks=[lgb.early_stopping(stopping_rounds=50), lgb.log_evaluation(0)]
    )
    
    # Predictions
    y_pred_proba = model.predict(X_test, num_iteration=model.best_iteration)
    y_pred = (y_pred_proba > 0.5).astype(int)
    
    # Evaluate
    auc_score = roc_auc_score(y_test, y_pred_proba)
    
    print(f"\nModel Performance:")
    print(f"AUC Score: {auc_score:.4f}")
    print(f"Classification Report:")
    print(classification_report(y_test, y_pred))
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': model.feature_importance(importance_type='gain')
    }).sort_values('importance', ascending=False)
    
    print(f"\nTop 10 Feature Importances:")
    print(feature_importance.head(10))
    
    return model, auc_score, feature_importance

def save_model_artifacts(model, auc_score, feature_importance):
    """Save model and metadata"""
    # Save model
    model_path = save_model(model, "churn_model_v1")
    
    # Save metadata
    metadata = {
        "model_version": "churn_v1",
        "model_type": "lightgbm",
        "auc_score": float(auc_score),
        "feature_names": feature_importance['feature'].tolist(),
        "feature_importance": feature_importance.to_dict('records'),
        "training_date": pd.Timestamp.now().isoformat(),
        "target": "churn_30d"
    }
    
    save_meta("churn_model_v1", metadata)
    
    # Save feature importance separately
    feature_importance.to_csv(MODELS / "churn_feature_importance.csv", index=False)
    
    print(f"\nModel saved to: {model_path}")
    print(f"Metadata saved with AUC: {auc_score:.4f}")
    
    return metadata

def main():
    """Main training pipeline"""
    print("Starting churn model training...")
    
    # Load data
    df = load_training_data()
    
    # Prepare features
    X, y, feature_names = prepare_features(df)
    
    # Train model
    model, auc_score, feature_importance = train_churn_model(X, y, feature_names)
    
    # Save artifacts
    metadata = save_model_artifacts(model, auc_score, feature_importance)
    
    print("\nTraining completed successfully!")
    return model, metadata

if __name__ == "__main__":
    main()
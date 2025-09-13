# main.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict
import pandas as pd
import numpy as np
from datetime import datetime
from .services.model_utils import load_model, load_meta
import subprocess
import threading

app = FastAPI(title="Subscription Churn Prediction Service", version="1.0.0")

class ChurnPredictionRequest(BaseModel):
    subscription_id: int
    as_of_date: Optional[str] = None

class ChurnPredictionResponse(BaseModel):
    subscription_id: int
    as_of_date: str
    churn_probability_30d: float
    risk_level: str
    top_risk_reasons: List[Dict[str, float]]
    model_version: str

class PlanRecommendationRequest(BaseModel):
    user_id: int
    current_plan_id: Optional[int] = None
    top_k: int = 3

@app.get("/")
def root():
    return {"message": "Subscription Churn Prediction Service", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "churn_prediction"}

@app.get("/api/v1/models")
def list_models():
    """List available models and their metadata"""
    try:
        churn_meta = load_meta("churn_model_v1")
        if churn_meta:
            return {
                "models": {
                    "churn_prediction": {
                        "version": churn_meta.get("model_version", "v1"),
                        "auc_score": churn_meta.get("auc_score"),
                        "training_date": churn_meta.get("training_date"),
                        "status": "available"
                    }
                }
            }
        else:
            return {"models": {}, "message": "No trained models found"}
    except Exception as e:
        return {"error": str(e), "models": {}}

@app.post("/api/v1/predict/churn", response_model=ChurnPredictionResponse)
def predict_churn(request: ChurnPredictionRequest):
    """Predict churn probability for a subscription"""
    try:
        # Load model and metadata
        model = load_model("churn_model_v1")
        metadata = load_meta("churn_model_v1")
        
        if model is None or metadata is None:
            raise HTTPException(status_code=404, detail="Churn model not found. Train the model first.")
        
        # For demo purposes, we'll simulate feature extraction
        # In production, this would fetch real data from the database
        features = _simulate_subscription_features(request.subscription_id)
        
        # Make prediction
        probability = model.predict([features])[0]
        
        # Determine risk level
        if probability >= 0.7:
            risk_level = "high"
        elif probability >= 0.4:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        # Get top risk reasons (feature importance)
        top_reasons = _get_top_risk_reasons(features, metadata.get("feature_importance", []))
        
        # Prepare response
        as_of_date = request.as_of_date or datetime.now().strftime("%Y-%m-%d")
        
        return ChurnPredictionResponse(
            subscription_id=request.subscription_id,
            as_of_date=as_of_date,
            churn_probability_30d=float(probability),
            risk_level=risk_level,
            top_risk_reasons=top_reasons,
            model_version=metadata.get("model_version", "v1")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/api/v1/recommend/plan")
def recommend_plan(request: PlanRecommendationRequest):
    """Recommend plans for a user (simple collaborative filtering)"""
    # This is a placeholder implementation
    # In production, this would use a trained recommendation model
    recommended_plans = [
        {"plan_id": 1, "plan_name": "Premium", "score": 0.85, "reason": "High engagement users prefer this plan"},
        {"plan_id": 2, "plan_name": "Standard", "score": 0.72, "reason": "Good balance of features and price"},
        {"plan_id": 3, "plan_name": "Basic", "score": 0.58, "reason": "Cost-effective option"}
    ]
    
    return {
        "user_id": request.user_id,
        "recommendations": recommended_plans[:request.top_k]
    }

@app.post("/api/v1/retrain")
def retrain_model(background_tasks: BackgroundTasks):
    """Trigger model retraining in background"""
    def run_training():
        try:
            # Run preprocessing first
            subprocess.run(["python", "-m", "app.services.preprocessing"], check=True)
            # Then train the model
            subprocess.run(["python", "-m", "app.services.train_churn"], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Training failed: {e}")
    
    thread = threading.Thread(target=run_training, daemon=True)
    thread.start()
    
    return {"status": "retrain_started", "message": "Model retraining initiated in background"}

def _simulate_subscription_features(subscription_id: int) -> List[float]:
    """Simulate feature extraction for demo purposes"""
    # In production, this would query the database and extract real features
    np.random.seed(subscription_id)  # For consistent demo results
    
    features = [
        np.random.uniform(1, 365),      # days_since_start
        np.random.uniform(-30, 30),     # days_until_end
        np.random.choice([0, 1]),       # is_near_end
        np.random.poisson(5),           # num_events_total
        np.random.poisson(2),           # num_renewals
        np.random.poisson(1),           # num_events_last_30d
        np.random.uniform(50, 500),     # total_amount
        np.random.uniform(10, 100),     # avg_amount
        np.random.poisson(3),           # num_payments
        np.random.poisson(0.5),         # num_failed_payments
        np.random.uniform(9.99, 99.99), # price
        0,  # subscription_type (encoded)
        1   # status (encoded)
    ]
    
    return features

def _get_top_risk_reasons(features: List[float], feature_importance: List[Dict]) -> List[Dict[str, float]]:
    """Get top risk reasons based on feature values and importance"""
    if not feature_importance:
        return []
    
    # Simulate top risk factors
    top_reasons = [
        {"feature": "num_failed_payments", "value": features[9], "impact": 0.15},
        {"feature": "days_until_end", "value": features[1], "impact": 0.12},
        {"feature": "num_events_last_30d", "value": features[5], "impact": 0.08}
    ]
    
    return top_reasons[:3]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
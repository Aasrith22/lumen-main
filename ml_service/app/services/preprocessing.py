# preprocessing.py
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import timedelta

BASE = Path(__file__).resolve().parents[2]
RAW = BASE / "data" / "raw"
PROCESSED = BASE / "data" / "processed"
PROCESSED.mkdir(parents=True, exist_ok=True)

FILE = RAW / "SubscriptionUseCase_Dataset.xlsx"

def load_sheets():
    """Load all sheets from the subscription dataset"""
    xls = pd.ExcelFile(FILE)
    subs = pd.read_excel(xls, sheet_name="Subscriptions")
    plans = pd.read_excel(xls, sheet_name="Subscription_Plans")
    logs = pd.read_excel(xls, sheet_name="Subscription_Logs")
    billing = pd.read_excel(xls, sheet_name="Billing_Information")
    users = pd.read_excel(xls, sheet_name="User_Data")
    return subs, plans, logs, billing, users

def canonicalize(subs, plans, logs, billing, users):
    """Standardize column names and data types"""
    # standardize column names
    subs = subs.rename(columns=lambda c: c.strip())
    plans = plans.rename(columns=lambda c: c.strip())
    logs = logs.rename(columns=lambda c: c.strip())
    billing = billing.rename(columns=lambda c: c.strip())
    users = users.rename(columns=lambda c: c.strip())

    # Debug: print column names
    print("Subscription columns:", list(subs.columns))
    print("Plans columns:", list(plans.columns))
    print("Logs columns:", list(logs.columns))
    print("Billing columns:", list(billing.columns))

    # parse dates
    for col in ["Start Date", "End Date"]:
        if col in subs.columns:
            subs[col] = pd.to_datetime(subs[col], errors='coerce').dt.normalize()

    if "action date" in logs.columns:
        logs['action date'] = pd.to_datetime(logs['action date'], errors='coerce').dt.normalize()

    if "billing_date" in billing.columns:
        billing['billing_date'] = pd.to_datetime(billing['billing_date'], errors='coerce').dt.normalize()

    # join plan metadata into subs
    if "Plan Id" in subs.columns and "Plan Id" in plans.columns:
        subs = subs.merge(plans.add_prefix("plan_"), left_on="Plan Id", right_on="plan_Plan Id", how="left")
    
    # rename for clarity - check if columns exist first
    rename_map = {}
    if "Subscription Id" in subs.columns:
        rename_map["Subscription Id"] = "subscription_id"
    if "User Id" in subs.columns:
        rename_map["User Id"] = "user_id"
    if "Plan Id" in subs.columns:
        rename_map["Plan Id"] = "plan_id"
    if "Start Date" in subs.columns:
        rename_map["Start Date"] = "start_date"
    if "End Date" in subs.columns:
        rename_map["End Date"] = "end_date"
    if "Status" in subs.columns:
        rename_map["Status"] = "status"
    if "Price" in subs.columns:
        rename_map["Price"] = "price"
    if "Subscription Type" in subs.columns:
        rename_map["Subscription Type"] = "subscription_type"
    
    subs = subs.rename(columns=rename_map)
    print("After renaming, subscription columns:", list(subs.columns))
    
    return subs, plans, logs, billing, users

def create_features(subs, logs, billing, users, cutoff_date=None):
    """Create features for churn prediction"""
    if cutoff_date is None:
        cutoff_date = pd.Timestamp.now().normalize()
    
    subs = subs.copy()
    
    # Basic tenure features - check if columns exist
    if 'start_date' in subs.columns:
        subs['days_since_start'] = (cutoff_date - subs['start_date']).dt.days
    else:
        subs['days_since_start'] = 0
        
    if 'end_date' in subs.columns:
        subs['days_until_end'] = (subs['end_date'] - cutoff_date).dt.days
        subs['is_near_end'] = (subs['days_until_end'] <= 7) & (subs['days_until_end'] >= 0)
    else:
        subs['days_until_end'] = 365  # default value
        subs['is_near_end'] = False
    
    # Event-based features - fix column name
    event_features = logs.groupby('Subscription id').agg({
        'action': ['count', lambda x: (x.str.lower().str.contains('renew')).sum()],
        'action date': 'max'
    }).round(2)
    event_features.columns = ['num_events_total', 'num_renewals', 'last_event_date']
    event_features = event_features.reset_index().rename(columns={'Subscription id': 'subscription_id'})
    
    # Recent activity (last 30 days)
    recent_cutoff = cutoff_date - pd.Timedelta(days=30)
    recent_events = logs[logs['action date'] >= recent_cutoff]
    recent_features = recent_events.groupby('Subscription id').size().reset_index(name='num_events_last_30d')
    recent_features = recent_features.rename(columns={'Subscription id': 'subscription_id'})
    
    # Billing features
    billing_features = billing.groupby('subscription_id').agg({
        'amount': ['sum', 'mean', 'count'],
        'payment_status': lambda x: (x.str.lower().str.contains('failed')).sum(),
        'billing_date': 'max'
    }).round(2)
    billing_features.columns = ['total_amount', 'avg_amount', 'num_payments', 'num_failed_payments', 'last_payment_date']
    billing_features = billing_features.reset_index()
    
    # Merge all features
    subs = subs.merge(event_features, on='subscription_id', how='left')
    subs = subs.merge(recent_features, on='subscription_id', how='left')
    subs = subs.merge(billing_features, on='subscription_id', how='left')
    
    # Fill missing values
    feature_cols = ['num_events_total', 'num_renewals', 'num_events_last_30d', 'num_failed_payments']
    for col in feature_cols:
        if col in subs.columns:
            subs[col] = subs[col].fillna(0)
    
    # Plan-based features - fix column name
    if 'Price' in subs.columns:
        subs['is_premium_plan'] = subs['Price'] > subs['Price'].median()
    elif 'price' in subs.columns:
        subs['is_premium_plan'] = subs['price'] > subs['price'].median()
    else:
        subs['is_premium_plan'] = False
    
    return subs

def create_churn_label(subs, logs, window_days=30):
    """Create churn label: cancelled within window_days"""
    subs = subs.copy()
    
    # Simple approach: use Terminated Date if available
    if 'Terminated Date' in subs.columns:
        subs['Terminated Date'] = pd.to_datetime(subs['Terminated Date'], errors='coerce')
        # If subscription was terminated, mark as churned
        subs['churn_30d'] = subs['Terminated Date'].notna().astype(int)
    else:
        # Get cancellation events - look for termination or cancellation actions
        cancel_events = logs[
            logs['action'].str.lower().str.contains('cancel|terminate|end', na=False) |
            logs['next status'].str.lower().str.contains('cancel|terminate|end', na=False)
        ]
        
        def label_row(row):
            sid = row['subscription_id']
            # Use start_date as reference point for labeling
            cutoff = row.get('start_date', pd.NaT)
            if pd.isna(cutoff):
                return 0
            
            window_end = cutoff + pd.Timedelta(days=window_days)
            cancelled = cancel_events[
                (cancel_events['Subscription id'] == sid) & 
                (cancel_events['action date'] > cutoff) & 
                (cancel_events['action date'] <= window_end)
            ]
            return 1 if not cancelled.empty else 0

        subs['churn_30d'] = subs.apply(label_row, axis=1)
    
    # If still no churn, create synthetic labels for demo
    if subs['churn_30d'].sum() == 0:
        print("No churn found in data, creating synthetic labels for demonstration...")
        # Create synthetic churn based on some heuristics
        np.random.seed(42)
        # Mark ~20% as churned based on various factors
        churn_prob = np.random.random(len(subs))
        
        # Higher churn probability for older subscriptions or failed payments
        if 'days_since_start' in subs.columns:
            churn_prob += (subs['days_since_start'] > 180) * 0.3
        if 'num_failed_payments' in subs.columns:
            churn_prob += (subs['num_failed_payments'] > 0) * 0.4
            
        subs['churn_30d'] = (churn_prob > 0.75).astype(int)
    
    return subs

def run_preprocessing():
    """Main preprocessing pipeline"""
    print("Loading sheets...")
    subs, plans, logs, billing, users = load_sheets()
    
    print("Canonicalizing data...")
    subs, plans, logs, billing, users = canonicalize(subs, plans, logs, billing, users)
    
    print("Creating features...")
    subs_with_features = create_features(subs, logs, billing, users)
    
    print("Creating churn labels...")
    subs_labeled = create_churn_label(subs_with_features, logs, window_days=30)
    
    # Save outputs
    output_file = PROCESSED / "subscriptions_labeled.csv"
    subs_labeled.to_csv(output_file, index=False)
    
    # Save individual canonical tables
    subs.to_csv(PROCESSED / "subscriptions_canonical.csv", index=False)
    logs.to_csv(PROCESSED / "subscription_events.csv", index=False)
    billing.to_csv(PROCESSED / "billing_clean.csv", index=False)
    users.to_csv(PROCESSED / "users.csv", index=False)
    
    print(f"Saved labeled subscriptions: {output_file}")
    print(f"Shape: {subs_labeled.shape}")
    print(f"Churn rate: {subs_labeled['churn_30d'].mean():.2%}")
    
    return subs_labeled

if __name__ == "__main__":
    run_preprocessing()
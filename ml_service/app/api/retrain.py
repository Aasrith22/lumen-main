# churn_prediction.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from ..services.model_utils import load_model, load_meta
import numpy as np
from datetime import datetime

router = APIRouter()

class ChurnPredictionRequest(BaseModel):
    subscription_id: int
    as_of_date: Optional[str] = None

@router.post("/predict/churn")
def predict_churn(request: ChurnPredictionRequest):
    """Predict churn probability for a subscription"""
    try:
        # Load model and metadata
        model = load_model("churn_model_v1")
        metadata = load_meta("churn_model_v1")
        
        if model is None or metadata is None:
            raise HTTPException(status_code=404, detail="Churn model not found")
        
        # Simulate feature extraction (in production, query database)
        features = _simulate_features(request.subscription_id)
        
        # Make prediction
        probability = model.predict([features])[0]
        
        return {
            "subscription_id": request.subscription_id,
            "churn_probability_30d": float(probability),
            "risk_level": "high" if probability > 0.7 else "medium" if probability > 0.4 else "low",
            "model_version": metadata.get("model_version", "v1")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _simulate_features(subscription_id: int) -> List[float]:
    """Simulate feature extraction for demo"""
    np.random.seed(subscription_id)
    return [
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

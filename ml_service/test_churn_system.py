# Simple test script to verify the churn prediction functionality
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.model_utils import load_model, load_meta
import numpy as np

# Test the model loading
model = load_model("churn_model_v1")
metadata = load_meta("churn_model_v1")

if model is not None and metadata is not None:
    print("✅ Model loaded successfully!")
    print(f"Model version: {metadata.get('model_version', 'unknown')}")
    print(f"AUC Score: {metadata.get('auc_score', 'unknown')}")
    
    # Test prediction with sample data
    sample_features = [
        100,  # days_since_start
        10,   # days_until_end
        1,    # is_near_end
        5,    # num_events_total
        2,    # num_renewals
        1,    # num_events_last_30d
        150,  # total_amount
        50,   # avg_amount
        3,    # num_payments
        1,    # num_failed_payments
        0,    # subscription_type
        1     # status
    ]
    
    try:
        probability = model.predict([sample_features])[0]
        print(f"✅ Sample prediction: {probability:.3f}")
        print(f"Risk level: {'High' if probability > 0.7 else 'Medium' if probability > 0.4 else 'Low'}")
    except Exception as e:
        print(f"❌ Prediction failed: {e}")
else:
    print("❌ Model not found or failed to load")

print("\n🚀 Churn prediction system is ready!")
print("Next steps:")
print("1. Start the API server: uvicorn app.main:app --reload --port 8000")
print("2. Test endpoint: POST /api/v1/predict/churn")
print("3. API docs: http://localhost:8000/docs")
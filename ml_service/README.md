# ML Service - Subscription Churn Prediction

This repository provides a full pipeline for subscription churn analytics and prediction, including data preprocessing, feature engineering, model training, and a FastAPI service for real-time predictions.

## How to Run

### 1. Install Dependencies
```sh
cd ml_service
pip install -r requirements.txt
```

### 2. Prepare Data
- Place your `SubscriptionUseCase_Dataset.xlsx` file in `ml_service/data/raw/`

### 3. Preprocess Data
```sh
python -m app.services.preprocessing
```

### 4. Train the Model
```sh
python -m app.services.train_churn
```

### 5. Start the API Server
```sh
uvicorn app.main:app --reload --port 8000
```

### 6. Test the API
You can use Swagger UI at [http://localhost:8000/docs](http://localhost:8000/docs) or use PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/predict/churn" -Method Post -ContentType "application/json" -Body '{"subscription_id": 1}'
```

## API Endpoints

- `POST /api/v1/predict/churn` — Predict churn probability for a subscription
- `POST /api/v1/recommend/plan` — Recommend plans for a user
- `GET /api/v1/models` — List available models
- `POST /api/v1/retrain` — Trigger retraining

## Project Structure

- `app/` — FastAPI app and ML services
- `data/raw/` — Place your raw Excel data here (do not commit data)
- `data/processed/` — Processed/labeled data (optional to commit)
- `models/` — Trained model artifacts (do not commit large .pkl files)
- `requirements.txt` — Python dependencies
- `README.md` — This file

## What to Commit

**Commit:**
- All code in `app/` and `tests/`
- `requirements.txt`, `README.md`
- Folder structure for `data/` and `models/` (but not the actual data or model files)

**Do NOT commit:**
- Any real data files (Excel, CSVs)
- Large model binaries (`.pkl`)
- Secrets or credentials

## Notes
- The pipeline is ready for analytics, model training, and API integration.
- For analytics, use the processed CSVs in `data/processed/`.
- For backend, use the API endpoints.

---

# model_utils.py
import os, json, joblib
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[2]  # ml_service/
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

def save_model(obj, name: str):
    """Save a model object to disk"""
    path = MODEL_DIR / f"{name}.pkl"
    joblib.dump(obj, path)
    print(f"Model saved to: {path}")
    return str(path)

def load_model(name: str):
    """Load a model object from disk"""
    path = MODEL_DIR / f"{name}.pkl"
    if not path.exists():
        print(f"Model not found: {path}")
        return None
    return joblib.load(path)

def save_meta(name: str, meta: dict):
    """Save model metadata to JSON"""
    p = MODEL_DIR / f"{name}_meta.json"
    with open(p, "w") as f:
        json.dump(meta, f, indent=2, default=str)
    print(f"Metadata saved to: {p}")

def load_meta(name: str):
    """Load model metadata from JSON"""
    p = MODEL_DIR / f"{name}_meta.json"
    if not p.exists():
        print(f"Metadata not found: {p}")
        return None
    with open(p) as f:
        return json.load(f)

def list_available_models():
    """List all available models"""
    models = []
    for pkl_file in MODEL_DIR.glob("*.pkl"):
        model_name = pkl_file.stem
        meta_file = MODEL_DIR / f"{model_name}_meta.json"
        
        model_info = {
            "name": model_name,
            "path": str(pkl_file),
            "size_mb": pkl_file.stat().st_size / (1024 * 1024),
            "created": pd.Timestamp.fromtimestamp(pkl_file.stat().st_mtime).isoformat()
        }
        
        if meta_file.exists():
            model_info["metadata"] = load_meta(model_name)
        
        models.append(model_info)
    
    return models

def get_model_info(name: str):
    """Get detailed info about a specific model"""
    model_path = MODEL_DIR / f"{name}.pkl"
    meta_path = MODEL_DIR / f"{name}_meta.json"
    
    if not model_path.exists():
        return None
    
    info = {
        "name": name,
        "path": str(model_path),
        "size_mb": model_path.stat().st_size / (1024 * 1024),
        "created": pd.Timestamp.fromtimestamp(model_path.stat().st_mtime).isoformat(),
        "exists": True
    }
    
    if meta_path.exists():
        info["metadata"] = load_meta(name)
    else:
        info["metadata"] = None
    
    return info
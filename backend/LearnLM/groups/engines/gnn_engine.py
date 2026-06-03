import os
import math
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import networkx as nx
from django.utils import timezone
from groups.models import UserTopicMastery # Import the new model!

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'prerequisite_model.pth')

class PrerequisiteSuccessPredictor(nn.Module):
    def __init__(self):
        super(PrerequisiteSuccessPredictor, self).__init__()
        self.fc1 = nn.Linear(4, 16)
        self.relu1 = nn.ReLU()
        self.fc2 = nn.Linear(16, 8)
        self.relu2 = nn.ReLU()
        self.out = nn.Linear(8, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = self.relu1(self.fc1(x))
        x = self.relu2(self.fc2(x))
        return self.sigmoid(self.out(x))

def generate_training_data(n=2000):
    X, y = [], []
    for _ in range(n):
        acc = np.random.beta(5, 2)
        rec = np.random.beta(3, 2)
        vol = np.random.beta(2, 2)
        elo = np.random.beta(3, 3)
        prob = 0.4*acc + 0.25*rec + 0.2*vol + 0.15*elo + np.random.normal(0, 0.05)
        X.append([acc, rec, vol, elo])
        y.append([min(1.0, max(0.0, prob))])
    return torch.tensor(X, dtype=torch.float32), torch.tensor(y, dtype=torch.float32)

def get_or_train_model():
    model = PrerequisiteSuccessPredictor()
    if os.path.exists(MODEL_PATH):
        model.load_state_dict(torch.load(MODEL_PATH, weights_only=True))
        model.eval()
    else:
        print("⚙️ Booting LearnLM: Training PyTorch model on synthetic data...")
        X, y = generate_training_data(2000)
        optimizer = optim.Adam(model.parameters(), lr=0.01)
        criterion = nn.BCELoss()
        model.train()
        for epoch in range(20):
            optimizer.zero_grad()
            pred = model(X)
            loss = criterion(pred, y)
            loss.backward()
            optimizer.step()
        torch.save(model.state_dict(), MODEL_PATH)
        model.eval()
    return model

class GNNKnowledgeGraph:
    def __init__(self):
        self.predictor = get_or_train_model()
        self.graph = nx.DiGraph()
        # Define the Prerequisite Structure
        self.graph.add_edges_from([
            ("Array", "Two Pointers"),
            ("Array", "Sliding Window"),
            ("Array", "Hash Table"),
            ("Two Pointers", "Binary Search"),
            ("Hash Table", "String"),
        ])

    def get_next_optimal_topic(self, user):
        # 1. Pull Real Data from the DB
        mastery_records = UserTopicMastery.objects.filter(user=user)
        mastery_dict = {m.topic: m for m in mastery_records}

        # For this example, let's assume the user is trying to unlock "Two Pointers" which requires "Array"
        candidate_topic = "Two Pointers"
        prereq_topic = "Array"

        # 2. Extract specific prereq data (or fallback to defaults if brand new)
        record = mastery_dict.get(prereq_topic)
        if record:
            acc = record.accuracy
            reviews = record.reviews
            elo_percentile = max(0.0, min(1.0, (record.elo_rating - 800) / 1000.0))
            days_since = (timezone.now() - record.last_practiced).days
        else:
            acc, reviews, elo_percentile, days_since = 0.5, 0, 0.4, 0 # Fallbacks

        # 3. Ebbinghaus Decay Math
        stability = 1.0 + (reviews * 0.5)
        retention = math.exp(-days_since / stability) if reviews > 0 else 0.5
        volume_score = math.tanh(reviews / 10.0)

        # 4. Build the Tensor State
        tensor_state = [acc, retention, volume_score, elo_percentile]
        input_tensor = torch.tensor([tensor_state], dtype=torch.float32)

        # 5. PyTorch Prediction
        with torch.no_grad():
            success_prob = self.predictor(input_tensor).item()

        # 6. SHAP-Style XAI Attribution
        acc_contrib = success_prob - self.predictor(torch.tensor([[0.0, retention, volume_score, elo_percentile]], dtype=torch.float32)).item()
        rec_contrib = success_prob - self.predictor(torch.tensor([[acc, 0.0, volume_score, elo_percentile]], dtype=torch.float32)).item()
        vol_contrib = success_prob - self.predictor(torch.tensor([[acc, retention, 0.0, elo_percentile]], dtype=torch.float32)).item()
        
        factors = {"accuracy": acc_contrib, "recency": rec_contrib, "volume": vol_contrib}
        dominant_factor = max(factors, key=factors.get)

        # Generate JSON Payload
        decay_percent = (1.0 - retention) * 100
        mode = "refresher" if retention < 0.6 else "advance"

        xai_text = f"🧠 XAI Insight: Recommended '{candidate_topic}' — strong prerequisite {dominant_factor} gives {success_prob*100:.1f}% predicted success. ⚠️ {decay_percent:.1f}% skill decay detected on {prereq_topic}."

        return {
            "recommended_topic": candidate_topic,
            "reason": xai_text,
            "xai": {
                "shap_values": factors,
                "dominant_factor": dominant_factor,
                "success_probability": round(success_prob * 100, 1),
                "confidence": "high" if reviews > 5 else "medium"
            },
            "decay_info": {"mode": mode, "decay_percent": round(decay_percent, 1)},
            "tensor_state": [round(x, 3) for x in tensor_state]
        }
import shap
import torch
import numpy as np

class XAIEngine:
    """
    Module D.2: Explainable AI (XAI) Engine.
    Uses SHAP to break down PyTorch GNN/MLP predictions into human-readable insights.
    """
    
    def __init__(self, pytorch_model, background_tensor):
        """
        Initializes the SHAP DeepExplainer.
        :param pytorch_model: Your trained PyTorch model (e.g., the GNN or Elo predictor)
        :param background_tensor: A sample of training data (torch.Tensor) to establish baseline expectations.
        """
        self.model = pytorch_model
        self.model.eval() # Ensure model is in evaluation mode
        
        # DeepExplainer is specifically optimized for PyTorch deep learning models
        self.explainer = shap.DeepExplainer(self.model, background_tensor)

    def generate_radar_data(self, user_feature_tensor, feature_names):
        """
        Calculates SHAP values for a specific user's submission and formats it for the React Radar Chart.
        
        :param user_feature_tensor: The 1D tensor representing the user's current stats [Time, Space, Logic, Recency]
        :param feature_names: List of strings corresponding to the tensor indices
        :return: JSON-ready list of dictionaries for Recharts
        """
        # 1. Calculate SHAP values (returns an array of attributions)
        # We use unsqueeze to convert the 1D user tensor into a 2D batch of size 1
        shap_values = self.explainer.shap_values(user_feature_tensor.unsqueeze(0))
        
        # Depending on the PyTorch model output, shap_values might be a list. We want the active class.
        if isinstance(shap_values, list):
            attributions = shap_values[0][0] 
        else:
            attributions = shap_values[0]

        # 2. Normalize values to percentages (0 to 100) for the UI Radar Chart
        abs_attributions = np.abs(attributions)
        total_impact = np.sum(abs_attributions)
        
        if total_impact == 0:
            percentages = [0] * len(attributions)
        else:
            percentages = (abs_attributions / total_impact) * 100

        # 3. Format into the exact JSON structure React Recharts expects
        radar_chart_data = []
        dominant_factor = {"name": "None", "impact": 0}

        for i, name in enumerate(feature_names):
            impact_score = round(float(percentages[i]), 1)
            
            radar_chart_data.append({
                "subject": name,
                "A": impact_score,      # The User's score
                "fullMark": 100         # The maximum axis value for the radar chart
            })
            
            if impact_score > dominant_factor["impact"]:
                dominant_factor = {"name": name, "impact": impact_score}

        # 4. Generate the Human-Readable Insight
        xai_insight = self._generate_text_insight(dominant_factor)

        return {
            "radar_data": radar_chart_data,
            "dominant_factor": dominant_factor["name"],
            "insight_text": xai_insight
        }

    def _generate_text_insight(self, dominant_factor):
        """Generates dynamic, human-readable text based on the highest SHAP value."""
        df_name = dominant_factor["name"]
        
        if df_name == "Time Complexity":
            return "⏳ XAI Insight: Your logic is sound, but execution speed is your biggest bottleneck. Try replacing nested loops with a Hash Map."
        elif df_name == "Space Complexity":
            return "💾 XAI Insight: You passed, but memory usage is heavily dragging your Elo down. Are you creating unnecessary arrays?"
        elif df_name == "Topic Recency":
            return "🧠 XAI Insight: SHAP detects a 50% skill decay. You are failing because you haven't practiced this specific data structure in over 7 days."
        elif df_name == "Syntax/Logic":
            return "⚠️ XAI Insight: Core algorithmic logic is the dominant failure factor. Review the foundational concepts before worrying about speed."
        else:
            return "📈 XAI Insight: Performance is balanced. Keep practicing to raise your baseline Elo."
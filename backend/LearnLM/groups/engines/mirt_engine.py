import math

class MIRTEngine:
    """
    Multidimensional Item Response Theory (MIRT) Engine.
    Tracks user's latent abilities across logic, syntax, and optimization.
    """
    @staticmethod
    def calculate_probability(latent_logic: float, latent_syntax: float, latent_optimization: float, difficulty: float) -> float:
        """
        Computes P(correct) using a simplified 3PL-style logistic function on 3 dimensions.
        Difficulty is scaled from standard Elo (1200-2000) down to IRT bounds.
        """
        b = (difficulty - 1200) / 400.0
        theta_sum = latent_logic + latent_syntax + latent_optimization
        
        exponent = -(theta_sum - b)
        try:
            return 1.0 / (1.0 + math.exp(exponent))
        except OverflowError:
            return 0.0

    @staticmethod
    def update_latents(logic: float, syntax: float, opt: float, status: str, difficulty: float):
        """
        Updates specific latent axes depending on the exact failure mode.
        """
        lr = 0.1  # learning rate
        
        if status == "accepted":
            logic += lr
            syntax += lr
            opt += lr
        elif status == "compile_error":
            syntax -= lr * 2
        elif status == "time_limit":
            opt -= lr * 2
        elif status in ["wrong_answer", "runtime_error"]:
            logic -= lr * 2
            
        # Bound latents to reasonable IRT values (-4.0 to 4.0)
        return {
            "latent_logic": max(-4.0, min(4.0, logic)),
            "latent_syntax": max(-4.0, min(4.0, syntax)),
            "latent_optimization": max(-4.0, min(4.0, opt))
        }

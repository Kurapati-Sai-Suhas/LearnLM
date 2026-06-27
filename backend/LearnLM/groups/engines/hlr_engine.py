import math

class HLREngine:
    """
    Continuous Half-Life Regression model for predicting memory decay.
    Replaces the legacy, discrete SM-2 Spaced Repetition engine.
    """
    
    @staticmethod
    def calculate_memory_state(time_since_last_review_days: float, halflife: float) -> float:
        """
        Calculates the probability of recall P(t) = 2 ^ (-t / h)
        """
        if halflife <= 0:
            return 0.0
        return math.pow(2.0, -time_since_last_review_days / halflife)

    @staticmethod
    def update_halflife(quality: int, prev_halflife: float) -> float:
        """
        Updates the half-life based on the user's performance.
        quality: 0-5 scale (5=perfect recall, 0=complete blackout)
        """
        if prev_halflife < 1.0:
            prev_halflife = 1.0
            
        if quality >= 4:
            return prev_halflife * 2.5 # Mastered easily
        elif quality == 3:
            return prev_halflife * 1.2 # Passed but struggled
        else:
            # Failed to recall, decay half-life drastically to force review
            return max(1.0, prev_halflife * 0.3)

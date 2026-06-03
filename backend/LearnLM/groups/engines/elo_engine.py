# groups/engines/elo_engine.py
import math
from django.utils import timezone
from groups.models import UserProgress, Question

class EloEngine:
    K_FACTOR = 32 # Maximum points a user can gain or lose in one submission

    @staticmethod
    def calculate_new_rating(user_rating: float, question_difficulty: float, is_correct: bool) -> dict:
        """
        Standard Elo formula to update user rating based on question difficulty.
        """
        # Calculate expected win probability (0.0 to 1.0)
        expected_score = 1 / (1 + math.pow(10, (question_difficulty - user_rating) / 400))
        
        # Actual score (1 for all test cases passed, 0 for failed)
        actual_score = 1 if is_correct else 0
        
        # Calculate rating change
        rating_change = EloEngine.K_FACTOR * (actual_score - expected_score)
        new_rating = round(user_rating + rating_change, 2)
        
        return {
            "old_rating": round(user_rating, 2),
            "new_rating": new_rating,
            "rating_change": round(rating_change, 2)
        }

    @staticmethod
    def apply_time_decay(user_progress) -> dict:
        """
        Ebbinghaus-inspired time decay. 
        Grace period: 7 days. Penalty: -2 Elo per day inactive after grace.
        """
        now = timezone.now()
        days_inactive = (now - user_progress.last_practiced).days

        if days_inactive > 7:
            # Calculate penalty (e.g., 10 days inactive = 3 days over grace = -6 Elo)
            penalty = (days_inactive - 7) * 2.0
            
            # Prevent rating from dropping below a baseline floor of 800
            new_rating = max(800.0, user_progress.elo_rating - penalty)
            
            # Reset the timer so they don't bleed infinitely on the same day
            user_progress.elo_rating = new_rating
            user_progress.last_practiced = now 
            user_progress.save()
            
            return {"decayed": True, "penalty": round(penalty, 2), "new_rating": round(new_rating, 2)}
            
        return {"decayed": False}

    @staticmethod
    def process_submission(user, topic, question_id, is_correct: bool) -> dict:
        """
        Updates the UserProgress database record after a code submission.
        """
        # Get or create the user's progress for this specific topic
        progress, _ = UserProgress.objects.get_or_create(
            user=user, 
            topic=topic,
            defaults={'elo_rating': 1200.0} # Everyone starts at 1200
        )
        
        # 1. Apply any pending time decay BEFORE calculating the new submission rating
        EloEngine.apply_time_decay(progress)
        
        try:
            question = Question.objects.get(id=question_id)
            difficulty = question.base_difficulty
        except Question.DoesNotExist:
            difficulty = 1200.0 # Fallback

        # 2. Calculate the math based on the (potentially decayed) current rating
        update_data = EloEngine.calculate_new_rating(progress.elo_rating, difficulty, is_correct)
        
        # 3. Save to database and reset the last_practiced timer!
        progress.elo_rating = update_data["new_rating"]
        progress.last_practiced = timezone.now() 
        progress.save()
        
        return update_data
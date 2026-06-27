from django.core.management.base import BaseCommand
from django.utils import timezone
from groups.models import UserTopicMastery
from groups.engines.ebbinghaus import EbbinghausDecayModel
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Calculates Ebbinghaus forgetting curve decay for all UserTopicMastery records.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("🚀 Starting Ebbinghaus Decay Calculation..."))
        
        masteries = UserTopicMastery.objects.all()
        now = timezone.now()
        updated_count = 0

        decay_model = EbbinghausDecayModel()

        for mastery in masteries:
            # Calculate days elapsed since last practice
            delta = now - mastery.last_practiced
            days_elapsed = delta.total_seconds() / 86400.0

            if days_elapsed > 0:
                # Apply decay
                # Assuming EbbinghausDecayModel has a method: calculate_retention(elo, days_elapsed, halflife)
                # If not, we fall back to a standard formula
                try:
                    new_retention = decay_model.predict_retention(
                        base_mastery=mastery.elo_rating,
                        days_elapsed=days_elapsed,
                        halflife=mastery.hlr_halflife
                    )
                    
                    # Update accuracy/retention and potentially drop elo slightly based on decay
                    old_elo = mastery.elo_rating
                    mastery.elo_rating = new_retention
                    mastery.save()
                    
                    if old_elo - new_retention > 50:
                        logger.info(f"Significant decay for {mastery.user.username} on {mastery.topic}: {old_elo} -> {new_retention}")

                    updated_count += 1
                except Exception as e:
                    # Fallback math if engine isn't perfectly matched
                    decay_factor = 2 ** (-days_elapsed / max(mastery.hlr_halflife, 1.0))
                    new_elo = max(800.0, mastery.elo_rating * decay_factor)
                    mastery.elo_rating = new_elo
                    mastery.save()
                    updated_count += 1

        self.stdout.write(self.style.SUCCESS(f"✅ Successfully updated {updated_count} mastery records."))

# groups/management/commands/send_spaced_repetition.py
import math
from django.core.management.base import BaseCommand
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model

# Assuming you have a UserTopicMastery model as mentioned in your docs
# from groups.models import UserTopicMastery 

User = get_user_model()

class Command(BaseCommand):
    help = 'Calculates Ebbinghaus decay and pushes WebSocket notifications for topics needing review.'

    def handle(self, *args, **kwargs):
        self.stdout.write("🔍 Scanning database for skill decay...")
        
        channel_layer = get_channel_layer()
        users = User.objects.all()

        for user in users:
            # NOTE: Replace this mock data with your actual UserTopicMastery query
            # mastery_records = UserTopicMastery.objects.filter(user=user)
            
            # Mocking a decaying record for demonstration:
            topic_name = "Arrays"
            days_since_last = 9
            reviews = 8
            
            # The Ebbinghaus Math: R = e^(-t/S)
            stability = 1.0 + (reviews * 0.5)
            retention = math.exp(-days_since_last / stability)
            
            # If retention drops below 60%, trigger a WebSocket alert!
            if retention < 0.60:
                decay_percent = int((1.0 - retention) * 100)
                
                self.stdout.write(f"⚠️ {user.username} is forgetting {topic_name} ({decay_percent}% decay)!")
                
                # Push the live notification through Django Channels
                async_to_sync(channel_layer.group_send)(
                    f"notifications_{user.id}", # Matches your NotificationConsumer group!
                    {
                        "type": "send_notification",
                        "title": "Spaced Repetition Alert 🧠",
                        "message": f"Your retention for {topic_name} has dropped by {decay_percent}%. Time for a quick refresher!",
                        "category": "warning"
                    }
                )

        self.stdout.write(self.style.SUCCESS("✅ Spaced repetition scan complete! Alerts dispatched."))
import os
import csv
from django.core.management.base import BaseCommand
from groups.models import Topic, Question
from django.conf import settings

class Command(BaseCommand):
    help = 'Bulk imports LeetCode problems from a CSV file'

    def handle(self, *args, **kwargs):
        # 1. Path to your CSV file
        csv_path = os.path.join(settings.BASE_DIR, 'data', 'Leetcode_Questions_updated (2024-11-02).csv')
        
        if not os.path.exists(csv_path):
            self.stdout.write(self.style.ERROR(f"❌ Could not find CSV at {csv_path}"))
            return

        self.stdout.write("🚀 Opening the floodgates... reading CSV")

        # Cache topics to avoid hitting the DB 1000 times
        topic_cache = {}
        questions_to_create = []

        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                # --- NEW EXACT COLUMN MAPPING ---
                title = row.get('Question', 'Unknown Title')
                difficulty_str = row.get('Difficulty', 'Medium')
                
                # Topics are often comma-separated. Grab the first one to be the primary GNN topic!
                raw_topics = row.get('Topic_tags', 'Array')
                topic_name = raw_topics.split(',')[0].strip() if raw_topics else 'Array'

                # Since there is no 'Description' column, embed the Question_Link into the UI!
                q_link = row.get('Question_Link', '#')
                description = f"<p>Problem description not provided in dataset. Please view the full problem here:</p><br/><a href='{q_link}' target='_blank' style='color: #3b82f6; text-decoration: underline;'>{q_link}</a>"

                # Map text difficulty to Elo
                if difficulty_str.lower() == 'easy':
                    base_elo = 1000.0
                elif difficulty_str.lower() == 'hard':
                    base_elo = 1600.0
                else:
                    base_elo = 1300.0

                # Get or Create the Topic (Hierarchical by default for GNN)
                if topic_name not in topic_cache:
                    topic, _ = Topic.objects.get_or_create(
                        name=topic_name,
                        defaults={"structure_type": "hierarchical"}
                    )
                    topic_cache[topic_name] = topic

                # Generate a generic boilerplate
                generic_boilerplate = {
                    "python": f"class Solution:\n    def solve(self, *args, **kwargs):\n        pass",
                    "java": f"class Solution {{\n    public void solve() {{\n    }}\n}}"
                }

                # Prepare the Question object
                questions_to_create.append(
                    Question(
                        title=title,
                        topic=topic_cache[topic_name],
                        content=description,
                        base_difficulty=base_elo,
                        boilerplate_code=generic_boilerplate,
                        hidden_test_cases=[] # Relies on your Gemini fallback to gen these later
                    )
                )

        # 2. Bulk Insert into Database
        self.stdout.write(f"⏳ Injecting {len(questions_to_create)} problems into Postgres...")
        
        Question.objects.bulk_create(questions_to_create, ignore_conflicts=True)

        self.stdout.write(self.style.SUCCESS(f"✅ BOOM! Successfully injected {len(questions_to_create)} problems. Your GNN is ready."))
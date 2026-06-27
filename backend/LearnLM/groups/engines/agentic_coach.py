import json
import os
import requests
import logging
from django.conf import settings
from groups.models import AgenticCoachLog

logger = logging.getLogger(__name__)

def trigger_agentic_coach(user, problem_id, code_snippet, error_logs, failed_attempts):
    """
    Triggers the n8n webhook that runs the Gemini AI agent.
    If N8N_WEBHOOK_URL is not set, it gracefully falls back to a mock Socratic hint.
    """
    webhook_url = os.environ.get('N8N_WEBHOOK_URL')
    
    # 1. Design the Webhook Payload with 3-Tier Escalation
    if failed_attempts < 5:
        context = "Student has failed 3 times. Generate a Socratic conceptual nudge without giving the exact answer."
    elif failed_attempts < 7:
        context = "Student has failed 5 times. Give them the pseudocode structure for this algorithm."
    else:
        context = "Student has failed 7+ times. Give them a worked example with a full explanation."

    payload = {
        "user_id": user.id,
        "username": user.username,
        "problem_id": problem_id,
        "failed_attempts": failed_attempts,
        "code_snippet": code_snippet,
        "error_logs": error_logs,
        "context": context
    }
    
    print(f"\n\n===========================================")
    print(f"🚀 [AGENTIC COACH] Fired for user {user.username} on problem {problem_id}")
    print(f"Webhook URL found in .env: {webhook_url}")
    print(f"===========================================\n\n")
    
    # 2. Fire to n8n if available, otherwise Mock
    mocked_hint = ""
    if webhook_url:
        try:
            print(f"🌐 Firing real n8n webhook POST to: {webhook_url}")
            response = requests.post(webhook_url, json=payload, timeout=10)
            print(f"🌐 n8n webhook returned status code: {response.status_code}")
            if response.status_code == 200:
                # Assuming n8n returns the hint in a JSON field "hint"
                n8n_data = response.json()
                mocked_hint = n8n_data.get("hint", "🧠 Agentic Coach: " + response.text)
                print(f"✅ Extracted Hint from n8n: {mocked_hint}")
            else:
                print(f"❌ n8n webhook failed with status {response.status_code}")
        except Exception as e:
            print(f"❌ n8n webhook exception: {e}")
            
    if not mocked_hint:
        print(f"🛡️ Falling back to mock Gemini Response for attempt {failed_attempts}...")
        if failed_attempts < 5:
            mocked_hint = (
                "🧠 *Agentic Coach Insight (Nudge)*: I noticed you're struggling with the loop bounds. "
                "Try tracing the variables on a piece of paper for a small input like [1, 2]."
            )
        elif failed_attempts < 7:
            mocked_hint = (
                "🧠 *Agentic Coach Insight (Pseudocode)*: Here is the structure you need:\n"
                "1. Initialize a pointer at 0.\n"
                "2. Loop through the array.\n"
                "3. If condition met, swap and increment pointer."
            )
        else:
            mocked_hint = (
                "🧠 *Agentic Coach Insight (Worked Example)*: Let's walk through the exact solution. "
                "We need to maintain two pointers. Here is a similar example showing how to structure your `while` loop..."
            )
    
    # 3. Log to Database
    AgenticCoachLog.objects.create(
        user=user,
        problem_id=problem_id,
        failed_attempts_count=failed_attempts,
        generated_hint=mocked_hint,
        webhook_fired=bool(webhook_url)
    )
    
    return mocked_hint

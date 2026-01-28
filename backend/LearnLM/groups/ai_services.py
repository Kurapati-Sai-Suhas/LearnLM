import google.generativeai as genai
import json
import os

# 👇 PASTE YOUR KEY HERE
GOOGLE_API_KEY = "AIzaSyAyv2GkvtQtJVSub-yUbWvsgwnQCfQ3j3Q"

genai.configure(api_key=GOOGLE_API_KEY)

# --- 1. SMART MODEL SELECTOR ---
def get_working_model():
    """
    Automatically finds a model that supports 'generateContent'.
    Fixes the 404 error by asking Google what is available.
    """
    try:
        # List all models
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                # Return the first working model (e.g., models/gemini-pro or models/gemini-1.5-flash)
                print(f"✅ Found working AI Model: {m.name}")
                return genai.GenerativeModel(m.name)
        
        # Fallback if list fails
        print("⚠️ Could not list models, trying default 'gemini-pro'...")
        return genai.GenerativeModel('gemini-pro')
    except Exception as e:
        print(f"⚠️ Model list error: {e}. Defaulting to 'gemini-pro'")
        return genai.GenerativeModel('gemini-pro')

# Initialize the model ONCE
model = get_working_model()

# Helper to clean AI response
def clean_json_text(text):
    text = text.strip()
    if text.startswith("```json"): text = text[7:]
    elif text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    return text

# --- 2. AI FUNCTIONS ---

def generate_flashcards_with_gemini(text_content, topic="General"):
    prompt = f"""
    You are a teacher. Create 5 flashcards about '{topic}' based on this text.
    Strictly output a JSON Array only. No markdown.
    Format: [ {{"front": "Question", "back": "Answer"}}, ... ]
    TEXT: {text_content[:4000]}
    """
    try:
        print(f"🤖 Generating Flashcards...")
        response = model.generate_content(prompt)
        return json.loads(clean_json_text(response.text))
    except Exception as e:
        print(f"❌ Flashcard Error: {e}")
        return [{"front": "Error", "back": "AI connection failed."}]

def generate_quiz_with_gemini(text_content, topic="General", difficulty="Medium"):
    prompt = f"""
    Create a 5-question multiple choice quiz about '{topic}' based on this text.
    Difficulty: {difficulty}.
    Strictly output a JSON Array. Format:
    [
        {{
            "question": "What is...?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": "Option A",
            "explanation": "Why A is correct."
        }}
    ]
    TEXT: {text_content[:4000]}
    """
    try:
        print(f"🤖 Generating Quiz...")
        response = model.generate_content(prompt)
        return json.loads(clean_json_text(response.text))
    except Exception as e:
        print(f"❌ Quiz Error: {e}")
        return []

def answer_doubt_with_gemini(text_content, user_question):
    prompt = f"""
    You are a helpful tutor. Answer the student's question based ONLY on the provided study material.
    Use MathJax/Latex for formulas (e.g. $E=mc^2$).
    Keep it concise.
    STUDENT QUESTION: {user_question}
    STUDY MATERIAL: {text_content[:5000]}
    """
    try:
        print(f"🤖 Answering Doubt: {user_question}")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"❌ Doubt Error: {e}")
        return "Sorry, I am having trouble connecting to the AI right now."
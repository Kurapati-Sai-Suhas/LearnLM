import google.generativeai as genai
import json
import re
import PyPDF2
from django.conf import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

class AIService:

    @staticmethod
    def get_model():
        return genai.GenerativeModel('models/gemini-2.5-flash')


    @staticmethod
    def generate_quiz(text, num_questions=5):
        """Generates a quiz, using Gemini's strict JSON mode."""
        if not text or len(text) < 50:
            print("⚠️ Text was empty! Using FALLBACK content for demo.")
            text = "Physics is the study of matter and energy. Newton's laws are cool."

        print(f"📖 Sending {len(text)} chars to AI...")

        # We simplify the prompt because JSON mode handles the formatting!
        prompt = f"""
        Create a {num_questions}-question multiple choice quiz based on the text below.
        Format as a JSON array of objects with keys: "question", "options" (array of strings), and "correct_answer".

        TEXT:
        {text[:15000]}
        """

        try:
            model = AIService.get_model()

            # 🔥 THE SECRET WEAPON: Forces Gemini to output PERFECT JSON 🔥
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            # Because we used JSON mode, we don't need messy regex cleaning anymore!
            return json.loads(response.text)

        except Exception as e:
            print(f"❌ Quiz AI Error: {e}")
            return []

    # (Keep Flashcards and DoubtSolver same as before or copy from previous response)
    @staticmethod
    def generate_flashcards(text, num_cards=10):
        if not text or len(text) < 50:
             text = "Physics is the study of matter. Newton's laws describe motion. Force equals mass times acceleration."

        print(f"📖 Sending {len(text)} chars to AI for Flashcards...")

        prompt = f"""
        Create {num_cards} flashcards based on the text below.
        Format as a JSON array of objects with exactly two keys: "front" (the question or concept) and "back" (the answer or definition).
        TEXT: {text[:10000]}
        """
        try:
            model = AIService.get_model()
            # 🔥 THE SECRET WEAPON: Forces Gemini to output PERFECT JSON 🔥
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"❌ Flashcard AI Error: {e}")
            return []

    @staticmethod
    def get_answer(question, context):
        if not context: 
            context = "General academic knowledge."
            
        print("🤖 Thinking about the student's doubt...")

        # 👇 THE HACKER PROMPT 👇
        prompt = f"""
        You are a helpful and brilliant AI Study Tutor.
        Answer the student's question based on the context provided. Use markdown formatting, bullet points, and math equations (LaTeX) where helpful.

        CRITICAL RULE FOR IMAGES:
        If the student explicitly asks for a "picture", "photo", "image", or "diagram", you MUST generate one using this exact markdown format:
        ![Description of image](https://image.pollinations.ai/prompt/a%20detailed%20description%20of%20the%20image%20with%20%20no%20spaces%20just%20%20%20like%20this)

        Example: If they ask for a picture of a black hole, output:
        ![Black Hole](https://image.pollinations.ai/prompt/A%20realistic%20high%20quality%20space%20photo%20of%20a%20glowing%20supermassive%20black%20hole)

        CONTEXT:
        {context}
        STUDENT QUESTION:
        {question}
        """

        try:
            model = AIService.get_model()
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"❌ AI Answer Error: {e}")
            return "Sorry, I ran into an error trying to answer that."


    @staticmethod
    def explain_image(image_obj, question="Explain this image in detail."):
        """ Multimodal Vision: Sends an image AND a question to Gemini """
        if not image_obj:
            return "Error: No image provided."
        print("🚀 Sending Image to Gemini Vision...")
        try:
            model = AIService.get_model()
            # 👇 The Magic happens here: Passing a LIST of [text, image]
            response = model.generate_content([question, image_obj])
            return response.text
        except Exception as e:
            print(f"❌ Vision AI Error: {e}")
            return "Sorry, I couldn't analyze that image."
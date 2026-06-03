import json
import io
import PyPDF2
import numpy as np
from django.conf import settings
from PIL import Image as PILImage
import google.generativeai as genai
from transformers import CLIPProcessor, CLIPModel
import torch

# Configure the SDK 
genai.configure(api_key=settings.GEMINI_API_KEY)


class AIService:

    @staticmethod
    def get_model():
        return genai.GenerativeModel('gemini-2.5-flash')

    @staticmethod
    def generate_quiz(text, num_questions=5):
        """Generates a quiz, using Gemini's strict JSON mode."""
        if not text or len(text) < 50:
            print("⚠️ Text was empty! Using FALLBACK content for demo.")
            text = "Physics is the study of matter and energy. Newton's laws are cool."

        print(f"📖 Sending {len(text)} chars to AI...")

        prompt = f"""
        Create a {num_questions}-question multiple choice quiz based on the text below.
        Format as a JSON array of objects with keys: "question", "options" (array of strings), and "correct_answer".

        TEXT:
        {text[:15000]}
        """

        try:
            model = AIService.get_model()
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)

        except Exception as e:
            print(f"❌ Quiz AI Error: {e}")
            return []

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
        """Multimodal Vision: Sends an image AND a question to Gemini"""
        if not image_obj:
            return "Error: No image provided."
        print("🚀 Sending Image to Gemini Vision...")
        try:
            model = AIService.get_model()
            response = model.generate_content([question, image_obj])
            return response.text
        except Exception as e:
            print(f"❌ Vision AI Error: {e}")
            return "Sorry, I couldn't analyze that image."


class VectorSearchService:
    """
    Module B: Visual Semantic Search (UPGRADED to V2)
    Uses OpenAI's CLIP model to extract 512-dim semantic feature vectors.
    Massive accuracy improvement for abstract diagrams and UI screenshots.
    """
    _model = None
    _processor = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            print("🧠 Downloading & Loading HuggingFace CLIP Model (this takes a minute on first run)...")
            cls._model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            cls._processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            print("✅ CLIP Model loaded successfully!")
        return cls._model, cls._processor

    @classmethod
    def extract_vector(cls, image_file) -> list:
        """
        Takes a Django InMemoryUploadedFile or file path,
        returns a 512-dim float list (the feature vector).
        """
        model, processor = cls.get_model()

        # Handle both file objects and file paths safely
        if hasattr(image_file, 'read'):
            raw_bytes = image_file.read()
            image_file.seek(0)
            img = PILImage.open(io.BytesIO(raw_bytes)).convert('RGB')
        else:
            img = PILImage.open(image_file).convert('RGB')

        # Pass image through CLIP
        inputs = processor(images=img, return_tensors="pt")
        with torch.no_grad():
            outputs = model.get_image_features(**inputs)
            
            # THE FIX: Sometimes HuggingFace returns an object, sometimes a raw tensor. 
            # We explicitly grab the tensor if it's wrapped in an object.
            if hasattr(outputs, 'pooler_output'):
                image_features = outputs.pooler_output
            else:
                image_features = outputs

        # Normalize the vector (crucial for accurate Cosine Similarity)
        image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
        
        # Squeeze down to 1D array and convert to standard Python list
        vector = image_features.squeeze().tolist()  # Shape: (512,)
        return vector

    @staticmethod
    def cosine_similarity(vec_a: list, vec_b: list) -> float:
        """Pure numpy cosine similarity between two vectors."""
        a = np.array(vec_a)
        b = np.array(vec_b)
        dot = np.dot(a, b)
        norm = np.linalg.norm(a) * np.linalg.norm(b)
        if norm == 0:
            return 0.0
        return float(dot / norm)

    @classmethod
    def find_similar(cls, query_vector: list, documents, top_k=5) -> list:
        """
        Compares query_vector against all Document objects.
        """
        results = []
        for doc in documents:
            if not doc.feature_vector:
                continue
            try:
                stored_vec = json.loads(doc.feature_vector)
                
                # Safety check: Prevent crashing if comparing old MobileNet (1280) to new CLIP (512) vectors
                if len(stored_vec) != len(query_vector):
                    continue
                    
                score = cls.cosine_similarity(query_vector, stored_vec)
                results.append((score, doc))
            except (json.JSONDecodeError, Exception):
                continue

        # Sort by similarity score descending
        results.sort(key=lambda x: x[0], reverse=True)
        return results[:top_k]


class RAGService:
    """
    Context-Aware Doubt Solver utilizing Gemini's massive token window.
    Bypasses traditional FAISS embedding limits for superior speed and accuracy on study notes.
    """

    @classmethod
    def answer_with_rag(cls, question: str, chunks: list) -> str:
        """
        Direct Large-Context routing.
        """
        if not chunks:
            return "No document content available to answer from."

        print(f"🚀 PIVOT: Bypassing FAISS. Routing {len(chunks)} chunks directly to Gemini...")

        # Recombine the chunks into one massive context string
        full_context = "\n\n".join(chunks)
        
        # Cap it safely to ensure ultra-fast response times during the demo
        safe_context = full_context[:100000]

        print("🤖 Reading the document and generating an answer...")

        prompt = f"""You are a helpful AI Study Tutor. Answer the student's question 
using ONLY the context provided below from their uploaded study material. 
If the answer isn't in the context, clearly state that.

CONTEXT:
{safe_context}

STUDENT QUESTION: {question}

Provide a clear, well-structured answer using markdown formatting and bullet points."""

        try:
            model = AIService.get_model()
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating answer: {e}"


# --- NEW: Standalone AI Test Case Generator for Coding Portal ---
def generate_test_cases(title, description):
    """
    Forces Gemini to read a problem and generate valid JSON test cases.
    """
    print(f"🤖 Booting up Gemini to generate test cases for: {title}...")
    
    prompt = f"""
    You are an expert competitive programming backend judge. 
    Read the following coding problem and generate 4 diverse test cases (including edge cases).
    
    Problem Title: {title}
    Description: {description}
    
    You MUST respond with ONLY a raw, valid JSON array. Do not include markdown formatting, backticks, or introductory text.
    Format exact example:
    [
        {{"stdin": "input values here", "expected_output": "output here"}},
        {{"stdin": "2 7\\n9", "expected_output": "0 1"}}
    ]
    """
    
    try:
        model = AIService.get_model()
        response = model.generate_content(prompt)
        
        # Clean up any potential markdown backticks Gemini tries to sneak in
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        
        return json.loads(clean_text)
    except Exception as e:
        print(f"❌ Gemini Test Case Generation Failed: {e}")
        # Fallback safety array so the app doesn't crash
        return [{"stdin": "1", "expected_output": "1"}]
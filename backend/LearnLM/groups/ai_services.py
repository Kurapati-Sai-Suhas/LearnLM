import json
import io
import PyPDF2
import numpy as np
from django.conf import settings
from PIL import Image as PILImage
import google.generativeai as genai
from groq import Groq
from transformers import CLIPProcessor, CLIPModel
import torch

# Configure the SDKs
genai.configure(api_key=settings.GEMINI_API_KEY)
try:
    groq_client = Groq(api_key=settings.GROQ_API_KEY)
except:
    groq_client = None

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
            if not groq_client:
                raise Exception("Groq API key missing")
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)

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
            if not groq_client:
                raise Exception("Groq API key missing")
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
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
            if not groq_client:
                raise Exception("Groq API key missing")
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
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

    @classmethod
    def find_similar(cls, query_vector: list, documents, top_k=5) -> list:
        from pgvector.django import L2Distance
        
        # 'documents' is a QuerySet. We let PostgreSQL do the nearest neighbor search instantly.
        qs = documents.exclude(feature_vector__isnull=True).annotate(
            distance=L2Distance('feature_vector', query_vector)
        ).order_by('distance')[:top_k]
        
        # Return tuple (score, doc) where score is inverted distance (so higher is better)
        results = []
        for doc in qs:
            # L2 distance is smaller for closer vectors.
            score = 1.0 / (1.0 + getattr(doc, 'distance', 0))
            results.append((score, doc))
            
        return results


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
            if not groq_client:
                raise Exception("Groq API key missing")
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating answer: {e}"

def get_gemini_embedding(text: str) -> list:
    """
    Calls text-embedding-004 to get a 768-dimensional embedding for a subject.
    """
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception:
        # Fallback dummy embedding if API fails
        return [0.0] * 768


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
        if not groq_client:
            raise Exception("Groq API key missing")
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Clean up any potential markdown backticks
        clean_text = response.choices[0].message.content.replace('```json', '').replace('```', '').strip()
        
        return json.loads(clean_text)
    except Exception as e:
        print(f"❌ AI Test Case Generation Failed: {e}")
        # Fallback safety array so the app doesn't crash
        return [{"stdin": "1", "expected_output": "1"}]
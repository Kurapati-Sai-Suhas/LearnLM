import google.generativeai as genai
import json
import re
import PyPDF2
from django.conf import settings
import numpy as np
from PIL import Image as PILImage
import io

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
    Module B: Visual Semantic Search
    Uses MobileNetV2 (headless) to extract 1280-dim feature vectors
    from images, then finds similar images via Cosine Similarity.
    """
    _model = None  # Lazy-loaded singleton — only loads once

    @classmethod
    def get_model(cls):
        if cls._model is None:
            print("🧠 Loading MobileNetV2 model (first time only)...")
            from tensorflow.keras.applications import MobileNetV2
            base = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')
            cls._model = base
            print("✅ MobileNetV2 loaded!")
        return cls._model

    @classmethod
    def extract_vector(cls, image_file) -> list:
        """
        Takes a Django InMemoryUploadedFile or file path,
        returns a 1280-dim float list (the feature vector).
        """
        from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

        model = cls.get_model()

        # Handle both file objects and file paths
        if hasattr(image_file, 'read'):
            img = PILImage.open(io.BytesIO(image_file.read())).convert('RGB')
        else:
            img = PILImage.open(image_file).convert('RGB')

        img = img.resize((224, 224))  # MobileNetV2 expects 224x224
        arr = np.array(img, dtype=np.float32)
        arr = np.expand_dims(arr, axis=0)  # Shape: (1, 224, 224, 3)
        arr = preprocess_input(arr)

        vector = model.predict(arr, verbose=0)[0]  # Shape: (1280,)
        return vector.tolist()

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
        Compares query_vector against all Document objects that have
        a stored feature_vector. Returns top_k most similar.

        `documents` = queryset of Document model instances.
        """
        results = []
        for doc in documents:
            if not doc.feature_vector:
                continue
            try:
                stored_vec = json.loads(doc.feature_vector)
                score = cls.cosine_similarity(query_vector, stored_vec)
                results.append((score, doc))
            except (json.JSONDecodeError, Exception):
                continue

        # Sort by similarity score descending
        results.sort(key=lambda x: x[0], reverse=True)
        return results[:top_k]


class RAGService:
    """
    Retrieval-Augmented Generation (RAG) using FAISS for vector search
    and Gemini for answer generation.
    """

    @staticmethod
    def get_embeddings(texts: list) -> np.ndarray:
        """Uses Google's text-embedding-004 model to embed text chunks."""
        embeddings = []
        for text in texts:
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_document"
            )
            embeddings.append(result['embedding'])
        return np.array(embeddings, dtype=np.float32)

    @staticmethod
    def build_faiss_index(embeddings: np.ndarray):
        """Builds an in-memory FAISS index from embedding vectors."""
        import faiss
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)
        return index

    @classmethod
    def answer_with_rag(cls, question: str, chunks: list) -> str:
        """
        Full RAG pipeline:
        1. Embed all chunks → build FAISS index
        2. Embed the question → find top-3 most relevant chunks
        3. Send [question + context] to Gemini → get answer
        """
        if not chunks:
            return "No document content available to answer from."

        print(f"🔍 RAG: Embedding {len(chunks)} chunks...")
        chunk_embeddings = cls.get_embeddings(chunks)
        index = cls.build_faiss_index(chunk_embeddings)

        # Embed the question
        q_result = genai.embed_content(
            model="models/text-embedding-004",
            content=question,
            task_type="retrieval_query"
        )
        q_vec = np.array([q_result['embedding']], dtype=np.float32)

        # Find top 3 relevant chunks
        import faiss
        _, indices = index.search(q_vec, k=min(3, len(chunks)))
        context = "\n\n---\n\n".join([chunks[i] for i in indices[0]])

        print("🤖 Sending retrieved context to Gemini...")
        model = AIService.get_model()
        prompt = f"""You are a helpful AI Study Tutor. Answer the student's question 
using ONLY the context provided below. If the answer isn't in the context, say so.

CONTEXT (retrieved from their study material):
{context}

STUDENT QUESTION: {question}

Provide a clear, well-structured answer with markdown formatting."""

        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating answer: {e}"
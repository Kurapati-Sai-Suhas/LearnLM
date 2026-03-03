# System Requirements Specification (SRS) for LearnLM

## 1. Introduction
### 1.1 Purpose
LearnLM is an AI-powered, collaborative Learning Management System (LMS) designed to bridge the gap between solo studying and peer-to-peer networking. The platform allows users to form study groups, share materials, and utilize Artificial Intelligence to instantly generate quizzes and flashcards from uploaded documents.

### 1.2 Technology Stack
* **Frontend:** React.js (TypeScript, Vite, Tailwind CSS, shadcn/ui)
* **Backend:** Python, Django REST Framework (DRF)
* **Database:** MongoDB (Containerized via Docker / Cloud via Atlas)
* **Standard AI Integration:** OpenAI API (Current Phase)
* **Advanced AI Stack (Planned):** PyTorch, Hugging Face (Transformers), Ollama (Local LLMs), LangChain, Vector Databases (ChromaDB/Pinecone)

---

## 2. User Roles & Access (Role-Based Access Control - RBAC)
The system operates on a strict two-tier role system within Study Groups:
1. **Creator (Teacher/Admin):** The user who creates a study group. They have exclusive rights to upload master documents, configure AI parameters, and assign deadlines for group-wide quizzes.
2. **Member (Student):** Users who join a group using a specific 5-digit Access Code. They can view materials, participate in discussions, and complete assigned quizzes.

---

## 3. Functional Requirements (Current Implementation)

### 3.1 Authentication & Dashboard
* **FR-1:** Users must be able to securely log in and receive a JSON Web Token (JWT) for API authentication.
* **FR-2:** The Dashboard must calculate and display dynamic user statistics, including strictly non-duplicated counts of Active Groups, Study Hours, Quizzes Passed, and Achievement Points.

### 3.2 Study Groups & "Bouncer" Security
* **FR-3:** Creators can generate new study groups. The system must automatically register the creator as the first active member of the group.
* **FR-4 (The Bouncer Logic):** The system must strictly block non-members from viewing group details. Users must enter a valid Access Code to unlock the group's internal tabs (Assignments, Discussions, Files, Members).
* **FR-5:** The Members Tab must fetch and display all users associated with the group, visually distinguishing the "Admin" from regular members.

### 3.3 AI Quiz Engine & Assignment System
* **FR-6:** The system must be able to parse text from uploaded PDFs/Documents (`.txt`, `.pdf`).
* **FR-7:** The AI engine must generate 5-question multiple-choice quizzes based on the extracted text and a user-provided topic.
* **FR-8:** **Self-Study Mode:** Any user can generate a quiz for their own personal practice.
* **FR-9:** **Teacher Mode:** Only the Group Creator can view the "Assign to Group" UI. The system must validate the payload (`name`, `description`, `quiz_data`, `deadline`, and `study_group_id`) before saving the assignment to the database.

### 3.4 Social Network (Friends System)
* **FR-10:** Users can search the database for classmates using a minimum 3-character query.
* **FR-11:** Users can send, accept, or reject peer-to-peer friend requests.
* **FR-12:** The UI must display separate lists for "My Friends" and "Pending Requests" with dynamic counter badges.

---

## 4. Future Scope (Advanced AI Integration Roadmap)

### 4.1 Custom Deep Learning Models (Predictive & Vision)
* **Idea 1: Semantic "Smart" Grader (NLP)**
  * **Objective:** Move beyond exact-match Multiple Choice questions to Short Answer grading.
  * **Architecture:** Utilize Hugging Face `sentence-transformers` (BERT) to calculate Cosine Similarity between a student's written answer and the true answer, grading them on conceptual understanding.
* **Idea 2: Handwritten Notes OCR (Computer Vision)**
  * **Objective:** Allow students to take photos of physical notebooks or math equations and instantly convert them into digital study materials.
  * **Architecture:** Implement a Convolutional Recurrent Neural Network (CRNN) or Vision Transformer (ViT) to process image data into raw text strings.
* **Idea 3: "Study Buddy" Recommendation Engine (RecSys)**
  * **Objective:** Proactively suggest peers for a user to connect with.
  * **Architecture:** Implement Neural Collaborative Filtering (NCF) to analyze user vectors (topics studied, average quiz scores) and recommend mathematically compatible study partners.

### 4.2 Generative AI & Large Language Models (LLMs)
* **Idea 4: "Chat with your Document" Engine (RAG)**
  * **Objective:** Enable users to query specific, massive PDFs and receive summarized answers with exact page citations.
  * **Architecture:** Implement Retrieval-Augmented Generation (RAG) using LangChain to connect Django with a Vector Database (e.g., ChromaDB). 
* **Idea 5: The Self-Explaining AI Tutor**
  * **Objective:** Provide conversational, custom feedback when a student fails a quiz question.
  * **Architecture:** Feed the student's incorrect logic to a locally hosted LLM (via Ollama/Hugging Face) to generate a personalized explanation of exactly why their reasoning was flawed.
* **Idea 6: Automated Multi-Lingual Flashcards**
  * **Objective:** Automatically ingest a Study Group's weekly chat history and discussion board to generate a summary deck of flashcards.
  * **Architecture:** Utilize an LLM pipeline to extract key concepts from raw chat data and translate the output into multiple languages for international students.

---

## 5. Non-Functional Requirements

* **NFR-1 (Database Resilience):** The MongoDB database must be containerized using Docker Compose with mapped volumes (`-v mongo_data:/data/db`) to ensure user data persists across server restarts.
* **NFR-2 (API Security):** All backend endpoints (except user creation) must be protected by Django's `IsAuthenticated` permission class. 
* **NFR-3 (Data Validation):** The backend serializers must strictly define `read_only_fields` (e.g., `assigned_by`, `created_at`) to prevent malicious payload injections from the client side.
* **NFR-4 (AI Latency Mitigation):** Massive Deep Learning models must be loaded into memory once via Django's `apps.py` configuration to prevent server freezing during API requests.

import os
import PyPDF2
import docx
import PIL.Image # 👈 This is the new python-docx library

def extract_text_from_file(file_path):
    """ Reads text from PDF, DOCX, or TXT files based on extension. """
    print(f"🔍 Attempting to read file at: {file_path}")
    # Get the file extension (e.g., '.pdf', '.docx')
    ext = os.path.splitext(file_path)[1].lower()
    text = ""

    try:
        if ext == '.pdf':
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        elif ext == '.docx':
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()
        else:
            print(f"⚠️ Unsupported file type: {ext}")
            return None

        print(f"✅ Extracted {len(text)} characters from {ext} file.")
        return text

    except Exception as e:
        print(f"❌ File Read Error: {e}")
        return ""


def load_image_for_ai(file_path):
    """ Opens an image file and prepares it for Gemini Vision """
    print(f"🖼️ Opening Image: {file_path}")
    try:
        img = PIL.Image.open(file_path)
        return img
    except Exception as e:
        print(f"❌ Image Load Error: {e}")
        return None
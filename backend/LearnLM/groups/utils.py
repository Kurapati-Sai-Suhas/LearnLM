import os
import pypdf # 👈 We import the whole library to avoid naming errors
from django.conf import settings

def extract_text_from_pdf(pdf_path):
    """
    Takes a file path, reads the PDF, and returns the text string.
    """
    try:
        # 1. Construct the full path
        # If the path already has the drive letter (C:...), use it. Otherwise join with MEDIA_ROOT.
        full_path = str(pdf_path)
        if not os.path.isabs(full_path):
            full_path = os.path.join(settings.MEDIA_ROOT, full_path)
        
        print(f"📖 Reading file at: {full_path}")
        
        # 2. Open the file using the explicit class
        # (This fixes the 'module not callable' error)
        reader = pypdf.PdfReader(full_path)
        
        # 3. Extract text
        text = ""
        # Limit to first 10 pages to be fast
        for i, page in enumerate(reader.pages):
            if i >= 10: break 
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
            
        if not text.strip():
            print("⚠️ Warning: PDF extracted text is empty.")
            
        return text
    
    except Exception as e:
        print(f"❌ Error reading PDF: {e}")
        # Debug info to help us if it fails again
        try:
            print(f"🔍 pypdf version: {pypdf.__version__}")
        except:
            pass
        return None
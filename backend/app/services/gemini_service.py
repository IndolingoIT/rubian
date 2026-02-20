from app.core.config import settings

def gemini_translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    MVP stub (so system runs without blowing up).
    Next step: implement real Gemini call.
    """
    # TODO: implement Gemini API call via google-generativeai
    return f"[STUB {source_lang}->{target_lang}] {text}"
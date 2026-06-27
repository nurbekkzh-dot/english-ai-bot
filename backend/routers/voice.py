from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.voice_service import speech_to_text, text_to_speech

router = APIRouter()

class SpeechToTextRequest(BaseModel):
    audio_base64: str

class TextToSpeechRequest(BaseModel):
    text: str

def _voice_error(exc: Exception) -> HTTPException:
    message = str(exc)
    if "RESOURCE_EXHAUSTED" in message or "prepayment credits are depleted" in message:
        return HTTPException(
            status_code=429,
            detail="У Gemini API закончились credits/balance. Голос и озвучка недоступны до пополнения или замены ключа.",
        )
    if "GEMINI_API_KEY" in message:
        return HTTPException(status_code=500, detail="GEMINI_API_KEY не настроен в backend/.env.")
    return HTTPException(status_code=502, detail="Voice API сейчас не ответил. Попробуй ещё раз.")


@router.post("/stt")
async def stt(data: SpeechToTextRequest):
    try:
        text = await speech_to_text(data.audio_base64)
        return {"text": text}
    except Exception as exc:
        raise _voice_error(exc) from exc


@router.post("/tts")
async def tts(data: TextToSpeechRequest):
    try:
        audio = await text_to_speech(data.text)
        return {"audio_base64": audio}
    except Exception as exc:
        raise _voice_error(exc) from exc

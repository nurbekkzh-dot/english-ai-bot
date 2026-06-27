import os
import asyncio
import base64
from google import genai
from google.genai import types

MODEL_NAME = "gemini-2.5-flash"

def _get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    return genai.Client(api_key=api_key)

async def speech_to_text(audio_base64: str) -> str:
    """Конвертирует base64 аудио в текст через Gemini."""
    client = _get_client()
    audio_bytes = base64.b64decode(audio_base64)

    response = await client.aio.models.generate_content(
        model=MODEL_NAME,
        contents=[
            types.Content(parts=[
                types.Part(inline_data=types.Blob(mime_type="audio/webm", data=audio_bytes)),
                types.Part(text="Transcribe this audio exactly as spoken. Return only the transcribed text, nothing else.")
            ])
        ]
    )
    return response.text.strip()

async def text_to_speech(text: str) -> str:
    """Конвертирует текст в base64 аудио через Gemini TTS."""
    client = _get_client()

    # Убираем русский фидбэк перед озвучкой
    english_part = text
    for marker in ["📝 Разбор ошибок:", "📝 Фидбэк:"]:
        if marker in text:
            english_part = text[:text.index(marker)].strip()
            break

    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash-preview-tts",
        contents=english_part,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Aoede")
                )
            )
        )
    )

    audio_data = response.candidates[0].content.parts[0].inline_data.data
    return base64.b64encode(audio_data).decode("utf-8")

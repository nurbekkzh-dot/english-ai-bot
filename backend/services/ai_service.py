import os
from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()

MODEL_NAME = "llama-3.1-8b-instant"

def _build_system_prompt(level: str, mode: str) -> str:
    level_instructions = {
        "A1": "You are a friendly English tutor for absolute beginners (A1 level). Use only simple, short sentences and basic vocabulary. At the END of every reply, add a short section in Russian titled '📝 Разбор ошибок:' where you gently point out any mistakes.",
        "A2": "You are a friendly English tutor for elementary learners (A2 level). Use simple language. At the END of every reply, add '📝 Разбор ошибок:' with brief feedback.",
        "B1": "You are an English tutor for intermediate learners (B1 level). At the END of every reply, add '📝 Фидбэк:' with notes on significant errors.",
        "B2": "You are an English conversation partner for upper-intermediate learners (B2 level). Only mention errors if they are significant.",
    }
    mode_instructions = {
        "free_chat": "Have a natural, engaging conversation on any topic. Be warm and encouraging.",
        "speaking": "Focus on speaking practice. Ask follow-up questions. Encourage full sentences.",
        "ielts": "You are a strict IELTS examiner. After each response, give a brief IELTS-style band score estimate.",
        "daily": "Pick one useful grammar point or vocabulary topic, explain it briefly, then practice it.",
    }
    return f"{level_instructions.get(level, level_instructions['A1'])}\n\n{mode_instructions.get(mode, mode_instructions['free_chat'])}"

async def generate_ai_response(user_text: str, level: str, mode: str, history: list[dict] | None = None, file_context: str | None = None) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")
    
    client = AsyncGroq(api_key=api_key)
    level = level or "A1"
    system_prompt = _build_system_prompt(level, mode)
    
    if file_context:
        system_prompt += f"\n\nФайл загружен пользователем. Используй как контекст:\n{file_context}"

    messages = [{"role": "system", "content": system_prompt}]
    
    for msg in (history or []):
        role = "assistant" if msg["role"] == "model" else "user"
        text = msg["parts"][0] if msg["parts"] else ""
        messages.append({"role": role, "content": text})
    
    messages.append({"role": "user", "content": user_text})

    response = await client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        max_tokens=1000,
    )
    return response.choices[0].message.content

import { useEffect, useRef, useState } from "react"

const MODE_NAMES = {
  free_chat: "Free Chat",
  speaking: "Speaking Practice",
  ielts: "IELTS Mode",
  daily: "Daily Lesson",
}

const STARTERS = {
  free_chat: "Tell me about your day.",
  speaking: "Ask me a question and help me answer better.",
  ielts: "Start IELTS Speaking Part 1.",
  daily: "Give me today's short lesson.",
}

export default function ChatPage({ user, mode, onBack, apiUrl, onXpUpdate }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: `Режим ${MODE_NAMES[mode]} готов. Можно писать, говорить голосом или открыть урок.` }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [fileContext, setFileContext] = useState("")
  const [playingAudio, setPlayingAudio] = useState(null)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const addMessage = (message) => setMessages(prev => [...prev, message])

  const sendMessage = async (text) => {
    const clean = text.trim()
    if (!clean || loading) return

    addMessage({ role: "user", text: clean })
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(`${apiUrl}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, message: clean, file_context: fileContext || null }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.detail || data.error || "Request failed")

      addMessage({ role: "bot", text: data.reply, xp: data.xp })
      if (data.level_up) addMessage({ role: "system", text: `+10 XP. Всего ${data.xp} XP. Стрик ${data.streak} дней.` })
      onXpUpdate(prev => ({ ...prev, xp: data.xp, streak: data.streak }))
    } catch (error) {
      addMessage({ role: "bot", text: error.message || "Не получилось получить ответ. Проверь backend и GEMINI_API_KEY." })
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    if (loading || recording) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRef.current = new MediaRecorder(stream)
      chunksRef.current = []
      mediaRef.current.ondataavailable = e => chunksRef.current.push(e.data)
      mediaRef.current.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const reader = new FileReader()
        reader.onload = async () => {
          const base64 = reader.result.split(",")[1]
          setLoading(true)
          addMessage({ role: "system", text: "Распознаю голос..." })
          try {
            const res = await fetch(`${apiUrl}/api/voice/stt`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audio_base64: base64 }),
            })
            const data = await res.json()
            setMessages(prev => prev.filter(msg => msg.text !== "Распознаю голос..."))
            if (!res.ok) throw new Error(data.detail || "Не удалось распознать голос.")
            if (data.text) await sendMessage(data.text)
          } catch (error) {
            addMessage({ role: "bot", text: error.message || "Не удалось распознать голос." })
          } finally {
            setLoading(false)
          }
        }
        reader.readAsDataURL(blob)
      }
      mediaRef.current.start()
      setRecording(true)
    } catch {
      addMessage({ role: "bot", text: "Микрофон недоступен. Разреши доступ в браузере или Telegram." })
    }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  const playTTS = async (text) => {
    if (playingAudio) {
      playingAudio.pause()
      setPlayingAudio(null)
      return
    }
    try {
      const res = await fetch(`${apiUrl}/api/voice/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Озвучка сейчас недоступна.")
      const audio = new Audio(`data:audio/wav;base64,${data.audio_base64}`)
      audio.onended = () => setPlayingAudio(null)
      await audio.play()
      setPlayingAudio(audio)
    } catch (error) {
      addMessage({ role: "system", text: error.message || "Озвучка сейчас недоступна." })
    }
  }

  const handleFile = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    const text = await file.text()
    setFileContext(text.slice(0, 3000))
    addMessage({ role: "system", text: `Файл добавлен: ${file.name}` })
  }

  return (
    <div className="page chat-page">
      <header className="chat-header">
        <button className="icon-button ghost" onClick={onBack} aria-label="Назад">‹</button>
        <div className="chat-title"><strong>{MODE_NAMES[mode]}</strong><span>{user.english_level} level</span></div>
        <button className="icon-button ghost" onClick={() => fileRef.current.click()} aria-label="Добавить файл">📎</button>
        <input ref={fileRef} type="file" accept=".txt,.md" hidden onChange={handleFile} />
      </header>

      <div className="starter-row">
        <button onClick={() => sendMessage(STARTERS[mode])}>{STARTERS[mode]}</button>
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div key={`${msg.role}-${index}`} className={`message message-${msg.role}`}>
            <div className="message-text">{msg.text}</div>
            {msg.role === "bot" && <button className="tts-btn" onClick={() => playTTS(msg.text)}>{playingAudio ? "Stop" : "Voice"}</button>}
          </div>
        ))}
        {loading && <div className="message message-bot"><div className="typing-dots"><span/><span/><span/></div></div>}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage(input)}
          placeholder="Напиши сообщение..."
          disabled={loading}
        />
        <button className={`round-action ${recording ? "recording" : ""}`} onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording}>🎤</button>
        <button className="round-action send" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>➤</button>
      </div>
    </div>
  )
}

import { useEffect, useState } from "react"
import HomePage from "./pages/HomePage"
import ChatPage from "./pages/ChatPage"
import ProfilePage from "./pages/ProfilePage"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
const DEMO_USER = { id: 123456789, username: "test_user", first_name: "Local" }

export default function App() {
  const [page, setPage] = useState("home")
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState("free_chat")
  const [bootError, setBootError] = useState("")

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    tg?.ready()
    tg?.expand()
    tg?.setHeaderColor?.("#f7f3ea")
    tg?.setBackgroundColor?.("#f7f3ea")

    const tgUser = tg?.initDataUnsafe?.user || DEMO_USER

    fetch(`${API_URL}/api/user/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: tgUser.id, username: tgUser.username || tgUser.first_name || "student" }),
    })
      .then(r => {
        if (!r.ok) throw new Error("Backend is not available")
        return r.json()
      })
      .then(data => setUser(data))
      .catch(() => setBootError("Не удалось подключиться к backend. Проверь, что API запущен на http://localhost:8000."))
  }, [])

  const saveLevel = async (level) => {
    if (!user) return
    const res = await fetch(`${API_URL}/api/user/level`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.user_id, level }),
    })
    if (!res.ok) return
    setUser(prev => ({ ...prev, english_level: level }))
  }

  const goToChat = async (selectedMode) => {
    if (!user) return
    setMode(selectedMode)
    setPage("chat")
    await fetch(`${API_URL}/api/user/mode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.user_id, mode: selectedMode }),
    }).catch(() => {})
    setUser(prev => ({ ...prev, current_mode: selectedMode }))
  }

  if (bootError) {
    return (
      <div className="app-state app-error">
        <strong>Mini App не запустился</strong>
        <span>{bootError}</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app-state">
        <div className="spinner" />
        <span>Загрузка...</span>
      </div>
    )
  }

  return (
    <div className="app">
      {page === "home" && (
        <HomePage
          user={user}
          onSelectMode={goToChat}
          onProfile={() => setPage("profile")}
          onLevelChange={saveLevel}
        />
      )}
      {page === "chat" && (
        <ChatPage
          user={user}
          mode={mode}
          onBack={() => setPage("home")}
          apiUrl={API_URL}
          onXpUpdate={setUser}
        />
      )}
      {page === "profile" && (
        <ProfilePage
          user={user}
          onBack={() => setPage("home")}
          apiUrl={API_URL}
          onUpdate={setUser}
        />
      )}
    </div>
  )
}

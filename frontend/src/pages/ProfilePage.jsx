import { useState } from "react"

const LEVELS = ["A1", "A2", "B1", "B2"]
const FORMATS = [
  { id: "text", label: "Текст" },
  { id: "voice", label: "Голос" },
]

export default function ProfilePage({ user, onBack, apiUrl, onUpdate }) {
  const [saving, setSaving] = useState(false)
  const xpToNext = 50 - (user.xp % 50 || 50)
  const progress = ((user.xp % 50) / 50) * 100

  const changeLevel = async (level) => {
    setSaving(true)
    await fetch(`${apiUrl}/api/user/level`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.user_id, level }),
    })
    onUpdate(prev => ({ ...prev, english_level: level }))
    setSaving(false)
  }

  const changeFormat = async (format) => {
    setSaving(true)
    await fetch(`${apiUrl}/api/user/format`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.user_id, format }),
    })
    onUpdate(prev => ({ ...prev, response_format: format }))
    setSaving(false)
  }

  return (
    <div className="page profile-page">
      <header className="profile-header">
        <button className="icon-button ghost" onClick={onBack} aria-label="Назад">‹</button>
        <strong>Профиль</strong>
      </header>

      <main className="profile-content">
        <section className="profile-card">
          <div className="profile-avatar">👤</div>
          <div><h1>@{user.username || "student"}</h1><p>{user.english_level} · {user.current_mode}</p></div>
        </section>

        <section className="panel xp-panel">
          <div className="xp-row"><strong>{user.xp} XP</strong><span>до бонуса: {xpToNext} XP</span></div>
          <div className="xp-bar"><span style={{ width: `${progress}%` }} /></div>
        </section>

        <section className="stat-grid profile-stats">
          <div><strong>{user.streak}</strong><span>дней стрик</span></div>
          <div><strong>{user.english_level}</strong><span>уровень</span></div>
        </section>

        <section className="panel settings-panel">
          <div className="panel-head compact"><span className="panel-kicker">Настройки</span><h2>Уровень</h2></div>
          <div className="segmented">
            {LEVELS.map(level => <button key={level} className={user.english_level === level ? "active" : ""} onClick={() => changeLevel(level)} disabled={saving}>{level}</button>)}
          </div>
        </section>

        <section className="panel settings-panel">
          <div className="panel-head compact"><span className="panel-kicker">Ответы</span><h2>Формат</h2></div>
          <div className="segmented">
            {FORMATS.map(format => <button key={format.id} className={(user.response_format || "text") === format.id ? "active" : ""} onClick={() => changeFormat(format.id)} disabled={saving}>{format.label}</button>)}
          </div>
        </section>
      </main>
    </div>
  )
}

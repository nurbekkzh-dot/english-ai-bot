const MODES = [
  { id: "free_chat", icon: "💬", label: "Free Chat", desc: "Свободный разговор и мягкий фидбэк", tone: "Conversation" },
  { id: "speaking", icon: "🗣", label: "Speaking", desc: "Вопросы, ответы и тренировка фраз", tone: "Practice" },
  { id: "ielts", icon: "📝", label: "IELTS", desc: "Экзаменатор, балл и точные замечания", tone: "Exam" },
  { id: "daily", icon: "📅", label: "Daily Lesson", desc: "Короткий урок на сегодня", tone: "Lesson" },
]

const LEVELS = [
  { id: "A1", label: "Start", desc: "простые фразы" },
  { id: "A2", label: "Basic", desc: "каждый день" },
  { id: "B1", label: "Middle", desc: "разговоры" },
  { id: "B2", label: "Strong", desc: "свободнее" },
]

const DAILY_TASKS = [
  "Describe your morning in 4 sentences.",
  "Use: usually, sometimes, never.",
  "Ask the tutor one question about travel.",
]

export default function HomePage({ user, onSelectMode, onProfile, onLevelChange }) {
  const needsLevel = !user.english_level
  const progress = user.xp % 50

  return (
    <div className="page home-page">
      <header className="home-hero">
        <div className="hero-row">
          <div>
            <p className="eyebrow">English AI Mini App</p>
            <h1>Главное меню</h1>
          </div>
          <button className="icon-button" onClick={onProfile} aria-label="Открыть профиль">👤</button>
        </div>

        <div className="stats-strip">
          <div><strong>{user.xp}</strong><span>XP</span></div>
          <div><strong>{user.streak}</strong><span>стрик</span></div>
          <div><strong>{user.english_level || "?"}</strong><span>уровень</span></div>
        </div>
        <div className="mini-progress"><span style={{ width: `${(progress / 50) * 100}%` }} /></div>
      </header>

      <main className="home-content">
        {needsLevel && (
          <section className="panel onboarding-panel">
            <div className="panel-head">
              <span className="panel-kicker">Первый вход</span>
              <h2>Выбери уровень</h2>
            </div>
            <div className="level-grid">
              {LEVELS.map(level => (
                <button key={level.id} className="level-choice" onClick={() => onLevelChange(level.id)}>
                  <strong>{level.id}</strong>
                  <span>{level.label}</span>
                  <small>{level.desc}</small>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="panel modes-panel">
          <div className="panel-head">
            <span className="panel-kicker">Режимы</span>
            <h2>Что тренируем?</h2>
          </div>
          <div className="mode-list">
            {MODES.map(mode => (
              <button key={mode.id} className="mode-card" onClick={() => onSelectMode(mode.id)}>
                <span className="mode-icon">{mode.icon}</span>
                <span className="mode-copy">
                  <strong>{mode.label}</strong>
                  <small>{mode.desc}</small>
                </span>
                <em>{mode.tone}</em>
              </button>
            ))}
          </div>
        </section>

        <section className="panel lesson-panel">
          <div className="panel-head compact">
            <span className="panel-kicker">Задания</span>
            <h2>Мини-урок</h2>
          </div>
          <div className="task-list">
            {DAILY_TASKS.map((task, index) => <div key={task}><b>{index + 1}</b><span>{task}</span></div>)}
          </div>
          <button className="primary-action" onClick={() => onSelectMode("daily")}>Начать урок</button>
        </section>
      </main>
    </div>
  )
}

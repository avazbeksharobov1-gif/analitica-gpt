import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const tg = window.Telegram?.WebApp

// Telegram Mini App тайёр
if (tg) {
  tg.ready()
  tg.expand()
}

// User context
const user = tg?.initDataUnsafe?.user || null

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App tg={tg} user={user} />
  </React.StrictMode>
)

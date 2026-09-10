import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'

const embeddedLocale =
  new URLSearchParams(
    window.location.search,
  ).get('locale')

if (
  embeddedLocale === 'ar' ||
  embeddedLocale === 'en'
) {
  document.documentElement.lang =
    embeddedLocale
  document.documentElement.style.direction =
    embeddedLocale === 'ar'
      ? 'rtl'
      : 'ltr'
}

if (window.parent !== window) {
  document.documentElement.dataset.chatEmbedded = 'true'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

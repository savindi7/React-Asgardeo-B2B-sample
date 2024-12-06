import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from '@asgardeo/auth-react'
import { default as authConfig } from "./config.json";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider config={ authConfig }
    >
      <App />
    </AuthProvider>
  </StrictMode>,
)

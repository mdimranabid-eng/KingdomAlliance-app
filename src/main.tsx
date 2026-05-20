import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SettingsProvider } from './lib/SettingsContext';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ""}>
        <App />
      </GoogleReCaptchaProvider>
    </SettingsProvider>
  </StrictMode>,
);

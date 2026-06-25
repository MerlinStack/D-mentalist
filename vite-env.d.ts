/// <reference types="vite/client" />

declare module '*.json' {
  const value: any;
  export default value;
}

interface Window {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
}

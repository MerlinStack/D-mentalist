# D'mentalist

AI-powered Scripture detection and projection for live church services.

## Features

- **AI Scripture Search** — Search by reference, partial quote, or theme. Claude AI identifies verses from natural language.
- **Sound Mode** — Real-time speech recognition detects Bible verses from live sermon audio and projects them automatically.
- **Instant Projection** — One click pushes verses to an external projector window. Custom themes, font sizes, and display options.
- **Service Logging** — Firebase-backed session tracking with verse projection history.
- **Multiple Translations** — KJV, plus fallback mappings for NIV (WEB), ESV (Darby), and NKJV (KJV).

## Tech Stack

- React 19 + Vite 8 + Tailwind CSS 4
- Zustand (state management)
- Firebase Auth + Firestore
- Anthropic Claude API (verse identification & commentary)
- bible-api.com (free Bible text)
- Web Speech API + BroadcastChannel API

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

| Variable | Required | Description |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | No* | Claude API key for AI search/sound mode |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID |

*Without it, search falls back to keyword matching and Sound Mode is disabled.

### Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
npm run test     # Vitest
```

## Keyboard Shortcuts (Operator)

| Key | Action |
|-----|--------|
| `Esc` | Clear projection / close results |
| `R` | Toggle search results panel |
| `N` | Project next from queue |
| `Space` | Project selected verse |
| `S` | Toggle Sound Mode |
| `Ctrl+K` / `Cmd+K` | Focus search bar |

## License

For the proclamation of the Gospel.

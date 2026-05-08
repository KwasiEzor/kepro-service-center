# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**KeyPro Service Center** - Premium automotive service center website specializing in car keys, diagnostics, and mobile technical assistance. Built with React, TypeScript, and Vite, featuring an AI-powered chatbot using Google's Gemini API.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Routing**: React Router v7
- **Animations**: motion (framer-motion successor)
- **Icons**: lucide-react
- **AI**: Google Gemini API (`@google/genai`)

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check (linting)
npm run lint

# Clean build artifacts
npm run clean

# Pre-deployment quality check
npm run pre-deploy
```

## Environment Setup

Required environment variables in `.env` or `.env.local`:

```bash
VITE_GEMINI_API_KEY="your_gemini_api_key"
```

The app uses `import.meta.env.VITE_GEMINI_API_KEY` to access the API key at runtime.

## Project Structure

```
src/
├── pages/          # Route components
│   ├── Home.tsx
│   ├── Services.tsx
│   ├── About.tsx
│   ├── Brands.tsx
│   ├── Contact.tsx
│   ├── Quote.tsx
│   ├── FAQ.tsx
│   └── AdminPreview.tsx
├── components/     # Reusable components
│   ├── Layout.tsx      # Main layout wrapper with Navbar, Footer, ChatBot
│   ├── Navbar.tsx      # Top navigation
│   └── ChatBot.tsx     # Gemini AI chatbot (fixed bottom-right)
├── lib/
│   └── utils.ts        # Utility functions (cn for className merging)
├── App.tsx             # Route definitions
├── main.tsx            # React root entry
└── index.css           # Global styles & design system
```

## Design System

All colors are centralized in `src/index.css` as CSS variables:

### Brand Colors
- Primary Orange: `var(--color-brand-orange-primary)` → `#FF6B2C`
- Secondary Orange: `var(--color-brand-orange-secondary)` → `#FF8C4D`
- Dark Background: `var(--color-brand-dark)` → `#0D0D0D`
- Dark Gray: `var(--color-brand-gray)` → `#1A1A1A`

### **IMPORTANT**: Never hardcode hex colors in TSX files

```tsx
// ✅ ALWAYS use CSS variables
className="bg-[var(--color-brand-orange-primary)]"

// ❌ NEVER hardcode hex values
className="bg-[#FF6B2C]"
```

### Utility Classes

Available in `src/index.css`:
- `.bg-gradient-orange` - Orange gradient left to right
- `.text-gradient-orange` - Orange gradient text
- `.bg-glow-orange` / `.bg-glow-red` - Orange glow shadow effect
- `.clip-angular-sm/md/lg/xl` - Industrial angular shapes
- `.glass` / `.glass-dark` - Glass morphism effects
- `.card-dark` - Dark card with gradient
- `.automotive-grid` - Grid pattern background

## Code Standards

### TypeScript
- All components must have proper type definitions
- Use interfaces for props
- No `any` types

### Styling
- Always use CSS variables for colors
- Use `cn()` utility for conditional classes
- Use Tailwind utilities, avoid inline styles
- Follow the industrial/automotive angular aesthetic (clip-angular classes)

### Components
- Single responsibility
- Reusable components in `/components`
- Page-specific components in `/pages`

## Deployment

### Pre-Deployment Check

**ALWAYS run before deploying:**
```bash
npm run pre-deploy
```

This script checks:
- Node.js version
- Environment variables
- TypeScript types
- Dependency health
- Build success
- Security audit

### Deployment Platforms

**Vercel** (Recommended):
```bash
vercel --prod
```
Config: `vercel.json`

**Netlify**:
```bash
netlify deploy --prod
```
Config: `netlify.toml`

See `DEPLOYMENT.md` for detailed instructions.

## Quality Standards

- **TypeScript**: No errors (`npm run lint`)
- **Build**: Must succeed (`npm run build`)
- **Security**: No high vulnerabilities (`npm audit`)
- **Performance**: Lighthouse score > 90
- **Code**: No console.log in production

See `QUALITY_CHECKLIST.md` for full checklist.

## AI Chatbot

ChatBot component uses Google Gemini API (`gemini-2.0-flash` model).

System instruction: Acts as KeyPro Service Center AI assistant.

**To modify behavior**: Edit `src/components/ChatBot.tsx` line 45-47.

## Common Tasks

### Add New Page
1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add nav link in `src/components/Navbar.tsx`

### Update Colors
1. Edit CSS variables in `src/index.css` @theme section
2. Never hardcode colors in TSX files

### Modify ChatBot
Edit `src/components/ChatBot.tsx` systemInstruction property

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on:
- Push to main/develop
- Pull requests

Pipeline:
1. Type check
2. Build
3. Security audit
4. Deploy preview (PRs)
5. Deploy production (main branch)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**KeyPro Service Center** - Premium automotive service center website specializing in car keys, diagnostics, and mobile technical assistance. Built with React, TypeScript, and Vite, featuring an AI-powered chatbot using Google's Gemini API.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Routing**: React Router v7
- **Animations**: motion (framer-motion successor)
- **Icons**: lucide-react
- **AI**: Google Gemini API (`@google/genai`)

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check (linting)
npm run lint

# Clean build artifacts
npm run clean
```

## Environment Setup

Required environment variables in `.env` or `.env.local`:

```bash
VITE_GEMINI_API_KEY="your_gemini_api_key"
```

The app uses `import.meta.env.VITE_GEMINI_API_KEY` to access the API key at runtime.

## Project Structure

```
src/
├── pages/          # Route components
│   ├── Home.tsx
│   ├── Services.tsx
│   ├── About.tsx
│   ├── Brands.tsx
│   ├── Contact.tsx
│   ├── Quote.tsx
│   ├── FAQ.tsx
│   └── AdminPreview.tsx
├── components/     # Reusable components
│   ├── Layout.tsx      # Main layout wrapper with Navbar, Footer, ChatBot
│   ├── Navbar.tsx      # Top navigation
│   └── ChatBot.tsx     # Gemini AI chatbot (fixed bottom-right)
├── lib/
│   └── utils.ts        # Utility functions (cn for className merging)
├── App.tsx             # Route definitions
├── main.tsx            # React root entry
└── index.css           # Global styles
```

## Architecture Notes

### Routing Pattern
All public routes use `Layout` wrapper that provides:
- Navbar (top navigation)
- Footer (company info, links, contact)
- ChatBot (floating AI assistant)
- Auto-scroll to top on route change

Routes defined in `App.tsx`:
- `/` → Home
- `/services` → Services
- `/about` → About
- `/brands` → Brands
- `/contact` → Contact
- `/quote` → Quote
- `/faq` → FAQ
- `/admin` → AdminPreview (no Layout wrapper)

### AI Chatbot Integration
`src/components/ChatBot.tsx` implements the Gemini-powered assistant:
- Model: `gemini-2.0-flash`
- System instruction: Acts as KeyPro Service Center AI assistant
- Chat history maintained in component state
- Fixed bottom-right floating button with animated chat window
- Handles conversation context across messages

### Styling Utilities
`src/lib/utils.ts` exports `cn()` function:
```typescript
cn(...inputs) // Merges Tailwind classes using clsx + tailwind-merge
```
Use this for conditional className composition to avoid Tailwind conflicts.

### Custom Tailwind Theme
Brand colors used throughout:
- `brand-red` - Primary accent color
- `brand-blue` - Secondary color
- Glass morphism effects via `glass` and `glass-dark` classes

## AI Studio Integration

This project was created in Google AI Studio and includes:
- AI Studio auto-injects `GEMINI_API_KEY` at runtime
- HMR disabled in AI Studio via `DISABLE_HMR` env var (prevents flickering during agent edits)
- Path alias `@/` resolves to project root

## Common Development Tasks

### Adding a New Page
1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`:
   ```tsx
   <Route path="new-page" element={<NewPage />} />
   ```
3. Add navigation link in `src/components/Navbar.tsx`

### Modifying ChatBot Behavior
Edit system instruction in `src/components/ChatBot.tsx` line 45:
```typescript
systemInstruction: "You are the AI assistant for KeyPro Service Center..."
```

### Customizing Animations
Uses `motion` library (framer-motion API). See `ChatBot.tsx` for examples:
- `<AnimatePresence>` for enter/exit animations
- `whileHover`, `whileTap` for interactive states
- `initial`, `animate`, `exit` for animation lifecycle

## Deployment Notes

- Built for AI Studio deployment (auto-configured)
- Can deploy to any static host (Vercel, Netlify, etc.)
- Requires `GEMINI_API_KEY` in production environment
- Build output: `dist/` directory

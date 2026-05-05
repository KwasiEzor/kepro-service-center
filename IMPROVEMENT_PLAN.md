# KeyPro Service Center - Improvement Plan

**Created**: 2026-05-05
**Status**: Proposed
**Priority**: Critical bugs → Security → Core features → Enhancements

---

## Executive Summary

Project has strong foundation (modern stack, clean code, good UX) but **cannot be deployed** due to:
1. Missing router configuration (app won't run)
2. Exposed API keys (security risk)
3. Non-functional forms (no backend)

**Estimated effort**: 3-5 days for production-ready baseline

---

## Phase 1: Critical Fixes (Day 1 - Morning)

### Priority: BLOCKER - App won't run

#### 1.1 Fix Router Configuration
**File**: `src/main.tsx`

**Current** (broken):
```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

**Fix**:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

**Test**: `npm run dev` - app should load without console errors

**Time**: 5 minutes

---

#### 1.2 Add Error Boundary
**File**: `src/components/ErrorBoundary.tsx` (create new)

```tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center gradient-bg px-6">
          <div className="glass p-12 rounded-[40px] max-w-lg text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Something Went Wrong</h1>
            <p className="text-white/60 mb-8">
              We're sorry, but something unexpected happened. Please refresh the page or contact support.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-brand-red rounded-full font-bold hover:scale-105 transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Update**: `src/main.tsx`
```tsx
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
```

**Test**: Temporarily throw error in Home.tsx, verify error boundary shows

**Time**: 15 minutes

---

## Phase 2: Security Fixes (Day 1 - Afternoon)

### Priority: HIGH - API key exposed

#### 2.1 Create Backend API Proxy
**File**: `server/api.ts` (create new)

```typescript
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || '');

// Validate API key on startup
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not set in environment');
  process.exit(1);
}

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body as {
      message: string;
      history: ChatMessage[];
    };

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction:
        'You are the AI assistant for KeyPro Service Center, a premium automotive service center specializing in car keys, diagnostics, and mobile technical assistance. Be professional, technical, helpful, and concise. Offer to provide quotes or book services. If asked about prices, explain they depend on the vehicle model and service type.',
    });

    const formattedHistory = (history || []).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: 'Failed to process message. Please try again.',
    });
  }
});

export default router;
```

**File**: `server/index.ts` (create new)

```typescript
import express from 'express';
import chatRouter from './api';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/api', chatRouter);

app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});
```

**Update**: `package.json`
```json
{
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "dev:server": "tsx watch server/index.ts",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\"",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    // ... existing deps
    "concurrently": "^9.0.0"
  }
}
```

**Install**: `npm install concurrently`

**Time**: 30 minutes

---

#### 2.2 Update ChatBot to Use Backend
**File**: `src/components/ChatBot.tsx`

**Remove** (lines 8-11):
```tsx
// DELETE THIS
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI(apiKey);
```

**Update** `handleSend` function (lines 28-64):
```tsx
const handleSend = async () => {
  if (!message.trim() || isLoading) return;

  const userMessage = message.trim();
  setMessage('');
  setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
  setIsLoading(true);

  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        history: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
  } catch (error) {
    console.error('Chat error:', error);
    setMessages(prev => [
      ...prev,
      {
        role: 'bot',
        content: "I'm sorry, I encountered an error. Please try again or call us at 01 23 45 67 89.",
      },
    ]);
  } finally {
    setIsLoading(false);
  }
};
```

**Remove import**:
```tsx
// DELETE
import { GoogleGenAI } from "@google/genai";
```

**Test**:
1. `npm run dev:all`
2. Open chatbot, send message
3. Verify response comes from backend
4. Check browser DevTools - no API key in Network tab

**Time**: 20 minutes

---

#### 2.3 Environment Variables Validation
**File**: `server/env.ts` (create new)

```typescript
export function validateEnv() {
  const required = ['GEMINI_API_KEY'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\nCreate a .env file with:');
    missing.forEach((key) => console.error(`${key}=your_value_here`));
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}
```

**Update**: `server/index.ts`
```typescript
import { validateEnv } from './env';

validateEnv(); // Add at top before anything else

const app = express();
// ... rest
```

**Update**: `.env.example`
```bash
# Backend API Key (server-side only)
GEMINI_API_KEY="your_gemini_api_key_here"

# App URL (for production)
APP_URL="https://your-domain.com"
```

**Time**: 10 minutes

---

## Phase 3: Input Validation (Day 2 - Morning)

### Priority: HIGH - Prevent XSS and bad data

#### 3.1 Install Validation Library
```bash
npm install zod react-hook-form @hookform/resolvers
```

**Time**: 2 minutes

---

#### 3.2 Create Validation Schemas
**File**: `src/lib/validation.ts` (create new)

```typescript
import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  topic: z.enum(['General Inquiry', 'Key Support', 'B2B Partnerships', 'Careers']),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message too long'),
});

export const quoteFormSchema = z.object({
  serviceType: z.enum(['keys', 'diagnostic', 'immobilizer', 'other']),
  brand: z.string().min(2, 'Brand required').max(50),
  model: z.string().min(1, 'Model required').max(50),
  year: z
    .string()
    .regex(/^\d{4}$/, 'Year must be 4 digits')
    .refine((val) => {
      const year = parseInt(val);
      return year >= 1980 && year <= new Date().getFullYear() + 1;
    }, 'Invalid year'),
  location: z.string().min(2, 'Location required').max(100),
  name: z.string().min(2, 'Name required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number')
    .min(10, 'Phone number too short'),
  message: z.string().max(1000, 'Message too long').optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type QuoteFormData = z.infer<typeof quoteFormSchema>;
```

**Time**: 15 minutes

---

#### 3.3 Update Contact Form with Validation
**File**: `src/pages/Contact.tsx`

**Add imports**:
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactFormData } from '../lib/validation';
```

**Replace form state** (line 16):
```tsx
const [formState, setFormState] = React.useState<'idle' | 'submitting' | 'success'>('idle');

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<ContactFormData>({
  resolver: zodResolver(contactFormSchema),
});
```

**Update submit handler**:
```tsx
const onSubmit = async (data: ContactFormData) => {
  setFormState('submitting');

  try {
    const response = await fetch('http://localhost:3001/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Submission failed');

    setFormState('success');
  } catch (error) {
    console.error('Form error:', error);
    alert('Failed to send message. Please try again or call us directly.');
    setFormState('idle');
  }
};
```

**Update form JSX** (line 95):
```tsx
<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2">
      Your Name
    </label>
    <input
      {...register('name')}
      type="text"
      className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all text-sm"
      placeholder="Jane Cooper"
    />
    {errors.name && (
      <p className="text-red-400 text-xs px-2">{errors.name.message}</p>
    )}
  </div>

  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2">
      Email Address
    </label>
    <input
      {...register('email')}
      type="email"
      className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all text-sm"
      placeholder="jane@example.com"
    />
    {errors.email && (
      <p className="text-red-400 text-xs px-2">{errors.email.message}</p>
    )}
  </div>

  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2">
      Message Topic
    </label>
    <select
      {...register('topic')}
      className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all text-sm appearance-none cursor-pointer"
    >
      <option className="bg-[#0A1F44]">General Inquiry</option>
      <option className="bg-[#0A1F44]">Key Support</option>
      <option className="bg-[#0A1F44]">B2B Partnerships</option>
      <option className="bg-[#0A1F44]">Careers</option>
    </select>
  </div>

  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2">
      How can we help?
    </label>
    <textarea
      {...register('message')}
      rows={5}
      className="w-full glass bg-white/5 border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-red transition-all text-sm resize-none"
      placeholder="Share some details about your problem..."
    />
    {errors.message && (
      <p className="text-red-400 text-xs px-2">{errors.message.message}</p>
    )}
  </div>

  <button
    type="submit"
    disabled={formState === 'submitting'}
    className="w-full py-5 bg-brand-red text-white rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all bg-glow-red flex items-center justify-center gap-3 disabled:opacity-50"
  >
    {formState === 'submitting' ? (
      <>
        Processing{' '}
        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </>
    ) : (
      <>
        SEND MESSAGE <Send className="w-5 h-5" />
      </>
    )}
  </button>
</form>
```

**Time**: 30 minutes

---

#### 3.4 Add Contact Form Backend Endpoint
**File**: `server/api.ts`

**Add to imports**:
```typescript
import { contactFormSchema } from '../src/lib/validation';
```

**Add endpoint**:
```typescript
router.post('/contact', async (req, res) => {
  try {
    const data = contactFormSchema.parse(req.body);

    // TODO: Send email or save to database
    console.log('📧 Contact form submission:', data);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.json({ success: true, message: 'Message received' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});
```

**Add import at top**:
```typescript
import { z } from 'zod';
```

**Time**: 15 minutes

---

## Phase 4: Functional Features (Day 2 - Afternoon)

### Priority: MEDIUM - Make forms actually work

#### 4.1 Apply Same Validation to Quote Form
**Repeat process from 3.3 for** `src/pages/Quote.tsx`:
- Add react-hook-form
- Use `quoteFormSchema`
- Connect to backend endpoint
- Show validation errors

**File**: `server/api.ts` - add quote endpoint:
```typescript
router.post('/quote', async (req, res) => {
  try {
    const data = quoteFormSchema.parse(req.body);

    // Generate reference ID
    const refId = `KP-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    // TODO: Send email or save to database
    console.log('🚗 Quote request:', { refId, ...data });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.json({ success: true, refId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('Quote form error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});
```

**Time**: 45 minutes

---

#### 4.2 Add Mobile Menu Scroll Lock
**File**: `src/components/Navbar.tsx`

**Add after line 31**:
```tsx
// Prevent body scroll when mobile menu open
React.useEffect(() => {
  if (isMobileMenuOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => {
    document.body.style.overflow = '';
  };
}, [isMobileMenuOpen]);
```

**Time**: 5 minutes

---

## Phase 5: Enhancements (Day 3)

### Priority: LOW - Nice to have

#### 5.1 Add Loading Skeletons
**File**: `src/components/Skeleton.tsx` (create new)

```tsx
import { cn } from '../lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-white/5',
        className
      )}
    />
  );
}

export function PageSkeleton() {
  return (
    <div className="pt-32 pb-20 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-16 w-3/4 mx-auto" />
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <div className="grid md:grid-cols-2 gap-8 mt-20">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  );
}
```

**Time**: 15 minutes

---

#### 5.2 Add Toast Notifications
```bash
npm install sonner
```

**File**: `src/main.tsx` - add Toaster:
```tsx
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
```

**Use in forms**:
```tsx
import { toast } from 'sonner';

// Success
toast.success('Message sent successfully!');

// Error
toast.error('Failed to send message');
```

**Time**: 20 minutes

---

#### 5.3 Persist ChatBot History
**File**: `src/components/ChatBot.tsx`

**Add persistence**:
```tsx
const [messages, setMessages] = React.useState<Array<{ role: string; content: string }>>(() => {
  const saved = localStorage.getItem('chatbot-history');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [{ role: 'bot', content: 'Hello! I am your KeyPro assistant...' }];
    }
  }
  return [{ role: 'bot', content: 'Hello! I am your KeyPro assistant...' }];
});

// Save on change
React.useEffect(() => {
  localStorage.setItem('chatbot-history', JSON.stringify(messages));
}, [messages]);
```

**Add clear button**:
```tsx
<button
  onClick={() => {
    setMessages([{ role: 'bot', content: 'Hello! I am your KeyPro assistant...' }]);
    localStorage.removeItem('chatbot-history');
  }}
  className="text-xs text-white/30 hover:text-white/60 transition-colors"
>
  Clear History
</button>
```

**Time**: 15 minutes

---

#### 5.4 Add SEO Meta Tags
```bash
npm install react-helmet-async
```

**File**: `src/main.tsx`:
```tsx
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
);
```

**File**: `src/components/SEO.tsx` (create new):
```tsx
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export function SEO({ title, description, keywords }: SEOProps) {
  const defaultTitle = 'KeyPro Service Center - Premium Automotive Technical Assistance';
  const defaultDescription = 'Professional mobile car key programming, diagnostics, and ECU services in France. 24/7 emergency support.';
  const defaultKeywords = 'car keys, auto locksmith, ECU programming, car diagnostics, immobilizer repair, France';

  return (
    <Helmet>
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
    </Helmet>
  );
}
```

**Use in pages**:
```tsx
import { SEO } from '../components/SEO';

export default function Home() {
  return (
    <>
      <SEO
        title="Home - KeyPro Service Center"
        description="Premium mobile automotive technical services"
      />
      {/* rest of component */}
    </>
  );
}
```

**Time**: 25 minutes

---

## Phase 6: Accessibility (Day 4)

### Priority: MEDIUM - Legal requirement in some jurisdictions

#### 6.1 Add ARIA Labels
**Update all interactive elements**:

**Navbar.tsx**:
```tsx
<button
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  className="md:hidden z-50 p-2 glass rounded-lg"
  aria-label="Toggle mobile menu"
  aria-expanded={isMobileMenuOpen}
>
```

**ChatBot.tsx**:
```tsx
<button
  onClick={() => setIsOpen(!isOpen)}
  className="w-14 h-14 bg-brand-red rounded-full..."
  aria-label="Open chat assistant"
>
```

**Time**: 30 minutes for all components

---

#### 6.2 Keyboard Navigation
**File**: `src/components/Navbar.tsx`

**Add Escape key handler**:
```tsx
React.useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isMobileMenuOpen]);
```

**Time**: 20 minutes

---

#### 6.3 Focus Management
**Install**:
```bash
npm install focus-trap-react
```

**Update mobile menu with focus trap**:
```tsx
import FocusTrap from 'focus-trap-react';

<AnimatePresence>
  {isMobileMenuOpen && (
    <FocusTrap>
      <motion.div className="fixed inset-0 z-40...">
        {/* menu content */}
      </motion.div>
    </FocusTrap>
  )}
</AnimatePresence>
```

**Time**: 15 minutes

---

## Phase 7: Testing & Documentation (Day 5)

### Priority: HIGH - Required for maintenance

#### 7.1 Setup Testing Framework
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**File**: `vitest.config.ts` (create new):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```

**File**: `src/test/setup.ts` (create new):
```typescript
import '@testing-library/jest-dom';
```

**Time**: 15 minutes

---

#### 7.2 Write Key Tests
**File**: `src/components/__tests__/ChatBot.test.tsx` (create new):
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatBot } from '../ChatBot';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ChatBot', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('opens chat window when button clicked', async () => {
    render(<ChatBot />);
    const button = screen.getByLabelText(/open chat/i);
    await userEvent.click(button);
    expect(screen.getByText(/KeyPro AI/i)).toBeInTheDocument();
  });

  it('sends message and displays response', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Hello! How can I help?' }),
    });

    render(<ChatBot />);
    const button = screen.getByLabelText(/open chat/i);
    await userEvent.click(button);

    const input = screen.getByPlaceholderText(/ask about/i);
    await userEvent.type(input, 'Test message');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument();
    });
  });
});
```

**Update package.json**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

**Time**: 45 minutes

---

#### 7.3 Update Documentation
**File**: `README.md` - replace with:
```markdown
# KeyPro Service Center

Premium automotive technical assistance website with AI-powered support.

## Features

- 🔑 Car key services showcase
- 🤖 AI chatbot (Gemini-powered)
- 📋 Quote request system
- 📞 Contact forms
- 📱 Fully responsive

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- Google Gemini API
- React Router v7
- Zod validation
- React Hook Form

## Setup

1. Clone repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

4. Run development servers:
   ```bash
   npm run dev:all
   ```

   This starts:
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

## Scripts

- `npm run dev` - Frontend only
- `npm run dev:server` - API server only
- `npm run dev:all` - Both servers
- `npm run build` - Production build
- `npm run lint` - TypeScript check
- `npm test` - Run tests
- `npm run test:ui` - Test UI

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route components
├── lib/            # Utilities & validation
└── test/           # Test setup

server/
├── index.ts        # Express server
└── api.ts          # API routes
```

## Environment Variables

### Development
- `GEMINI_API_KEY` - Google Gemini API key (server-side)

### Production
- `GEMINI_API_KEY` - Google Gemini API key
- `APP_URL` - Production URL

## Deployment

1. Build frontend: `npm run build`
2. Deploy `dist/` folder to static host
3. Deploy `server/` to Node.js hosting
4. Set environment variables

## License

MIT
```

**Time**: 20 minutes

---

## Summary Timeline

| Phase | Duration | What Gets Done |
|-------|----------|----------------|
| **Phase 1** | 30 min | App runs, error boundary |
| **Phase 2** | 1 hour | API secure, keys protected |
| **Phase 3** | 1.5 hours | Forms validated |
| **Phase 4** | 1 hour | Forms functional, UX polish |
| **Phase 5** | 1.5 hours | Skeletons, toasts, SEO, persistence |
| **Phase 6** | 1.5 hours | ARIA, keyboard nav, focus trap |
| **Phase 7** | 2 hours | Tests, documentation |

**Total**: ~9 hours (1-2 days for experienced dev)

---

## Deployment Checklist

Before going live:

- [ ] All Phase 1 fixes complete
- [ ] All Phase 2 security fixes complete
- [ ] Forms submit successfully
- [ ] API key not in client bundle (verify build output)
- [ ] Environment variables set on hosting
- [ ] HTTPS enabled
- [ ] Domain configured
- [ ] Error monitoring setup (Sentry recommended)
- [ ] Analytics installed (Plausible/GA4)
- [ ] Performance tested (Lighthouse >90)
- [ ] Mobile tested on real devices
- [ ] Forms tested with spam input
- [ ] Accessibility tested (WAVE, axe)

---

## Future Improvements

After baseline complete:

1. **Email Integration** - SendGrid/Resend for form submissions
2. **CMS** - Add Strapi/Contentful for content management
3. **Analytics** - Full conversion tracking
4. **Rate Limiting** - Redis-backed API throttling
5. **Image Optimization** - Move to Cloudinary/CDN
6. **i18n** - Proper French/English localization
7. **PWA** - Service worker, offline support
8. **E2E Tests** - Playwright for critical flows
9. **Monitoring** - Uptime monitoring, error tracking
10. **Performance** - Code splitting, lazy loading

---

## Questions?

Review plan and choose starting point. Recommend: **Phase 1 → Phase 2 → Phase 3** (critical path).

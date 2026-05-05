# Lessons Learned - KeyPro Service Center

## Session 2026-05-05

### Initial Analysis Findings
- **Missing BrowserRouter** - React Router needs wrapper in main.tsx
- **Exposed API key** - Client-side VITE_GEMINI_API_KEY visible in browser
- **Fake form submissions** - setTimeout instead of real backend
- **No input validation** - XSS risk, bad data possible

### Architecture Decisions
- Backend proxy pattern for API keys (Express server on :3001)
- Zod + React Hook Form for validation
- Error boundary at root level
- Environment validation on server startup

### Token Optimization Strategies
- Read specific sections instead of full files
- Use bash for file content when hooks truncate
- Skip verbose explanations in code
- Focus on diffs, not full rewrites

### Common Pitfalls to Avoid
- Never expose API keys in client bundle
- Always wrap Router components in BrowserRouter
- Validate env vars before using them
- Add error boundaries early

---

## Implementation Notes

### Phase 1 - Critical Fixes ✅
**Completed**: 2026-05-05

**Changes**:
- Added `BrowserRouter` wrapper in main.tsx
- Created `ErrorBoundary` component (class-based)
- Wrapped App with ErrorBoundary

**Issues**:
- TS error: `useDefineForClassFields: false` requires explicit `readonly props!: Props`

**Files**:
- `src/main.tsx`, `src/components/ErrorBoundary.tsx`

### Phase 2 - Security ✅
**Completed**: 2026-05-05

**Changes**:
- Created Express backend (:3001)
- Moved API key server-side
- ChatBot now uses fetch()

**Issues**:
- Google GenAI SDK changed: `new GoogleGenAI({ apiKey })` and `ai.models.generateContent()`

**Files**:
- `server/index.ts`, `server/api.ts`, `server/env.ts`
- Modified: `ChatBot.tsx`, `package.json`

**Deps**: concurrently

### Phase 3 - Input Validation ✅
**Completed**: 2026-05-05

**Changes**:
- Installed Zod, React Hook Form, @hookform/resolvers
- Created validation schemas in `src/lib/validation.ts`
- Updated Contact.tsx with full validation
- Updated Quote.tsx with multi-step validation
- Added backend endpoints `/api/contact` and `/api/quote`

**Issues**:
- Zod error property: `error.issues` not `error.errors`
- Multi-step forms: setValue() to pass data between steps

**Files**:
- `src/lib/validation.ts` - Zod schemas
- `src/pages/Contact.tsx` - React Hook Form integration
- `src/pages/Quote.tsx` - React Hook Form with multi-step
- `server/api.ts` - Added contact + quote endpoints

**Deps**: zod, react-hook-form, @hookform/resolvers

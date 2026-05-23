# Comprehensive Codebase Refactoring Plan

**Goal:** Improve maintainability, readability, and type safety across the application while adhering to strict separation of concerns, without introducing regressions to our stable, feature-complete state.

---

## 🏗️ Phase 1: Backend Architecture (Service Pattern)
**Objective:** Eliminate "Fat Controllers" and enforce a strict Service-Controller pattern. The controller's only job is handling HTTP requests/responses; all business logic and database interactions must live in Services.

**Tasks:**
- [x] Create `AdminService` (or break it down further into `AnalyticsService`, `GalleryService`, `ManagementService`).
- [x] Migrate all Prisma queries and business logic out of `server/src/controllers/admin.controller.ts` into the new services.
- [x] Update `admin.controller.ts` to strictly parse `req`, call the injected service, and format `res`.
- [x] Update Vitest tests to mock the new services instead of mocking Prisma directly in the controller tests.

## 🔗 Phase 2: Shared Type Synchronization
**Objective:** Eliminate duplicate type definitions between the frontend and backend to guarantee a Single Source of Truth (SSOT).

**Tasks:**
- [x] Create a `shared/types` directory at the project root (or inside the server folder if preferred, exporting them to the frontend).
- [x] Migrate `server/src/types/index.ts` and `src/types/index.ts` into a unified type definition file.
- [x] Expose Prisma-generated types safely to the frontend using shared DTOs (Data Transfer Objects).
- [x] Refactor both frontend and backend imports to utilize the new shared types.

## 🧩 Phase 3: Frontend Componentization & State Management
**Objective:** Break down monolithic React pages into reusable, atomic UI components and custom hooks.

**Tasks:**
- [x] Audit `src/pages/dashboard/AdminDashboard.tsx` and extract structural elements (e.g., `StatCard`, `DashboardSection`) into `src/components/dashboard/`.
- [x] Refactor massive management tables (Quotes, Contacts, Users) into smaller sub-components (e.g., `TableToolbar`, `TableRow`, `PaginationFooter`).
- [x] Extract complex local state (modal visibility, form handling) from UI components into custom hooks (e.g., `useBulkActions`, `useModalManager`).

## ⚙️ Phase 4: Express Configuration & Middleware Modularity
**Objective:** Clean up the main backend entry point (`server/index.ts`) for better readability and easier testing.

**Tasks:**
- [x] Extract all security middleware configurations (Helmet, CORS, CSRF, Rate Limiting) into `server/src/config/middleware.ts`.
- [x] Extract route mounting into a centralized `server/src/routes/index.ts` router registry.
- [x] Ensure `server/index.ts` is strictly responsible for bootstrapping the server and initializing background jobs/Sentry.

---

**Execution Strategy:** 
We will execute this plan one phase at a time. After each major refactor, we will run the following verification suite:
1. `npm run test` (Vitest Unit Tests)
2. `npm run lint` (Type Checking & Linting)
3. `npm run test:e2e` (Playwright End-to-End Tests)

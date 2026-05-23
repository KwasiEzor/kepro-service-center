# Implementation Plan: The 3 Remaining Concerns

Based on the recent progress and the roadmap outlined in our status documents, this plan addresses the final three major operational and feature concerns required to bring the project to full maturity: **Email Enhancements (Communication), Advanced Analytics, and Performance & Monitoring (Quality & Production Readiness).**

## 1. Email Enhancements & Communication

### Objective
Complete the communication loop by implementing automated password resets and real-time push notifications for administrators.

### Implementation Steps
1. **Password Reset Flow:**
   - **Backend:** Create new endpoints (`/api/auth/forgot-password`, `/api/auth/reset-password`).
   - **Database:** Update the Prisma schema to add `resetToken` and `resetTokenExpiry` fields to the `User` model, or create a separate `PasswordReset` model for better normalization.
   - **Service:** Update `email.service.ts` with a localized French/English password reset template.
   - **Frontend:** Create `ForgotPassword.tsx` and `ResetPassword.tsx` pages with Zod validation.
2. **Push Notifications (Admins):**
   - Implement Web Push API or a lightweight WebSocket (e.g., `socket.io`) to send real-time notifications to connected admin clients when a new Quote or Contact is submitted.

### Verification
- Ensure the reset token is securely hashed in the database and expires within 15-30 minutes.
- Verify admins receive instant alerts without needing to refresh the dashboard.

---

## 2. Advanced Analytics

### Objective
Expand the admin dashboard from basic counters to actionable business intelligence visualizations.

### Implementation Steps
1. **Backend Aggregations (`admin.controller.ts`):**
   - Add a `getRevenueChart` method using Prisma's `groupBy` and date grouping to fetch monthly/weekly revenue.
   - Add a `getServiceDistribution` method to count quotes grouped by `serviceType`.
2. **Frontend Integration:**
   - Install a charting library like `recharts` or `chart.js` (`npm install recharts`).
   - Create a `RevenueChart.tsx` component (Line or Bar chart).
   - Create a `ServiceDistributionChart.tsx` component (Pie or Doughnut chart).
   - Integrate these into the top section of the `AdminDashboard.tsx`.

### Verification
- Ensure charts render correctly in both light and dark modes.
- Verify that data accurately reflects the underlying database records.

---

## 3. Performance, Testing & Monitoring (Phase 7)

### Objective
Guarantee application stability, establish a safety net against regressions, and monitor production health.

### Implementation Steps
1. **Error Tracking Integration (Sentry):**
   - Install `@sentry/react` and `@sentry/node`.
   - Initialize Sentry in `main.tsx` and `server/index.ts`.
   - Ensure source maps are uploaded during the build step.
2. **Comprehensive Testing Suite:**
   - **Unit Tests:** Expand `Vitest` coverage for critical services (`auth.service.test.ts`, `quote.service.test.ts`).
   - **E2E Tests:** Ensure `Playwright` covers critical user journeys (Registration, Submitting a Quote, Admin Login).
3. **Automated Performance Checks (Lighthouse):**
   - Integrate `@lhci/cli` (Lighthouse CI) into a GitHub Actions workflow (`.github/workflows/ci.yml`).
   - Set failure thresholds for Performance, Accessibility, Best Practices, and SEO (>90).

### Verification
- Trigger a mock error to confirm it appears in the Sentry dashboard with the correct stack trace.
- Run `npm run test` and `npm run test:e2e` to verify the CI pipeline passes.

---

## Rollout Strategy
We will implement these concerns sequentially. I recommend starting with **Performance, Testing & Monitoring**, as it establishes a safety net before we build the final complex features (Analytics and Password Reset).

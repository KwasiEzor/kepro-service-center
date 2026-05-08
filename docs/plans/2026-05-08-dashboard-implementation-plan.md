# KeyPro Service Center - Dashboard System Implementation Plan

**Date:** 2026-05-08
**Author:** Claude Code
**Status:** Ready for Implementation

---

## Executive Summary

Comprehensive dashboard system with role-based access control for KeyPro Service Center. Two user types: **Admin** (full CMS control) and **Normal User** (personal service management).

**Tech Stack:**
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS v4
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL 16+ with Prisma ORM
- Auth: JWT + bcrypt
- File Storage: Local disk with multer (production: migrate to S3/Cloudinary)
- UI Components: shadcn/ui + Radix UI

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (React SPA)                       │
├─────────────────────────────────────────────────────────────┤
│  Public Routes          │  Protected Routes                 │
│  - Home                 │  - /dashboard (user)              │
│  - Services             │  - /admin (admin only)            │
│  - About, FAQ, etc.     │  - /profile                       │
└─────────────────────────────────────────────────────────────┘
                          │
                    JWT Token Auth
                          │
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Express API)                      │
├─────────────────────────────────────────────────────────────┤
│  Auth Middleware │ Role Guards │ Validation │ File Upload   │
├─────────────────────────────────────────────────────────────┤
│  Controllers:                                                │
│  - AuthController (login, register, refresh)                │
│  - UserController (profile, settings)                       │
│  - AdminController (CMS operations)                         │
│  - GalleryController (image CRUD)                           │
│  - QuoteController (quote requests)                         │
│  - ContactController (contact submissions)                  │
└─────────────────────────────────────────────────────────────┘
                          │
                    Prisma ORM
                          │
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│  - users (id, email, password, role, created_at)            │
│  - sessions (id, user_id, token, expires_at)                │
│  - images (id, url, alt, category, uploaded_by, size)       │
│  - quotes (id, user_id, service, vehicle, status, data)     │
│  - contacts (id, user_id?, name, email, message, status)    │
│  - services (id, name_fr, name_en, description, price)      │
│  - faqs (id, question_fr, question_en, answer_fr, answer_en)│
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  USER
  ADMIN
}

enum QuoteStatus {
  PENDING
  REVIEWING
  APPROVED
  REJECTED
}

enum ContactStatus {
  NEW
  READ
  REPLIED
  ARCHIVED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  firstName     String?
  lastName      String?
  phone         String?
  role          UserRole  @default(USER)
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  quotes        Quote[]
  contacts      Contact[]
  uploadedImages Image[] @relation("UploadedBy")

  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}

model Image {
  id          String   @id @default(cuid())
  url         String
  filename    String
  alt         String?
  category    String?  // "services", "gallery", "brands", "hero"
  size        Int      // bytes
  mimeType    String
  uploadedBy  String
  createdAt   DateTime @default(now())

  uploader    User     @relation("UploadedBy", fields: [uploadedBy], references: [id])

  @@index([category])
  @@index([uploadedBy])
  @@map("images")
}

model Quote {
  id          String      @id @default(cuid())
  userId      String?

  // Vehicle info
  brand       String
  model       String
  year        String
  vin         String?

  // Service info
  serviceType String      // "key_programming", "diagnostic", "ecu"
  description String
  urgency     String?     // "normal", "urgent", "emergency"

  // Contact info (for non-logged users)
  name        String?
  email       String?
  phone       String?

  status      QuoteStatus @default(PENDING)
  adminNotes  String?
  estimatedPrice Float?

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  user        User?       @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([status])
  @@map("quotes")
}

model Contact {
  id        String        @id @default(cuid())
  userId    String?

  name      String
  email     String
  phone     String?
  subject   String
  message   String

  status    ContactStatus @default(NEW)
  adminReply String?

  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  user      User?         @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([status])
  @@map("contacts")
}

model Service {
  id            String   @id @default(cuid())
  nameFr        String
  nameEn        String
  descriptionFr String
  descriptionEn String
  icon          String?
  priceFrom     Float?
  priceTo       Float?
  duration      String?
  order         Int      @default(0)
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("services")
}

model FAQ {
  id         String   @id @default(cuid())
  questionFr String
  questionEn String
  answerFr   String
  answerEn   String
  category   String?
  order      Int      @default(0)
  active     Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("faqs")
}
```

---

## Backend Structure

```
server/
├── index.ts                    # Entry point
├── env.ts                      # Environment validation
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration files
├── src/
│   ├── config/
│   │   ├── database.ts         # Prisma client
│   │   └── auth.ts             # JWT config
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification
│   │   ├── roleGuard.ts        # Role-based access
│   │   ├── validate.ts         # Request validation
│   │   └── upload.ts           # Multer config
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── gallery.controller.ts
│   │   ├── quote.controller.ts
│   │   └── contact.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── admin.service.ts
│   │   └── storage.service.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── admin.routes.ts
│   │   └── public.routes.ts
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── utils/
│       ├── validators.ts       # Zod schemas
│       ├── errors.ts           # Custom errors
│       └── response.ts         # API response helpers
```

---

## Frontend Structure

```
src/
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ForgotPassword.tsx
│   ├── dashboard/
│   │   ├── UserDashboard.tsx   # Normal user dashboard
│   │   ├── Profile.tsx
│   │   ├── MyQuotes.tsx
│   │   └── MyContacts.tsx
│   ├── admin/
│   │   ├── AdminDashboard.tsx  # Admin overview
│   │   ├── Gallery.tsx         # Image management
│   │   ├── Quotes.tsx          # Quote management
│   │   ├── Contacts.tsx        # Contact management
│   │   ├── Services.tsx        # Service CRUD
│   │   ├── FAQs.tsx            # FAQ CRUD
│   │   └── Users.tsx           # User management
│   └── [existing pages...]
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleGuard.tsx
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── DashboardHeader.tsx
│   │   └── StatCard.tsx
│   ├── admin/
│   │   ├── ImageUpload.tsx
│   │   ├── ImageGallery.tsx
│   │   ├── DataTable.tsx
│   │   ├── QuoteCard.tsx
│   │   └── ContactCard.tsx
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── [more components...]
│   └── [existing components...]
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useAdmin.ts
│   └── useToast.ts
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── api.ts                  # Axios instance
│   ├── auth.ts                 # Auth helpers
│   └── utils.ts
└── types/
    └── index.ts
```

---

## Implementation Phases

### Phase 1: Database & Backend Foundation (Days 1-2)

**1.1 Database Setup**
- Install Prisma: `npm install -D prisma && npm install @prisma/client`
- Initialize: `npx prisma init`
- Create schema (see above)
- Setup PostgreSQL locally or Docker
- Run migration: `npx prisma migrate dev --name init`

**1.2 Auth System**
- Install: `npm install bcryptjs jsonwebtoken zod multer`
- Install types: `npm install -D @types/bcryptjs @types/jsonwebtoken @types/multer`
- Create auth service (register, login, refresh, verify)
- Create JWT middleware
- Create role guard middleware

**1.3 Backend Structure**
- Reorganize server/ with new structure
- Setup controllers and routes
- Add validation with Zod
- Error handling middleware

### Phase 2: Admin Dashboard Backend (Days 3-4)

**2.1 Gallery Management**
- Image upload endpoint with multer
- Image CRUD endpoints
- Category filtering
- Image optimization (sharp library)

**2.2 Content Management**
- Services CRUD endpoints
- FAQ CRUD endpoints
- Quotes management endpoints
- Contacts management endpoints

**2.3 User Management**
- List users endpoint
- Update user role endpoint
- Delete user endpoint
- User stats endpoint

### Phase 3: Frontend Auth & UI Foundation (Days 5-6)

**3.1 shadcn/ui Setup**
- Install: `npx shadcn@latest init`
- Add components: button, input, form, table, dialog, dropdown-menu, card, badge, tabs

**3.2 Auth Context & Routes**
- Create AuthContext with login/logout/register
- Create ProtectedRoute component
- Create RoleGuard component
- Build Login page
- Build Register page

**3.3 Dashboard Layout**
- Create DashboardLayout with sidebar
- Create navigation
- Create header with user menu
- Responsive design

### Phase 4: User Dashboard (Days 7-8)

**4.1 User Dashboard Pages**
- Dashboard overview (stats, recent activity)
- Profile page (edit personal info)
- My Quotes page (view quote history)
- My Contacts page (view contact history)

**4.2 User Features**
- Update profile form
- View quote status
- Download quote PDFs (future)

### Phase 5: Admin Dashboard (Days 9-12)

**5.1 Admin Overview**
- Stats cards (total quotes, contacts, users, images)
- Recent activity feed
- Quick actions

**5.2 Image Gallery**
- Upload multiple images
- Image grid with preview
- Delete images
- Category assignment
- Search and filter
- Pagination

**5.3 Quote Management**
- DataTable with all quotes
- Filter by status
- View quote details
- Update status
- Add admin notes
- Set estimated price
- Export to CSV

**5.4 Contact Management**
- DataTable with all contacts
- Filter by status
- View contact details
- Mark as read/replied
- Add admin reply
- Archive contacts

**5.5 Content Management**
- Services CRUD (add, edit, delete)
- FAQ CRUD
- Inline editing
- Drag-and-drop reordering

**5.6 User Management**
- User list table
- Change user roles
- Deactivate users
- View user activity

### Phase 6: Polish & Testing (Days 13-14)

**6.1 UI/UX Polish**
- Loading states
- Error states
- Empty states
- Toast notifications
- Confirmation dialogs
- Smooth transitions

**6.2 Security Hardening**
- Rate limiting
- CSRF protection
- Input sanitization
- SQL injection prevention (Prisma handles this)
- XSS prevention

**6.3 Testing**
- Backend API tests
- Frontend component tests
- E2E tests (Playwright)
- Security testing

**6.4 Documentation**
- API documentation
- User guide
- Admin guide
- Deployment guide

---

## API Endpoints

### Auth
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login
POST   /api/auth/refresh           # Refresh token
POST   /api/auth/logout            # Logout
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
```

### User (Protected)
```
GET    /api/user/profile           # Get current user
PUT    /api/user/profile           # Update profile
GET    /api/user/quotes            # Get user's quotes
GET    /api/user/contacts          # Get user's contacts
POST   /api/user/change-password   # Change password
```

### Admin (Admin Only)
```
# Gallery
GET    /api/admin/gallery          # List images (paginated, filtered)
POST   /api/admin/gallery          # Upload image(s)
DELETE /api/admin/gallery/:id      # Delete image
PUT    /api/admin/gallery/:id      # Update image metadata

# Quotes
GET    /api/admin/quotes           # List all quotes (filtered, paginated)
GET    /api/admin/quotes/:id       # Get quote details
PUT    /api/admin/quotes/:id       # Update quote (status, notes, price)
DELETE /api/admin/quotes/:id       # Delete quote

# Contacts
GET    /api/admin/contacts         # List all contacts
GET    /api/admin/contacts/:id     # Get contact details
PUT    /api/admin/contacts/:id     # Update contact (status, reply)
DELETE /api/admin/contacts/:id     # Delete contact

# Services
GET    /api/admin/services         # List services
POST   /api/admin/services         # Create service
PUT    /api/admin/services/:id     # Update service
DELETE /api/admin/services/:id     # Delete service

# FAQs
GET    /api/admin/faqs             # List FAQs
POST   /api/admin/faqs             # Create FAQ
PUT    /api/admin/faqs/:id         # Update FAQ
DELETE /api/admin/faqs/:id         # Delete FAQ

# Users
GET    /api/admin/users            # List users (paginated)
GET    /api/admin/users/:id        # Get user details
PUT    /api/admin/users/:id        # Update user (role, status)
DELETE /api/admin/users/:id        # Delete user

# Stats
GET    /api/admin/stats            # Dashboard statistics
```

### Public
```
POST   /api/quotes                 # Submit quote (guest or logged-in)
POST   /api/contacts               # Submit contact (guest or logged-in)
GET    /api/services               # Get public services list
GET    /api/faqs                   # Get public FAQs
```

---

## Security Considerations

1. **Authentication**
   - JWT with 15min access token, 7-day refresh token
   - httpOnly cookies for refresh tokens
   - bcrypt with salt rounds 12 for passwords

2. **Authorization**
   - Role-based middleware guards
   - Admin-only routes protected
   - User can only access their own data

3. **Input Validation**
   - Zod schemas for all endpoints
   - Sanitize inputs
   - File upload validation (type, size)

4. **Rate Limiting**
   - express-rate-limit on auth endpoints
   - 5 login attempts per 15min
   - 10 API requests per minute per IP

5. **CORS**
   - Whitelist frontend origin
   - Credentials: true

6. **File Upload**
   - Max size: 5MB per image
   - Allowed types: jpg, png, webp
   - Virus scanning (production)
   - Store outside public root

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/keypro"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880  # 5MB

# Email (future)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Gemini (existing)
GEMINI_API_KEY="your-gemini-key"
```

---

## Dependencies to Install

### Backend
```bash
npm install @prisma/client bcryptjs jsonwebtoken zod multer express-rate-limit helmet cors
npm install -D prisma @types/bcryptjs @types/jsonwebtoken @types/multer @types/cors
```

### Frontend
```bash
# shadcn/ui (will auto-install radix-ui)
npx shadcn@latest init

# Additional
npm install axios react-hook-form @hookform/resolvers zod date-fns
npm install -D @types/node
```

---

## File Storage Strategy

**Development:**
- Local disk storage with multer
- Store in `server/uploads/`
- Serve via Express static middleware

**Production (Future Migration):**
- Option 1: AWS S3 + CloudFront
- Option 2: Cloudinary (simpler, auto-optimization)
- Option 3: Vercel Blob Storage

---

## Testing Strategy

### Backend Tests (Jest + Supertest)
```typescript
describe('Auth API', () => {
  it('should register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'Test123!' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject weak passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: '123' });

    expect(res.status).toBe(400);
  });
});
```

### Frontend Tests (Vitest + Testing Library)
```typescript
describe('Login Page', () => {
  it('should render login form', () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should show validation errors', async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });
});
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Create initial admin user via seed script
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] File upload directory writable
- [ ] Logs configured
- [ ] Error monitoring (Sentry)
- [ ] Database backups configured
- [ ] CDN for static assets
- [ ] Performance monitoring

---

## Future Enhancements (Post-MVP)

1. **Email Notifications**
   - Quote status updates
   - Contact form confirmations
   - Password reset emails

2. **Advanced Features**
   - Calendar/booking system
   - Invoice generation
   - Payment integration
   - SMS notifications

3. **Analytics**
   - Admin analytics dashboard
   - User behavior tracking
   - Quote conversion rates

4. **Mobile App**
   - React Native app
   - Push notifications

5. **Internationalization**
   - Extend i18n to dashboard
   - Admin can edit translations

---

## Success Metrics

- Admin can manage all content without code changes
- Users can track their service requests
- Image gallery supports 1000+ images
- Dashboard loads in <2s
- Mobile responsive
- 99.9% uptime
- Zero security vulnerabilities

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database performance with growth | High | Add indexes, implement pagination, query optimization |
| File storage costs | Medium | Implement image compression, lazy loading, CDN |
| Security breach | Critical | Regular audits, dependency updates, rate limiting |
| User adoption | Medium | Clean UI, onboarding guide, tooltips |

---

## Conclusion

This plan delivers a production-ready, scalable dashboard system with professional-grade architecture. The phased approach allows for iterative development and testing. Total estimated time: 12-14 days for full implementation.

**Next Steps:**
1. Review and approve plan
2. Setup PostgreSQL database
3. Begin Phase 1 implementation

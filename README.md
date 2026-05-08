# KeyPro Service Center

Premium automotive service center website specializing in car keys, diagnostics, and mobile technical assistance. Built with modern web technologies and powered by Google's Gemini AI for intelligent customer support.

## Features

- 🔑 **Automotive Services** - Lost keys, key programming, ECU diagnostics
- 🤖 **AI-Powered Chatbot** - 24/7 intelligent assistance using Google Gemini
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop
- ⚡ **Performance-First** - Built with Vite for lightning-fast load times
- 🎨 **Industrial Design** - Angular shapes and dark theme for automotive aesthetic
- 🌐 **Multi-Page Application** - Services, About, Brands, Contact, Quote request

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Animations**: motion (framer-motion)
- **Icons**: lucide-react
- **AI**: Google Gemini API
- **Form Validation**: react-hook-form + zod

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/keypro-service-center.git
cd keypro-service-center
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Gemini API key:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://ai.google.dev/

4. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript type checking
- `npm run pre-deploy` - Run all quality checks before deployment
- `npm run clean` - Clean build artifacts

## Quality Checks

Before deploying, run the pre-deployment script:

```bash
npm run pre-deploy
```

This will verify:
- ✅ Node.js version compatibility
- ✅ Environment variables
- ✅ TypeScript type checking
- ✅ Dependency health
- ✅ Build success
- ✅ Security audit

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

#### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/keypro-service-center)

#### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/keypro-service-center)

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
│   └── FAQ.tsx
├── components/     # Reusable components
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   └── ChatBot.tsx
├── lib/            # Utilities
│   ├── utils.ts
│   └── validation.ts
├── App.tsx         # Route definitions
├── main.tsx        # React entry point
└── index.css       # Global styles & design system
```

## Design System

All colors and utilities are centralized in `src/index.css`:

### Brand Colors
- Primary Orange: `#FF6B2C`
- Secondary Orange: `#FF8C4D`
- Dark Background: `#0D0D0D`
- Dark Gray: `#1A1A1A`

### Utility Classes
- `.bg-gradient-orange` - Orange gradient left to right
- `.text-gradient-orange` - Orange gradient text
- `.bg-glow-orange` - Orange glow shadow
- `.clip-angular-*` - Industrial angular shapes
- `.glass` - Glass morphism effect

Always use CSS variables for colors:
```tsx
// ✅ Good
className="bg-[var(--color-brand-orange-primary)]"

// ❌ Bad
className="bg-[#FF6B2C]"
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run quality checks: `npm run pre-deploy`
5. Commit your changes: `git commit -m 'feat: add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Email: support@keypro.service

# Deployment Guide

## Pre-Deployment Checklist

Run the pre-deployment script to verify everything is ready:

```bash
npm run pre-deploy
```

This script will:
- ✅ Check Node.js version
- ✅ Verify environment variables
- ✅ Install dependencies
- ✅ Run TypeScript type checking
- ✅ Check for unused dependencies
- ✅ Build the project
- ✅ Verify build output
- ✅ Run security audit
- ✅ Check for console.log statements

## Environment Variables

Required environment variables for production:

- `VITE_GEMINI_API_KEY` - Google Gemini API key for the chatbot

### Setting Environment Variables

#### Vercel
```bash
vercel env add VITE_GEMINI_API_KEY
```

Or via Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add `VITE_GEMINI_API_KEY` with your API key
3. Select Production, Preview, and Development environments

#### Netlify
```bash
netlify env:set VITE_GEMINI_API_KEY your_api_key_here
```

Or via Netlify Dashboard:
1. Go to Site Settings → Environment Variables
2. Add `VITE_GEMINI_API_KEY` = your_api_key_here

## Deployment Options

### Option 1: Vercel (Recommended)

#### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/keypro-service-center)

#### Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

Configuration: `vercel.json`

### Option 2: Netlify

#### One-Click Deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/keypro-service-center)

#### Manual Deploy
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build locally
npm run build

# Deploy
netlify deploy --prod
```

Configuration: `netlify.toml`

### Option 3: Self-Hosted (VPS/Docker)

#### Using Docker

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Build and run:
```bash
docker build -t keypro-service-center .
docker run -p 80:80 -e VITE_GEMINI_API_KEY=your_key keypro-service-center
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:
- Runs quality checks on every push/PR
- Deploys preview for pull requests
- Deploys to production on merge to main

### Setup GitHub Actions

Add these secrets to your GitHub repository:
1. Go to Settings → Secrets and variables → Actions
2. Add:
   - `VITE_GEMINI_API_KEY` - Your Gemini API key
   - `VERCEL_TOKEN` - Vercel deployment token
   - `VERCEL_ORG_ID` - Vercel organization ID
   - `VERCEL_PROJECT_ID` - Vercel project ID

Get Vercel credentials:
```bash
vercel link
cat .vercel/project.json
```

## Performance Optimization

### Build Optimization
- ✅ Code splitting enabled (Vite default)
- ✅ CSS minification
- ✅ Asset hashing for cache busting
- ✅ Tree shaking

### Runtime Optimization
- ✅ Lazy loading for routes
- ✅ Image optimization via CDN
- ✅ Font preloading
- ✅ Cache headers for static assets

### Monitoring
Recommended tools:
- **Analytics**: Vercel Analytics, Google Analytics
- **Error Tracking**: Sentry
- **Performance**: Vercel Speed Insights, Lighthouse CI

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Restart dev server after changing .env
- For production, set variables in hosting platform

### Type Errors
```bash
npm run lint
```

### Security Vulnerabilities
```bash
npm audit --audit-level=high
npm audit fix
```

## Post-Deployment

### Verification
1. Check website loads: `https://your-domain.com`
2. Test chatbot functionality
3. Verify all routes work
4. Check mobile responsiveness
5. Run Lighthouse audit

### DNS Configuration
Point your domain to the deployment:
- **Vercel**: Add A record to `76.76.21.21`
- **Netlify**: Add A record to `75.2.60.5`

## Rollback

### Vercel
```bash
vercel rollback
```

### Netlify
```bash
netlify rollback
```

## Support

For deployment issues:
- Check build logs in your hosting platform
- Verify all environment variables are set
- Ensure Node.js version matches (v20+)
- Review error messages in browser console

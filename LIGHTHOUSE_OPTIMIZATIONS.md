# Lighthouse Optimization Guide

## Current Scores → Target Scores

| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| Performance | 49 🔴 | 90+ 🟢 | In Progress |
| Accessibility | 88 🟠 | 95+ 🟢 | In Progress |
| Best Practices | 100 🟢 | 100 🟢 | ✅ Maintained |
| SEO | 73 🟠 | 95+ 🟢 | In Progress |

---

## ✅ Optimizations Implemented

### 1. **Vite Build Configuration**

**File:** `vite.config.ts`

**Changes:**
- ✅ Code splitting (React, Motion, Forms, i18n vendors)
- ✅ Terser minification with console removal
- ✅ Gzip compression (`.gz` files)
- ✅ Brotli compression (`.br` files)

**Expected Impact:**
- Bundle size reduction: ~30%
- Load time improvement: ~40%

### 2. **SEO Meta Tags**

**File:** `index.html`

**Changes:**
- ✅ Descriptive title with keywords
- ✅ Meta description (160 chars)
- ✅ Keywords meta tag
- ✅ Open Graph tags (Facebook)
- ✅ Twitter Card tags
- ✅ Canonical URL
- ✅ Theme color
- ✅ Language set to `fr` (French)

**Expected Impact:**
- SEO score: 73 → 95+

### 3. **Performance Preconnects**

**File:** `index.html`

**Changes:**
- ✅ Preconnect to Google Fonts
- ✅ DNS prefetch for Unsplash images

**Expected Impact:**
- Faster font loading
- Faster image loading

### 4. **Lazy Image Component**

**File:** `src/components/LazyImage.tsx`

**Features:**
- ✅ Intersection Observer for lazy loading
- ✅ Native lazy loading attribute
- ✅ Async decoding
- ✅ Fade-in transition on load

**Usage:**
```tsx
import { LazyImage } from './components/LazyImage';

<LazyImage
  src="https://..."
  alt="Descriptive text"
  width={800}
  height={600}
  loading="lazy"
/>
```

---

## 🔧 Additional Optimizations Needed

### Performance (Target: 90+)

#### 1. **Image Optimization** (HIGH PRIORITY)

Current issue: **1,187 KB savings** with WebP/AVIF

**Solution:**
```bash
# Install image optimization tools
npm install -D vite-plugin-imagemin @vite-plugin/imagemin-webp

# Or use online tools:
# - https://squoosh.app/
# - https://tinypng.com/
```

**Action Items:**
- [ ] Convert all JPG/PNG to WebP format
- [ ] Use responsive images with `srcset`
- [ ] Implement image CDN (Cloudinary, ImageKit)
- [ ] Add width/height attributes to all images

#### 2. **Reduce JavaScript** (HIGH PRIORITY)

Current issue: **1,014 KB unused JavaScript**

**Solutions:**
- [ ] Lazy load routes with React.lazy()
- [ ] Defer non-critical scripts
- [ ] Remove unused dependencies
- [ ] Tree-shake unused code

**Implementation:**
```tsx
// App.tsx - Lazy load routes
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}
```

#### 3. **Reduce Network Payload** (HIGH PRIORITY)

Current issue: **1,571 KB total payload**

**Solutions:**
- [ ] Enable server compression (Gzip/Brotli) ✅ Done
- [ ] Remove unused CSS
- [ ] Minimize CSS (Tailwind purge) ✅ Auto
- [ ] Use CDN for static assets

#### 4. **Improve LCP** (CRITICAL)

Current: **16.9s** | Target: **<2.5s**

**Solutions:**
- [ ] Optimize hero image (largest element)
- [ ] Preload critical assets
- [ ] Remove render-blocking resources
- [ ] Use `fetchpriority="high"` on LCP image

**Example:**
```html
<!-- Preload hero image -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">
```

```tsx
// In component
<img
  src="/hero.webp"
  fetchPriority="high"
  loading="eager"
/>
```

#### 5. **Reduce Total Blocking Time** (MEDIUM)

Current: **300ms** | Target: **<200ms**

**Solutions:**
- [ ] Code split large bundles ✅ Done
- [ ] Defer non-critical JavaScript
- [ ] Use web workers for heavy computations
- [ ] Reduce JavaScript execution time

#### 6. **Font Optimization** (MEDIUM)

**Current:** Google Fonts loaded externally

**Solutions:**
```html
<!-- Add to index.html -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" as="style">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" media="print" onload="this.media='all'">
```

Or self-host fonts:
```bash
# Install
npm install fontsource-inter

# Import in main.tsx
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
```

---

### Accessibility (Target: 95+)

Current issues:
- ❌ Elements without accessible names
- ❌ Heading order not sequential

#### Fix Accessible Names

**Example issues:**
```tsx
// ❌ Bad - No accessible name
<button className="...">
  <Icon />
</button>

// ✅ Good - Has aria-label
<button className="..." aria-label="Close menu">
  <Icon />
</button>
```

**Action Items:**
- [ ] Add `aria-label` to icon-only buttons
- [ ] Add `alt` text to all images
- [ ] Add labels to form inputs

#### Fix Heading Order

**Current issue:** Headings skip levels (h1 → h3)

**Example fix:**
```tsx
// ❌ Bad
<h1>Page Title</h1>
<h3>Section Title</h3> {/* Skips h2 */}

// ✅ Good
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection</h3>
```

**Action Items:**
- [ ] Audit all headings
- [ ] Ensure sequential order (h1 → h2 → h3)
- [ ] One h1 per page

---

### SEO (Target: 95+)

Current issues:
- ❌ Document missing meta description ✅ Fixed
- ❌ Links without descriptive text

#### Fix Link Accessibility

**Example issues:**
```tsx
// ❌ Bad - Not descriptive
<a href="/services">Click here</a>
<a href="/contact">Learn more</a>

// ✅ Good - Descriptive
<a href="/services">View our automotive services</a>
<a href="/contact">Contact our technical support team</a>
```

**Action Items:**
- [ ] Audit all links
- [ ] Ensure descriptive anchor text
- [ ] Add `title` attribute where needed

---

## 📊 Testing After Optimizations

### 1. **Build and Analyze**

```bash
# Build for production
npm run build

# Analyze bundle size
npx vite-bundle-visualizer
```

### 2. **Run Lighthouse**

```bash
# Chrome DevTools
# 1. Open Chrome DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Select categories
# 4. Click "Analyze page load"

# Or use CLI
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

### 3. **Check Core Web Vitals**

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTI** (Time to Interactive): < 3.8s

---

## 🎯 Quick Wins (Immediate)

Priority optimizations with biggest impact:

1. **✅ Add meta description** - DONE
2. **✅ Enable compression** - DONE
3. **✅ Code splitting** - DONE
4. **⏳ Convert images to WebP** - TODO
5. **⏳ Lazy load routes** - TODO
6. **⏳ Preload LCP image** - TODO
7. **⏳ Fix heading order** - TODO
8. **⏳ Add aria-labels** - TODO

---

## 📈 Expected Results

After implementing all optimizations:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Performance | 49 | 92+ | +88% |
| LCP | 16.9s | 2.1s | -88% |
| TBT | 300ms | 120ms | -60% |
| Bundle Size | 689 KB | 450 KB | -35% |
| Accessibility | 88 | 97 | +10% |
| SEO | 73 | 98 | +34% |

---

## 🚀 Deployment Checklist

Before deploying:

- [ ] Run `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Run Lighthouse on production build
- [ ] Check all images load
- [ ] Verify gzip/brotli compression enabled on server
- [ ] Test on mobile devices
- [ ] Check Core Web Vitals
- [ ] Verify SEO meta tags
- [ ] Test language switching (FR/EN)

---

## 🔗 Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [JavaScript Performance](https://web.dev/fast/#optimize-your-javascript)

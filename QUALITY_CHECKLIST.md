# Quality Checklist

## Pre-Commit Checklist

Before committing changes:

- [ ] TypeScript type check passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] No console.log statements in production code
- [ ] CSS variables used instead of hardcoded colors
- [ ] All components use proper TypeScript types

## Pre-Deployment Checklist

Before deploying to production:

- [ ] Run full quality check: `npm run pre-deploy`
- [ ] Environment variables configured in hosting platform
- [ ] Test all routes and pages
- [ ] Verify chatbot functionality
- [ ] Check mobile responsiveness
- [ ] Review security audit results: `npm audit`
- [ ] Update version number if needed

## Code Quality Standards

### TypeScript
- ✅ All components have proper type definitions
- ✅ No `any` types (use specific types or `unknown`)
- ✅ Use interfaces for object shapes
- ✅ Props interfaces for all components

### Styling
- ✅ Use CSS variables: `var(--color-brand-orange-primary)`
- ✅ Use utility classes from index.css
- ✅ Avoid inline styles where possible
- ✅ Use `cn()` utility for conditional classes

### Components
- ✅ Single responsibility principle
- ✅ Reusable components in `/components`
- ✅ Page-specific components in `/pages`
- ✅ Proper prop destructuring

### Performance
- ✅ Lazy load heavy components
- ✅ Optimize images (use appropriate formats)
- ✅ Minimize bundle size
- ✅ Use React.memo for expensive renders

## Security Checklist

- [ ] No API keys in source code
- [ ] Environment variables for sensitive data
- [ ] Input validation on all forms
- [ ] XSS protection (React handles this by default)
- [ ] CSRF protection for forms
- [ ] Security headers configured (see vercel.json/netlify.toml)

## Accessibility Checklist

- [ ] Semantic HTML elements
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Alt text for all images
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Form labels associated with inputs

## SEO Checklist

- [ ] Unique page titles
- [ ] Meta descriptions
- [ ] Semantic HTML structure
- [ ] Fast page load times (< 3s)
- [ ] Mobile-friendly
- [ ] sitemap.xml (if applicable)
- [ ] robots.txt configured

## Testing Before Deployment

### Manual Testing
1. **Homepage**
   - [ ] Hero section loads
   - [ ] CTA buttons work
   - [ ] Stats display correctly
   - [ ] Services section displays

2. **Services Page**
   - [ ] All service cards display
   - [ ] Images load properly
   - [ ] "Learn More" links work

3. **Contact Form**
   - [ ] All fields validate
   - [ ] Form submits successfully
   - [ ] Success message displays
   - [ ] Error handling works

4. **Quote Form**
   - [ ] Multi-step form works
   - [ ] Validation on each step
   - [ ] Summary displays correctly
   - [ ] Submission works

5. **ChatBot**
   - [ ] Opens/closes properly
   - [ ] Sends messages
   - [ ] Receives AI responses
   - [ ] Conversation history maintained

### Cross-Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Responsive Testing
- [ ] Desktop (1920px+)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

## Performance Metrics

Target metrics (use Lighthouse):
- **Performance**: > 90
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 90

### Key Metrics
- **First Contentful Paint**: < 1.8s
- **Speed Index**: < 3.4s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.8s
- **Total Blocking Time**: < 200ms
- **Cumulative Layout Shift**: < 0.1

## Post-Deployment Verification

After deploying:

1. **Smoke Tests**
   - [ ] Website loads
   - [ ] All pages accessible
   - [ ] No console errors
   - [ ] No 404 errors

2. **Functionality Tests**
   - [ ] Navigation works
   - [ ] Forms submit
   - [ ] ChatBot responds
   - [ ] Images load

3. **Performance**
   - [ ] Run Lighthouse audit
   - [ ] Check Core Web Vitals
   - [ ] Monitor bundle size

4. **Analytics**
   - [ ] Analytics tracking works (if configured)
   - [ ] Error tracking works (if configured)

## Rollback Plan

If issues are found after deployment:

1. **Immediate**
   - Use hosting platform rollback: `vercel rollback` or `netlify rollback`

2. **Fix Forward**
   - Create hotfix branch
   - Fix issue
   - Run `npm run pre-deploy`
   - Deploy fix

## Maintenance Tasks

### Weekly
- [ ] Check for dependency updates
- [ ] Review error logs (if configured)
- [ ] Monitor performance metrics

### Monthly
- [ ] Run security audit: `npm audit`
- [ ] Update dependencies: `npm update`
- [ ] Review and update documentation
- [ ] Backup configuration and data

### Quarterly
- [ ] Major dependency updates
- [ ] Performance optimization review
- [ ] Accessibility audit
- [ ] SEO review

## Emergency Contacts

- **Hosting Support**: [Platform support link]
- **API Provider**: https://ai.google.dev/support
- **Team Lead**: [Contact info]

## Useful Commands

```bash
# Quality checks
npm run lint              # TypeScript check
npm run build             # Production build
npm run pre-deploy        # Full quality check
npm audit                 # Security audit

# Development
npm run dev               # Start dev server
npm run clean             # Clean build artifacts

# Deployment
vercel --prod             # Deploy to Vercel
netlify deploy --prod     # Deploy to Netlify
```

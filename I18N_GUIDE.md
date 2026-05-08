# Internationalization (i18n) Guide

## Overview

KeyPro Service Center supports French and English languages using `react-i18next`.

**Default Language**: French (fr)
**Supported Languages**: French (fr), English (en)

## Quick Start

### Language Switcher

A language toggle button is available in the navigation bar (top right).

- Desktop: Globe icon with language code
- Mobile: Included in mobile menu
- Click to switch between French and English
- Selection is persisted in localStorage

## Usage in Components

### Import useTranslation

```tsx
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{t('home.hero.description')}</p>
    </div>
  );
}
```

### Translation Keys

All translations are in `src/i18n/locales/`:
- `fr.json` - French translations
- `en.json` - English translations

**Structure:**
```json
{
  "nav": {
    "home": "Accueil",
    "services": "Services",
    ...
  },
  "home": {
    "hero": {
      "title": "...",
      "subtitle": "..."
    }
  }
}
```

### Access Nested Keys

```tsx
// Simple key
{t('nav.home')}

// Nested key
{t('home.hero.title')}

// Even deeper nesting
{t('contact.form.placeholder.name')}
```

## Examples

### Navigation Example

```tsx
// Before (hardcoded)
<Link to="/services">Services</Link>

// After (translated)
<Link to="/services">{t('nav.services')}</Link>
```

### Button Example

```tsx
// Before
<button>Get Quote</button>

// After
<button>{t('nav.quote')}</button>
```

### Complex Text

```tsx
// With HTML
<p dangerouslySetInnerHTML={{ __html: t('contact.description') }} />

// With interpolation (if needed)
{t('welcome', { name: userName })}
```

## Available Translation Sections

### Navigation (`nav.*`)
- home, services, about, brands, contact, quote

### Home Page (`home.*`)
- hero (title, subtitle, description, buttons)
- stats (labels and values)
- services (titles, descriptions)
- cta (call-to-action section)

### Services Page (`services.*`)
- Badge, title, subtitle, descriptions

### About Page (`about.*`)
- Title, description, values, journey

### Contact Page (`contact.*`)
- Form fields, placeholders, labels
- Contact information
- Success/error messages

### Quote Page (`quote.*`)
- Form steps, fields, buttons

### ChatBot (`chatbot.*`)
- Title, placeholder, greeting

### Common (`common.*`)
- loading, error, success, close, open, etc.

## Adding New Translations

1. **Add to both language files:**

`src/i18n/locales/fr.json`:
```json
{
  "mySection": {
    "myKey": "Mon texte en français"
  }
}
```

`src/i18n/locales/en.json`:
```json
{
  "mySection": {
    "myKey": "My text in English"
  }
}
```

2. **Use in component:**
```tsx
{t('mySection.myKey')}
```

## Language Detection

The language is detected in this order:
1. **localStorage** - Previously selected language
2. **Browser language** - User's browser preference
3. **Fallback** - French (default)

## Programmatic Language Change

```tsx
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { i18n } = useTranslation();

  const switchToEnglish = () => {
    i18n.changeLanguage('en');
  };

  const switchToFrench = () => {
    i18n.changeLanguage('fr');
  };

  return (
    <div>
      <button onClick={switchToEnglish}>English</button>
      <button onClick={switchToFrench}>Français</button>
    </div>
  );
}
```

## Current Language

```tsx
const { i18n } = useTranslation();
const currentLang = i18n.language; // 'fr' or 'en'
```

## Best Practices

1. **Always use translation keys** - Never hardcode text
2. **Keep keys organized** - Use nested structure by page/section
3. **Maintain consistency** - Same key structure in both languages
4. **Test both languages** - Verify translations display correctly
5. **Short keys for common items** - `common.loading`, `common.error`

## Components Using i18n

### Already Implemented:
- ✅ Navbar (desktop & mobile)
- ✅ LanguageSwitcher component

### To Implement:
- ⏳ Home page
- ⏳ Services page
- ⏳ About page
- ⏳ Contact page
- ⏳ Quote page
- ⏳ FAQ page
- ⏳ ChatBot
- ⏳ Footer

## Example: Updating a Page

**Before (Home.tsx):**
```tsx
<h1>Advanced Automotive Service</h1>
<p>Keys. Diagnostics. Mobile.</p>
```

**After (Home.tsx):**
```tsx
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <h1>{t('home.hero.title')}</h1>
      <p>{t('home.hero.subtitle')}</p>
    </>
  );
}
```

## Troubleshooting

### Translation not showing
- Check key exists in both `fr.json` and `en.json`
- Verify key path is correct (use dot notation)
- Ensure `useTranslation()` is imported

### Language not persisting
- Check localStorage: `localStorage.getItem('i18nextLng')`
- Clear cache and reload

### Wrong language displayed
- Check browser language settings
- Manually set language: `i18n.changeLanguage('fr')`

## Configuration

Configuration file: `src/i18n/config.ts`

```ts
i18n.init({
  fallbackLng: 'fr',     // Default language
  debug: false,           // Enable for debugging
  // ... other config
});
```

## Testing

```tsx
// Test French
localStorage.setItem('i18nextLng', 'fr');
window.location.reload();

// Test English
localStorage.setItem('i18nextLng', 'en');
window.location.reload();
```

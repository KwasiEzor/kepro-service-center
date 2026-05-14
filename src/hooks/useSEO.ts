import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export function useSEO({ title, description, keywords }: SEOProps = {}) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Set Document Title
    const baseTitle = 'KeyPro Service Center';
    const finalTitle = title ? `${title} | ${baseTitle}` : `${baseTitle} - Expert Automobile Clés & Diagnostic | Paris`;
    document.title = finalTitle;

    // Set Meta Description
    const metaDescription = description || t('home.hero.description') || 'Service automobile premium à Paris. Programmation de clés, diagnostic ECU, immobilisateur.';
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute('content', metaDescription);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = metaDescription;
      document.head.appendChild(meta);
    }

    // Set Meta Keywords
    if (keywords) {
      const keywordsTag = document.querySelector('meta[name="keywords"]');
      if (keywordsTag) {
        keywordsTag.setAttribute('content', keywords);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = keywords;
        document.head.appendChild(meta);
      }
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', finalTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', metaDescription);

    // Update HTML lang attribute
    document.documentElement.lang = i18n.language || 'fr';

  }, [title, description, keywords, t, i18n.language]);
}

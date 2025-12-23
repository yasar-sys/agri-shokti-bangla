import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  structuredData?: object;
}

export function SEOHead({
  title,
  description,
  keywords = 'কৃষি, বাংলাদেশ, ফসল, রোগ শনাক্তকরণ, AI, কৃষক, সার, বাজার দর, আবহাওয়া',
  ogImage = '/favicon.png',
  ogType = 'website',
  canonicalUrl,
  structuredData
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = `${title} | agriশক্তি - বাংলাদেশের কৃষকদের AI সহায়ক`;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.name = name;
        }
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Standard meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('author', 'agriশক্তি Team');
    updateMeta('robots', 'index, follow');
    updateMeta('language', 'Bengali');
    
    // Open Graph tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:locale', 'bn_BD', true);
    updateMeta('og:site_name', 'agriশক্তি', true);
    
    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);

    // Canonical URL
    if (canonicalUrl) {
      let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalElement) {
        canonicalElement = document.createElement('link');
        canonicalElement.rel = 'canonical';
        document.head.appendChild(canonicalElement);
      }
      canonicalElement.href = canonicalUrl;
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      let scriptElement = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(structuredData);
    }

    return () => {
      // Cleanup is optional as we're just updating existing tags
    };
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, structuredData]);

  return null;
}

// Predefined structured data templates
export const createAgriShaktiSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "agriশক্তি",
  "applicationCategory": "Agriculture",
  "operatingSystem": "Web, Android, iOS",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "BDT"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250"
  },
  "description": "বাংলাদেশের কৃষকদের জন্য AI-চালিত কৃষি সহায়ক অ্যাপ। ফসলের রোগ শনাক্তকরণ, আবহাওয়া পূর্বাভাস, বাজার দর।",
  "inLanguage": "bn"
});

export const createFAQSchema = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

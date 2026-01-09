import { useState, useCallback } from 'react';

/**
 * RootSource-inspired Research Integration Hook
 * Wikipedia + ArXiv for agricultural knowledge
 */

interface WikipediaResult {
  title: string;
  summary: string;
  thumbnail?: string;
  url?: string;
}

interface ArXivPaper {
  title: string;
  summary: string;
  authors: string[];
  published: string;
  link: string;
  pdfLink: string;
}

interface ResearchResult {
  wikipedia: WikipediaResult | null;
  papers: ArXivPaper[];
  loading: boolean;
  error: string | null;
}

export function useResearchIntegration() {
  const [result, setResult] = useState<ResearchResult>({
    wikipedia: null,
    papers: [],
    loading: false,
    error: null
  });

  // Wikipedia search
  const searchWikipedia = useCallback(async (topic: string) => {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
      );
      
      if (!response.ok) {
        throw new Error('Wikipedia search failed');
      }

      const data = await response.json();
      
      return {
        title: data.title,
        summary: data.extract,
        thumbnail: data.thumbnail?.source,
        url: data.content_urls?.desktop?.page
      };
    } catch (error) {
      console.error('Wikipedia error:', error);
      return null;
    }
  }, []);

  // ArXiv search (simplified - actual implementation would need backend)
  const searchArXiv = useCallback(async (query: string, maxResults: number = 5): Promise<ArXivPaper[]> => {
    try {
      // Since ArXiv returns XML, we need to handle it carefully
      // In production, this should go through your backend
      const agriculturalQuery = `${query} AND (agriculture OR crop OR farming OR soil)`;
      const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(agriculturalQuery)}&start=0&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('ArXiv search failed');
      }

      const xmlText = await response.text();
      
      // Simple XML parsing (in production, use proper XML parser)
      const papers: ArXivPaper[] = [];
      const entryMatches = xmlText.match(/<entry>([\s\S]*?)<\/entry>/g);
      
      if (entryMatches) {
        for (const entry of entryMatches.slice(0, maxResults)) {
          const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
          const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
          const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/);
          const idMatch = entry.match(/<id>([\s\S]*?)<\/id>/);
          const authorMatches = entry.match(/<name>([\s\S]*?)<\/name>/g);
          
          if (titleMatch && summaryMatch) {
            papers.push({
              title: titleMatch[1].trim(),
              summary: summaryMatch[1].trim().substring(0, 300) + '...',
              authors: authorMatches ? authorMatches.map(a => a.replace(/<\/?name>/g, '').trim()) : [],
              published: publishedMatch ? publishedMatch[1].trim().split('T')[0] : '',
              link: idMatch ? idMatch[1].trim() : '',
              pdfLink: idMatch ? idMatch[1].trim().replace('/abs/', '/pdf/') : ''
            });
          }
        }
      }

      return papers;
    } catch (error) {
      console.error('ArXiv error:', error);
      return [];
    }
  }, []);

  // Combined research search
  const search = useCallback(async (topic: string, includeArXiv: boolean = true) => {
    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Search Wikipedia
      const wikiPromise = searchWikipedia(topic);
      
      // Search ArXiv if requested
      const arxivPromise = includeArXiv ? searchArXiv(topic) : Promise.resolve([]);

      const [wikipedia, papers] = await Promise.all([wikiPromise, arxivPromise]);

      setResult({
        wikipedia,
        papers,
        loading: false,
        error: null
      });

      return { wikipedia, papers };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Research search failed';
      setResult({
        wikipedia: null,
        papers: [],
        loading: false,
        error: errorMessage
      });
      return null;
    }
  }, [searchWikipedia, searchArXiv]);

  // Quick Wikipedia lookup
  const getWikiSummary = useCallback(async (topic: string) => {
    const wikiData = await searchWikipedia(topic);
    return wikiData?.summary || null;
  }, [searchWikipedia]);

  // Clear results
  const clear = useCallback(() => {
    setResult({
      wikipedia: null,
      papers: [],
      loading: false,
      error: null
    });
  }, []);

  return {
    ...result,
    search,
    searchWikipedia,
    searchArXiv,
    getWikiSummary,
    clear
  };
}

// Agricultural topics helper
export const AGRICULTURAL_TOPICS = {
  crops: [
    'Rice cultivation',
    'Wheat farming',
    'Potato agriculture',
    'Jute production',
    'Vegetable farming'
  ],
  pests: [
    'Rice blast disease',
    'Stem borer pest',
    'Brown planthopper',
    'Bacterial leaf blight',
    'Sheath blight'
  ],
  techniques: [
    'Drip irrigation',
    'Organic farming',
    'Integrated pest management',
    'Crop rotation',
    'Precision agriculture'
  ],
  soil: [
    'Soil fertility',
    'Soil pH management',
    'Composting',
    'Soil erosion control',
    'Soil microbiome'
  ]
};

// Bengali translations for research
export const RESEARCH_TRANSLATIONS_BN = {
  loading: 'গবেষণা চলছে...',
  no_results: 'কোনো ফলাফল পাওয়া যায়নি',
  wikipedia: 'উইকিপিডিয়া',
  research_papers: 'গবেষণা পত্র',
  authors: 'লেখক',
  published: 'প্রকাশিত',
  read_more: 'আরও পড়ুন',
  download_pdf: 'পিডিএফ ডাউনলোড',
  search: 'অনুসন্ধান'
};

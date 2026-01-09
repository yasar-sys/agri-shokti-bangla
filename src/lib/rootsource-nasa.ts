/**
 * RootSource-inspired NASA Integration
 * Production-grade NASA APIs that actually work
 * Integrated from: https://github.com/Rafi-uzzaman/RootSource
 */

// ============= NASA POWER API (Climate Data) =============
// This API is 100% free and doesn't require authentication
export const NASA_POWER_API = {
  BASE_URL: 'https://power.larc.nasa.gov/api/temporal/daily/point',
  
  // Get climate data for specific location and date range
  async getClimateData(params: {
    latitude: number;
    longitude: number;
    startDate: string; // YYYYMMDD format
    endDate: string;   // YYYYMMDD format
    parameters?: string[];
  }) {
    const {
      latitude,
      longitude,
      startDate,
      endDate,
      parameters = [
        'T2M',           // Temperature at 2 Meters
        'T2M_MAX',       // Max Temperature
        'T2M_MIN',       // Min Temperature
        'PRECTOTCORR',   // Precipitation
        'RH2M',          // Relative Humidity
        'WS2M',          // Wind Speed
        'ALLSKY_SFC_SW_DWN', // Solar Radiation
      ]
    } = params;

    const url = `${this.BASE_URL}?parameters=${parameters.join(',')}&community=AG&longitude=${longitude}&latitude=${latitude}&start=${startDate}&end=${endDate}&format=JSON`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`NASA POWER API error: ${response.status}`);
      }
      const data = await response.json();
      return {
        success: true,
        data: data.properties.parameter,
        metadata: {
          latitude: data.geometry.coordinates[1],
          longitude: data.geometry.coordinates[0],
          source: 'NASA POWER API',
          timezone: data.properties.parameter.timezone || 'UTC'
        }
      };
    } catch (error) {
      console.error('NASA POWER API failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      };
    }
  },

  // Format date to NASA POWER format (YYYYMMDD)
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  },

  // Get last 30 days climate data
  async getLast30DaysData(latitude: number, longitude: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return this.getClimateData({
      latitude,
      longitude,
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate)
    });
  }
};

// ============= Wikipedia Integration =============
export const WIKIPEDIA_API = {
  BASE_URL: 'https://en.wikipedia.org/api/rest_v1/page',
  
  async getPageSummary(topic: string) {
    try {
      const response = await fetch(`${this.BASE_URL}/summary/${encodeURIComponent(topic)}`);
      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`);
      }
      const data = await response.json();
      return {
        success: true,
        title: data.title,
        summary: data.extract,
        thumbnail: data.thumbnail?.source,
        url: data.content_urls?.desktop?.page
      };
    } catch (error) {
      console.error('Wikipedia API failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Search Wikipedia
  async search(query: string, limit: number = 5) {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${limit}&format=json&origin=*`
      );
      if (!response.ok) {
        throw new Error(`Wikipedia search error: ${response.status}`);
      }
      const data = await response.json();
      return {
        success: true,
        results: data[1].map((title: string, index: number) => ({
          title,
          description: data[2][index],
          url: data[3][index]
        }))
      };
    } catch (error) {
      console.error('Wikipedia search failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results: []
      };
    }
  }
};

// ============= ArXiv Research Paper Integration =============
export const ARXIV_API = {
  BASE_URL: 'https://export.arxiv.org/api/query',
  
  async searchPapers(params: {
    query: string;
    maxResults?: number;
    sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
  }) {
    const { query, maxResults = 10, sortBy = 'relevance' } = params;
    
    const url = `${this.BASE_URL}?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=${sortBy}&sortOrder=descending`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ArXiv API error: ${response.status}`);
      }
      const xmlText = await response.text();
      
      // Parse XML to extract papers
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, 'text/xml');
      const entries = xml.querySelectorAll('entry');
      
      const papers = Array.from(entries).map(entry => ({
        title: entry.querySelector('title')?.textContent?.trim() || '',
        summary: entry.querySelector('summary')?.textContent?.trim() || '',
        authors: Array.from(entry.querySelectorAll('author name')).map(
          author => author.textContent?.trim() || ''
        ),
        published: entry.querySelector('published')?.textContent?.trim() || '',
        updated: entry.querySelector('updated')?.textContent?.trim() || '',
        link: entry.querySelector('id')?.textContent?.trim() || '',
        pdfLink: entry.querySelector('link[title="pdf"]')?.getAttribute('href') || ''
      }));

      return {
        success: true,
        papers,
        total: papers.length
      };
    } catch (error) {
      console.error('ArXiv API failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        papers: []
      };
    }
  },

  // Search agricultural papers
  async searchAgricultural(topic: string, maxResults: number = 5) {
    const agriculturalQuery = `${topic} AND (agriculture OR crop OR farming OR soil)`;
    return this.searchPapers({ query: agriculturalQuery, maxResults });
  }
};

// ============= DuckDuckGo Search Integration =============
export const DUCKDUCKGO_SEARCH = {
  async instantAnswer(query: string) {
    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );
      if (!response.ok) {
        throw new Error(`DuckDuckGo API error: ${response.status}`);
      }
      const data = await response.json();
      return {
        success: true,
        answer: data.AbstractText || data.Answer,
        source: data.AbstractSource,
        url: data.AbstractURL,
        image: data.Image,
        relatedTopics: data.RelatedTopics?.slice(0, 5).map((topic: any) => ({
          text: topic.Text,
          url: topic.FirstURL
        }))
      };
    } catch (error) {
      console.error('DuckDuckGo API failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// ============= Enhanced NASA Data Integration =============
export const ENHANCED_NASA_INTEGRATION = {
  // Combine NASA POWER with existing data
  async getEnhancedClimateData(latitude: number, longitude: number) {
    const powerData = await NASA_POWER_API.getLast30DaysData(latitude, longitude);
    
    if (!powerData.success) {
      return {
        success: false,
        error: 'NASA POWER API unavailable',
        using_fallback: true
      };
    }

    // Process the data
    const processedData = {
      temperature: {
        current: this.getLatestValue(powerData.data.T2M),
        max: this.getLatestValue(powerData.data.T2M_MAX),
        min: this.getLatestValue(powerData.data.T2M_MIN),
        average: this.calculateAverage(powerData.data.T2M),
        trend: this.calculateTrend(powerData.data.T2M)
      },
      precipitation: {
        total: this.calculateSum(powerData.data.PRECTOTCORR),
        average: this.calculateAverage(powerData.data.PRECTOTCORR),
        lastRain: this.getLastNonZeroDate(powerData.data.PRECTOTCORR)
      },
      humidity: {
        current: this.getLatestValue(powerData.data.RH2M),
        average: this.calculateAverage(powerData.data.RH2M)
      },
      wind: {
        current: this.getLatestValue(powerData.data.WS2M),
        average: this.calculateAverage(powerData.data.WS2M)
      },
      solar: {
        current: this.getLatestValue(powerData.data.ALLSKY_SFC_SW_DWN),
        average: this.calculateAverage(powerData.data.ALLSKY_SFC_SW_DWN)
      },
      metadata: powerData.metadata
    };

    return {
      success: true,
      data: processedData,
      source: 'NASA POWER API',
      timestamp: new Date().toISOString()
    };
  },

  getLatestValue(dataObj: any): number | null {
    if (!dataObj) return null;
    const values = Object.values(dataObj) as number[];
    return values[values.length - 1];
  },

  calculateAverage(dataObj: any): number {
    if (!dataObj) return 0;
    const values = Object.values(dataObj) as number[];
    const validValues = values.filter(v => v !== -999 && v !== null);
    return validValues.reduce((a, b) => a + b, 0) / validValues.length;
  },

  calculateSum(dataObj: any): number {
    if (!dataObj) return 0;
    const values = Object.values(dataObj) as number[];
    const validValues = values.filter(v => v !== -999 && v !== null);
    return validValues.reduce((a, b) => a + b, 0);
  },

  calculateTrend(dataObj: any): 'increasing' | 'decreasing' | 'stable' {
    if (!dataObj) return 'stable';
    const values = Object.values(dataObj) as number[];
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    if (diff > 1) return 'increasing';
    if (diff < -1) return 'decreasing';
    return 'stable';
  },

  getLastNonZeroDate(dataObj: any): string | null {
    if (!dataObj) return null;
    const entries = Object.entries(dataObj) as [string, number][];
    const reversed = entries.reverse();
    const lastRain = reversed.find(([_, value]) => value > 0);
    return lastRain ? lastRain[0] : null;
  }
};

// Export all APIs
export default {
  NASA_POWER_API,
  WIKIPEDIA_API,
  ARXIV_API,
  DUCKDUCKGO_SEARCH,
  ENHANCED_NASA_INTEGRATION
};

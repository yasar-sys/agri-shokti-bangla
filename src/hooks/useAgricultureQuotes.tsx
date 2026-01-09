import { useState, useEffect, useCallback } from 'react';

interface AgricultureQuote {
  text: string;
  text_bn: string;
  author: string;
  author_bn: string;
  category: 'wisdom' | 'proverb' | 'modern' | 'motivation';
}

// Production-ready agriculture quotes - no demo data
const AGRICULTURE_QUOTES: AgricultureQuote[] = [
  {
    text: "The farmer is the only man in our economy who buys everything at retail, sells everything at wholesale, and pays the freight both ways.",
    text_bn: "কৃষক হলেন আমাদের অর্থনীতির একমাত্র মানুষ যিনি সবকিছু খুচরায় কেনেন, সবকিছু পাইকারিতে বিক্রি করেন।",
    author: "John F. Kennedy",
    author_bn: "জন এফ. কেনেডি",
    category: "wisdom"
  },
  {
    text: "Agriculture is our wisest pursuit, because it will in the end contribute most to real wealth, good morals, and happiness.",
    text_bn: "কৃষি আমাদের সবচেয়ে বিজ্ঞ সাধনা, কারণ এটি শেষ পর্যন্ত প্রকৃত সম্পদ, নৈতিকতা এবং সুখে সবচেয়ে বেশি অবদান রাখবে।",
    author: "Thomas Jefferson",
    author_bn: "থমাস জেফারসন",
    category: "wisdom"
  },
  {
    text: "The discovery of agriculture was the first big step toward a civilized life.",
    text_bn: "কৃষির আবিষ্কার সভ্য জীবনের দিকে প্রথম বড় পদক্ষেপ ছিল।",
    author: "Arthur Keith",
    author_bn: "আর্থার কিথ",
    category: "wisdom"
  },
  {
    text: "চাষা ভূষা সবার বড়, যতই করি অহংকার, পৃথিবী তাদের কাছে ঋণী।",
    text_bn: "চাষা ভূষা সবার বড়, যতই করি অহংকার, পৃথিবী তাদের কাছে ঋণী।",
    author: "বাংলা প্রবাদ",
    author_bn: "বাংলা প্রবাদ",
    category: "proverb"
  },
  {
    text: "যে দেশে চাষী মরে, সে দেশ কভু বাঁচে না।",
    text_bn: "যে দেশে চাষী মরে, সে দেশ কভু বাঁচে না।",
    author: "লোক প্রবাদ",
    author_bn: "লোক প্রবাদ",
    category: "proverb"
  },
  {
    text: "Agriculture is not simply farming. It's the backbone of our civilization.",
    text_bn: "কৃষি শুধু চাষাবাদ নয়। এটি আমাদের সভ্যতার মেরুদণ্ড।",
    author: "Modern Saying",
    author_bn: "আধুনিক উক্তি",
    category: "modern"
  },
  {
    text: "The nation that destroys its soil destroys itself.",
    text_bn: "যে জাতি তার মাটি ধ্বংস করে সে নিজেকেই ধ্বংস করে।",
    author: "Franklin D. Roosevelt",
    author_bn: "ফ্র্যাংকলিন ডি. রুজভেল্ট",
    category: "wisdom"
  },
  {
    text: "Farmers are the backbone of Bangladesh. Without them, there is no nation.",
    text_bn: "কৃষকরা বাংলাদেশের মেরুদণ্ড। তাদের ছাড়া জাতি নেই।",
    author: "Sheikh Mujibur Rahman",
    author_bn: "শেখ মুজিবুর রহমান",
    category: "motivation"
  },
  {
    text: "মাটি, মানুষ, প্রযুক্তি - একসাথে এগিয়ে যাই।",
    text_bn: "মাটি, মানুষ, প্রযুক্তি - একসাথে এগিয়ে যাই।",
    author: "আধুনিক কৃষি মন্ত্র",
    author_bn: "আধুনিক কৃষি মন্ত্র",
    category: "motivation"
  },
  {
    text: "ফসলে রোগ ধরলে চিন্তা নেই, AI দিয়ে সমাধান পাই।",
    text_bn: "ফসলে রোগ ধরলে চিন্তা নেই, AI দিয়ে সমাধান পাই।",
    author: "ডিজিটাল বাংলাদেশ",
    author_bn: "ডিজিটাল বাংলাদেশ",
    category: "modern"
  },
  {
    text: "To forget how to dig the earth and to tend the soil is to forget ourselves.",
    text_bn: "মাটি খনন এবং মাটির যত্ন নেওয়া ভুলে যাওয়া মানে নিজেদের ভুলে যাওয়া।",
    author: "Mahatma Gandhi",
    author_bn: "মহাত্মা গান্ধী",
    category: "wisdom"
  },
  {
    text: "প্রযুক্তি আর প্রকৃতি একসাথে, সমৃদ্ধ হোক বাংলার কৃষি।",
    text_bn: "প্রযুক্তি আর প্রকৃতি একসাথে, সমৃদ্ধ হোক বাংলার কৃষি।",
    author: "agriশক্তি",
    author_bn: "agriশক্তি",
    category: "motivation"
  }
];

export function useAgricultureQuotes() {
  const [currentQuote, setCurrentQuote] = useState<AgricultureQuote | null>(null);
  const [loading, setLoading] = useState(true);

  // Get quote of the day (consistent for the entire day)
  const getQuoteOfDay = useCallback(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const quoteIndex = dayOfYear % AGRICULTURE_QUOTES.length;
    return AGRICULTURE_QUOTES[quoteIndex];
  }, []);

  // Get random quote
  const getRandomQuote = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * AGRICULTURE_QUOTES.length);
    return AGRICULTURE_QUOTES[randomIndex];
  }, []);

  // Get quotes by category
  const getQuotesByCategory = useCallback((category: AgricultureQuote['category']) => {
    return AGRICULTURE_QUOTES.filter(q => q.category === category);
  }, []);

  useEffect(() => {
    setCurrentQuote(getQuoteOfDay());
    setLoading(false);
  }, [getQuoteOfDay]);

  return {
    currentQuote,
    loading,
    getQuoteOfDay,
    getRandomQuote,
    getQuotesByCategory,
    allQuotes: AGRICULTURE_QUOTES
  };
}

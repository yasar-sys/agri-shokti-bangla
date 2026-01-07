import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, Loader2, TrendingUp, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useMarketAI } from '@/hooks/useMarketAI';
import { useLanguage } from '@/contexts/LanguageContext';

const quickQuestions = [
  { text: 'ধানের দাম কেমন?', emoji: '🌾' },
  { text: 'আলু বিক্রি করব কখন?', emoji: '🥔' },
  { text: 'পেঁয়াজের দাম বাড়বে?', emoji: '🧅' },
  { text: 'সবজির বাজার কেমন?', emoji: '🥬' },
];

export function MarketAIChat() {
  const [query, setQuery] = useState('');
  const { status, response, error, analyzeMarket, reset, isLoading } = useMarketAI();
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      analyzeMarket(query.trim());
    }
  };

  const handleQuickQuestion = (question: string) => {
    setQuery(question);
    analyzeMarket(question);
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'loading_prices':
        return language === 'bn' ? '📈 বাজার ডেটা আনছি...' : '📈 Loading market data...';
      case 'analyzing':
        return language === 'bn' ? '🤖 AI পূর্বাভাস দিচ্ছে...' : '🤖 AI analyzing...';
      default:
        return '';
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-primary/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-chart-2/20 px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              {language === 'bn' ? 'বাজার AI সহায়ক' : 'Market AI Assistant'}
              <Sparkles className="w-3.5 h-3.5 text-chart-2" />
            </h3>
            <p className="text-[10px] text-muted-foreground">
              {language === 'bn' ? 'দাম জিজ্ঞাসা করুন, AI পরামর্শ পান' : 'Ask prices, get AI advice'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="p-4 space-y-3 min-h-[160px]">
        {/* Quick Questions */}
        {status === 'idle' && !response && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {language === 'bn' ? 'দ্রুত প্রশ্ন:' : 'Quick questions:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickQuestion(q.text)}
                  className="px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-xs font-medium text-foreground transition-colors flex items-center gap-1.5"
                >
                  <span>{q.emoji}</span>
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>{getStatusMessage()}</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted/50 rounded w-3/4" />
                <div className="h-4 bg-muted/50 rounded w-1/2" />
              </div>
            </div>
          </div>
        )}

        {/* Response */}
        {response && status === 'complete' && (
          <div className="space-y-3 animate-slide-up">
            {/* AI Analysis */}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground leading-relaxed">
                  {response.analysis}
                </p>
              </div>
            </div>

            {/* Recommendation */}
            {response.recommendation && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-chart-2/10 border border-chart-2/30">
                <TrendingUp className="w-4 h-4 text-chart-2 flex-shrink-0" />
                <span className="text-sm font-medium text-chart-2">
                  {response.recommendation}
                </span>
              </div>
            )}

            {/* Confidence */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{language === 'bn' ? `AI আত্মবিশ্বাস: ${response.confidence}%` : `AI Confidence: ${response.confidence}%`}</span>
              <button 
                onClick={reset}
                className="text-primary hover:underline"
              >
                {language === 'bn' ? 'নতুন প্রশ্ন' : 'New question'}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/30">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border/30 bg-muted/20">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'bn' ? '👨‍🌾 "ধানের দাম কেমন?"' : '👨‍🌾 "What\'s the rice price?"'}
            className="flex-1 bg-background/50 border-border/50 text-sm"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!query.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

import React, { memo, useCallback, useMemo } from 'react';

/**
 * Performance optimization utilities for React components
 * Use these utilities to optimize component re-renders
 */

// Generic memo wrapper with display name preservation
export function withMemo<P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
): React.MemoExoticComponent<React.ComponentType<P>> {
  const MemoComponent = memo(Component);
  MemoComponent.displayName = displayName || Component.displayName || Component.name;
  return MemoComponent;
}

// Deep comparison for complex props
export function deepCompare<T>(prev: T, next: T): boolean {
  return JSON.stringify(prev) === JSON.stringify(next);
}

// Shallow comparison for props (default memo behavior)
export function shallowCompare<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T,
  keys?: (keyof T)[]
): boolean {
  const compareKeys = keys || Object.keys(prevProps) as (keyof T)[];
  
  return compareKeys.every(key => {
    return Object.is(prevProps[key], nextProps[key]);
  });
}

// HOC for lazy loading with suspense
export function withLazy<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  // React.lazy has some rough edges with generics in TS; we keep runtime behavior
  // but loosen the type at the boundary to avoid invalid JSX props inference.
  const LazyComponent = React.lazy(importFn) as unknown as React.ComponentType<any>;

  const LazyWrapper: React.FC<P> = (props) => {
    return (
      <React.Suspense fallback={fallback || <div>Loading...</div>}>
        <LazyComponent {...(props as any)} />
      </React.Suspense>
    );
  };

  return LazyWrapper;
}

// Performance monitoring HOC
export function withPerformance<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function PerformanceWrapper(props: P) {
    const name = componentName || Component.displayName || Component.name;
    
    React.useEffect(() => {
      if (import.meta.env.DEV) {
        console.time(`${name} render`);
        return () => {
          console.timeEnd(`${name} render`);
        };
      }
    });
    
    return <Component {...props} />;
  };
}

// Optimized event handler creator
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

// Optimized computed value creator
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

// Array comparison for memo
export function arrayCompare<T>(prev: T[], next: T[]): boolean {
  if (prev.length !== next.length) return false;
  return prev.every((item, index) => item === next[index]);
}

// Custom hooks for optimization
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = React.useRef(callback);
  
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return React.useCallback(((...args) => {
    return callbackRef.current(...args);
  }) as T, []);
}

// Debounced value hook
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = React.useRef(Date.now());
  
  return React.useCallback(((...args) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      lastRun.current = now;
      return callback(...args);
    }
  }) as T, [callback, delay]);
}

// Memoized filter hook
export function useMemoizedFilter<T>(
  array: T[],
  filterFn: (item: T) => boolean
): T[] {
  return useMemo(() => array.filter(filterFn), [array, filterFn]);
}

// Memoized map hook
export function useMemoizedMap<T, R>(
  array: T[],
  mapFn: (item: T, index: number) => R
): R[] {
  return useMemo(() => array.map(mapFn), [array, mapFn]);
}

// Component render counter (dev only)
export function useRenderCount(componentName: string) {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      renderCount.current += 1;
      console.log(`${componentName} rendered ${renderCount.current} times`);
    }
  });
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [ref, options]);
  
  return isIntersecting;
}

// Virtualization helper for large lists
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
    
    return {
      start: Math.max(0, startIndex - 2), // Add buffer
      end: Math.min(items.length, endIndex + 2),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
}

export default {
  withMemo,
  deepCompare,
  shallowCompare,
  withLazy,
  withPerformance,
  useOptimizedCallback,
  useOptimizedMemo,
  arrayCompare,
  useStableCallback,
  useDebouncedValue,
  useThrottledCallback,
  useMemoizedFilter,
  useMemoizedMap,
  useRenderCount,
  useIntersectionObserver,
  useVirtualization,
};

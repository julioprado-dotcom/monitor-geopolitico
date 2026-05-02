'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

export type TabDirection = 'left' | 'right' | 'none';

/**
 * useTabTransition — provides animation key + direction for tab content transitions.
 *
 * - Tracks the tab order (monitor=0, then dynamic tabs 1..N).
 * - If new tab is to the right → slide from right.
 * - If new tab is to the left  → slide from left.
 * - Returns a stable `animationKey` that increments on every switch.
 *
 * Performance: zero DOM interaction. Pure state + ref.
 */
export function useTabTransition(activeTab: string, dynamicTabIds: string[]) {
  const [animationKey, setAnimationKey] = useState(0);
  const [direction, setDirection] = useState<TabDirection>('right');
  const prevTabRef = useRef(activeTab);

  // Build ordered tab list for direction calculation
  const tabOrder = useMemo(() => {
    return ['monitor', ...dynamicTabIds];
  }, [dynamicTabIds]);

  useEffect(() => {
    if (prevTabRef.current === activeTab) return;

    const prevIndex = tabOrder.indexOf(prevTabRef.current);
    const newIndex = tabOrder.indexOf(activeTab);

    // Direction based on tab order
    if (prevIndex < 0 || newIndex < 0) {
      setDirection('right');
    } else if (newIndex > prevIndex) {
      setDirection('right');
    } else if (newIndex < prevIndex) {
      setDirection('left');
    } else {
      setDirection('none');
    }

    setAnimationKey((k) => k + 1);
    prevTabRef.current = activeTab;
  }, [activeTab, tabOrder]);

  return { animationKey, direction };
}

/**
 * useTabIndicator — tracks position/width of the active tab button
 * for a sliding indicator bar under the tab bar.
 *
 * Returns ref to attach to each tab button, and { left, width, color }
 * for the indicator element.
 */
export function useTabIndicator() {
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
    color: string;
    visible: boolean;
  }>({
    left: 0,
    width: 0,
    color: '#00E5A0',
    visible: false,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const updateIndicator = useCallback((el: HTMLButtonElement | null, color: string) => {
    if (!el || !containerRef.current) {
      setIndicator((prev) => ({ ...prev, visible: false }));
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    // Use rAF to batch DOM reads
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setIndicator({
        left: elRect.left - containerRect.left,
        width: elRect.width,
        color,
        visible: true,
      });
    });
  }, []);

  // Cleanup rAF
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { indicator, setContainerRef: containerRef, updateIndicator };
}

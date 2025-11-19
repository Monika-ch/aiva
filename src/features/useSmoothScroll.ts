/**
 * Smooth Scroll Hook
 * Enhanced scrolling behavior for chat messages
 */

import { useEffect, useRef, useCallback } from "react";

interface UseScrollOptions {
  /**
   * Whether scrolling is enabled
   */
  enabled?: boolean;
  /**
   * Delay before scrolling (useful for DOM updates)
   */
  delay?: number;
  /**
   * Additional offset from bottom
   */
  offset?: number;
  /**
   * Dependencies to trigger scroll
   */
  dependencies?: unknown[];
}

export const useSmoothScroll = ({
  enabled = true,
  delay = 100,
  offset = 0,
  dependencies = [],
}: UseScrollOptions = {}) => {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | undefined>(undefined);

  const scrollToBottom = useCallback(
    (force = false) => {
      if (!enabled && !force) return;
      if (!scrollElementRef.current) return;

      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = window.setTimeout(() => {
        const element = scrollElementRef.current;
        if (!element) return;

        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        const targetScrollTop = scrollHeight - clientHeight - offset;

        // Only auto-scroll if user isn't manually scrolling
        if (!isUserScrollingRef.current || force) {
          element.scrollTo({
            top: targetScrollTop,
            behavior: "smooth",
          });
        }
      }, delay);
    },
    [enabled, delay, offset]
  );

  // Track user scrolling behavior
  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    let userScrollTimeout: number;

    const handleScroll = () => {
      isUserScrollingRef.current = true;

      // Reset after user stops scrolling
      window.clearTimeout(userScrollTimeout);
      userScrollTimeout = window.setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = element;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

        // If user scrolled back to near bottom, allow auto-scroll again
        if (isNearBottom) {
          isUserScrollingRef.current = false;
        }
      }, 1000);
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
      window.clearTimeout(userScrollTimeout);
    };
  }, []);

  // Auto-scroll when dependencies change
  useEffect(() => {
    scrollToBottom();
  }, dependencies);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    scrollElementRef,
    scrollToBottom,
    isUserScrolling: () => isUserScrollingRef.current,
  };
};

export default useSmoothScroll;

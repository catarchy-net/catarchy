import { useEffect, useRef } from "react";

export function useInfiniteScroll<T>({
  fetchNextPage,
  hasNextPage,
}: {
  fetchNextPage: () => Promise<T>;
  hasNextPage: boolean;
}) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(async ([entry]) => {
      if (entry.isIntersecting) {
        await fetchNextPage();
      }
    });

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage]);

  return {
    loadMoreRef,
  };
}

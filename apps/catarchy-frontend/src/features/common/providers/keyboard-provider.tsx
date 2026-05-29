import { createContext, useEffect, useRef, useState } from "react";

interface KeyboardContextValue {
  isOpen: boolean;
  height: number;
}

export const KeyboardContext = createContext<KeyboardContextValue | undefined>(
  undefined,
);

interface KeyboardProviderProps {
  children: React.ReactNode;
}

export function KeyboardProvider({ children }: KeyboardProviderProps) {
  const [keyboardState, setKeyboardState] = useState<KeyboardContextValue>({
    isOpen: false,
    height: 0,
  });

  const maxHeightRef = useRef<number>(
    typeof window !== "undefined"
      ? (window.visualViewport?.height ?? window.innerHeight)
      : 0,
  );
  const lastHeightRef = useRef<number>(maxHeightRef.current);
  const rafRef = useRef<number | null>(null);
  const pendingHeightRef = useRef<number | null>(null);
  const isInputFocusedRef = useRef<boolean>(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;

    document.documentElement.style.setProperty(
      "--viewport-height",
      `${vv?.height ?? window.innerHeight}px`,
    );

    const preventScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    const handleViewportChange = () => {
      const height = vv?.height ?? window.innerHeight;

      if (isInputFocusedRef.current) {
        if (height > maxHeightRef.current) {
          maxHeightRef.current = height;
        }
      } else {
        maxHeightRef.current = height;
      }

      lastHeightRef.current = height;
      pendingHeightRef.current = height;

      document.documentElement.style.setProperty(
        "--viewport-height",
        `${height}px`,
      );

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          const latestHeight = pendingHeightRef.current;
          if (latestHeight === null) return;
          const keyboardHeight = maxHeightRef.current - latestHeight;
          const nextIsOpen = keyboardHeight > 100;
          const nextHeight = Math.max(0, keyboardHeight);
          setKeyboardState((prev) => {
            if (prev.isOpen === nextIsOpen && prev.height === nextHeight)
              return prev;
            return { isOpen: nextIsOpen, height: nextHeight };
          });
        });
      }
    };

    if (vv) {
      vv.addEventListener("resize", handleViewportChange);
    } else {
      window.addEventListener("resize", handleViewportChange);
    }
    window.addEventListener("scroll", preventScroll);

    const handleFocus = (e: FocusEvent) => {
      if (blurTimerRef.current !== null) {
        clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }
      isInputFocusedRef.current = true;
      preventScroll();

      const target = e.target as HTMLElement;
      if (!target) return;

      setTimeout(() => {
        const keyboardHeight = maxHeightRef.current - lastHeightRef.current;
        const isKeyboardOpen = keyboardHeight > 100;
        if (isKeyboardOpen) {
          const rect = target.getBoundingClientRect();
          const isVisible =
            rect.top >= 0 && rect.bottom <= lastHeightRef.current;
          if (!isVisible) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          preventScroll();
        }
      }, 500);
    };

    const handleBlur = () => {
      // 입력 간 포커스 이동 시 false로 튀는 것을 방지하기 위해 약간 지연
      blurTimerRef.current = setTimeout(() => {
        isInputFocusedRef.current = false;
        blurTimerRef.current = null;
      }, 100);
      preventScroll();
    };

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (blurTimerRef.current !== null) {
        clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }
      if (vv) {
        vv.removeEventListener("resize", handleViewportChange);
      } else {
        window.removeEventListener("resize", handleViewportChange);
      }
      window.removeEventListener("scroll", preventScroll);
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, []);

  return (
    <KeyboardContext.Provider value={keyboardState}>
      {children}
    </KeyboardContext.Provider>
  );
}

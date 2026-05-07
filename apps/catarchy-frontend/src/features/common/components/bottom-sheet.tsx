import { LogView } from "@/features/analytics";
import React, { useEffect, useRef, useState } from "react";
import BorderEdge from "../assets/bottom-sheet-border-edge.svg?react";
import styles from "./bottom-sheet.module.css";
import { Text } from "./text";

export type BottomSheetHeader = {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

type BottomSheetProps = {
  children?: React.ReactNode;
  onClose?: () => void;
  onDimClick?: () => void;
  header?: BottomSheetHeader;
  isClosing?: boolean;
  dimClosable?: boolean;
};

const DURATION = 250;

export function BottomSheet({
  children,
  onClose,
  onDimClick,
  header,
  isClosing,
  dimClosable = true,
}: BottomSheetProps) {
  const [visible, setVisible] = useState(false);
  const closing = useRef(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(id);
  }, []);

  function startClose() {
    if (closing.current) return;
    closing.current = true;
    setVisible(false);
    setTimeout(() => onClose?.(), DURATION);
  }

  useEffect(() => {
    if (isClosing) startClose();
  }, [isClosing]);

  const isTitleString = typeof header?.title === "string";

  return (
    <>
      <div
        className={styles.dim}
        onClick={onDimClick ?? (dimClosable ? startClose : undefined)}
        style={{
          transitionDuration: `${DURATION}ms`,
          transitionTimingFunction: "steps(8, end)",
          opacity: visible ? 1 : 0,
        }}
      />
      <div
        className={styles.sheet}
        style={{
          transitionDuration: `${DURATION}ms`,
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transitionTimingFunction: "steps(8, end)",
        }}
      >
        <div className={styles.sheetHandle} onClick={startClose}>
          <div className={styles.sheetHandleEdges}>
            <BorderEdge />
            <div className={styles.sheetHandleBar} />
            <BorderEdge className={styles.sheetHandleEdgeMirror} />
          </div>
        </div>
        <div className={styles.body}>
          {header && (
            <header className={styles.header}>
              <div className={styles.headerInner}>
                <div className={styles.headerSide}>{header.left}</div>
                <div>
                  {isTitleString ? (
                    <Text as="h1" boxTrim className="font-bold">
                      {header.title}
                    </Text>
                  ) : (
                    header.title
                  )}
                </div>
                <div className={styles.headerSide}>{header.right}</div>
              </div>
            </header>
          )}
          <LogView eventName="bottom_sheet">
            <div className={styles.content}>{children}</div>
          </LogView>
        </div>
      </div>
    </>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { careRecordOptions } from "@/features/cat";
import { Box, Button, CatLoading, StreamText } from "@/features/common";

import styles from "./status-report-modal.module.css";

export function StatusReportModal({
  careRecordId,
  mood,
  closeText,
  onClose,
}: {
  careRecordId: string;
  mood?: string;
  closeText?: string;
  onClose?: () => void;
}) {
  const pollCount = useRef(0);
  const [gaveUp, setGaveUp] = useState<boolean>(false);
  const limit = 10;

  const { data, dataUpdatedAt } = useQuery({
    ...careRecordOptions({ careRecordId }),
    retry: false,
    refetchInterval(query) {
      if (gaveUp) {
        return false;
      }

      if (pollCount.current >= limit) {
        setGaveUp(true);
        return false;
      }

      if (!query.state.data?.message) {
        return 2000;
      }

      return false;
    },
  });

  useEffect(() => {
    if (!data?.message) {
      pollCount.current += 1;
    }
  }, [dataUpdatedAt, data]);

  const [streamEnd, setStreamEnd] = useState<boolean>(false);
  const message = data?.message;

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        {message && (
          <Box as="dl" className={styles.moodBox}>
            <dt className="sr-only">Mood</dt>
            <dd>{mood || "..."}</dd>
          </Box>
        )}

        {gaveUp ? (
          <p className={styles.reportText}>
            The cat is too shy to share its feelings...
          </p>
        ) : message ? (
          <StreamText
            as="p"
            text={message || "..."}
            className={styles.reportText}
            onStreamEnd={() => setStreamEnd(true)}
          />
        ) : (
          <CatLoading />
        )}
      </div>
      <div className={styles.footer}>
        <Button variant="secondary" disabled={!streamEnd} onClick={onClose}>
          {closeText || "Close"}
        </Button>
      </div>
    </div>
  );
}

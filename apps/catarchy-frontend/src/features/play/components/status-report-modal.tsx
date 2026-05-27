import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { latestCareRecordOptions } from "@/features/cat";
import { Box, Button, StreamText } from "@/features/common";

import styles from "./status-report-modal.module.css";

export function StatusReportModal({
  catId,
  mood,
  closeText,
  onClose,
}: {
  catId: string;
  mood?: string;
  closeText?: string;
  onClose?: () => void;
}) {
  const { data } = useQuery({
    ...latestCareRecordOptions({ catId }),
    refetchInterval({ state }) {
      return state.data?.message === null ? 1000 : false;
    },
  });

  const [streamEnd, setStreamEnd] = useState<boolean>(false);
  const message = data?.message;

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <Box as="dl" className={styles.moodBox}>
          <dt className="sr-only">Mood</dt>
          <dd>{mood || "..."}</dd>
        </Box>

        {message ? (
          <StreamText
            as="p"
            text={message}
            className={styles.reportText}
            onStreamEnd={() => setStreamEnd(true)}
          />
        ) : (
          <p className={styles.reportText}>...</p>
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

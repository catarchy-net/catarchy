import { Box, Button } from "@/features/common";
import { StreamText } from "@/features/common/components/stream-text";
import { useState } from "react";
import styles from "./status-report-modal.module.css";
export function StatusReportModal({
  mood,
  message,
  onClose,
}: {
  mood?: string;
  message?: string;
  onClose?: () => void;
}) {
  const [streamEnd, setStreamEnd] = useState<boolean>(false);

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <Box as="dl" className={styles.moodBox}>
          <dt className="sr-only">Mood</dt>
          <dd>{mood || "..."}</dd>
        </Box>

        <StreamText
          as="p"
          text={message ?? "..."}
          onStreamEnd={() => setStreamEnd(true)}
        />
      </div>
      <div className={styles.footer}>
        <Button variant="secondary" disabled={!streamEnd} onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

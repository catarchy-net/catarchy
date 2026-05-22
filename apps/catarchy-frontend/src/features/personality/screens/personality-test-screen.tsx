import {
  Button,
  cn,
  HeaderBackButton,
  Scaffold,
  Text,
  useModal,
} from "@/features/common";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { TestNudge } from "../components/test-nudge";
import { TestResult } from "../components/test-result";
import { usePersonalityTestModal } from "../hooks/use-personality-test-modal";
import { getPersonalityTestProgressOptions } from "../services/personality";
import styles from "./personality-test-screen.module.css";

export function PersonalityTestScreen({ catId }: { catId: string }) {
  const modal = useModal();

  const { data, status } = useQuery(
    getPersonalityTestProgressOptions({ catId }),
  );

  const hasCompletedTest = data?.remainingCount === 0;

  const { start } = usePersonalityTestModal({ catId });

  return (
    <Scaffold>
      <Scaffold.Header
        title="Personality"
        left={<HeaderBackButton />}
        right={
          <Link
            to="/$catId/cat/personality/introduction"
            params={{
              catId,
            }}
          >
            <Button size="small" variant="ghost">
              <Text boxTrim>ⓘ</Text>
            </Button>
          </Link>
        }
      />
      <Scaffold.Body className={cn("bg-pattern-cat", styles.body)}>
        {hasCompletedTest && <TestResult catId={catId} />}
        {!hasCompletedTest && (
          <Suspense>
            <TestNudge catId={catId} />
          </Suspense>
        )}
      </Scaffold.Body>
      {!hasCompletedTest && (
        <Scaffold.Bottom sticky>
          <Button size="big" onClick={() => start()}>
            <Text>Start Test</Text>
          </Button>
        </Scaffold.Bottom>
      )}
    </Scaffold>
  );
}

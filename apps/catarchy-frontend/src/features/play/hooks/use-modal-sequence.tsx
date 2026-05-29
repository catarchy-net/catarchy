import { useCallback, useRef } from "react";

import { useModal } from "@/features/common";

type ModalHeader = Parameters<ReturnType<typeof useModal>["open"]>[0]["header"];

type StepControls = {
  next: () => void;
  skip: (stepId: string) => void;
  done: () => void;
};

export type ModalStep = {
  id: string;
  header?: ModalHeader;
  dimClosable?: boolean;
  skip?: boolean | (() => boolean);
  render: (controls: StepControls) => React.ReactNode;
};

export function useModalSequence() {
  const modal = useModal();
  const stepsRef = useRef<ModalStep[]>([]);

  const close = useCallback(
    (index: number) => {
      const step = stepsRef.current[index];
      if (step) {
        modal.close(step.id);
      }
    },
    [modal],
  );

  const run = useCallback(
    (index: number) => {
      const step = stepsRef.current[index];
      if (!step) {
        return;
      }

      const shouldSkip =
        typeof step.skip === "function" ? step.skip() : step.skip;
      if (shouldSkip) {
        run(index + 1);
        return;
      }

      const controls: StepControls = {
        next: () => {
          close(index);
          run(index + 1);
        },
        skip: (stepId: string) => {
          close(index);
          const targetIndex = stepsRef.current.findIndex(
            (s) => s.id === stepId,
          );
          if (targetIndex === -1) {
            return;
          }
          run(targetIndex);
        },
        done: () => {
          close(index);
        },
      };

      const component = step.render(controls);
      if (component == null) {
        return;
      }

      modal.open({
        id: step.id,
        header: step.header,
        dimClosable: step.dimClosable,
        component,
      });
    },
    [modal, close],
  );

  const start = useCallback(
    (steps: ModalStep[]) => {
      stepsRef.current = steps;
      run(0);
    },
    [run],
  );

  return { start };
}

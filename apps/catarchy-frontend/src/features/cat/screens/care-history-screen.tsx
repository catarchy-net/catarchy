import { HeaderBackButton, Scaffold } from "@/features/common";
import { CareHistoryList } from "../components/care-history-list";

export function CareHistoryScreen({ catId }: { catId: string }) {
  return (
    <Scaffold>
      <Scaffold.Header title="Care history" left={<HeaderBackButton />} />
      <Scaffold.Body className="bg-pattern-cat">
        <CareHistoryList catId={catId} />
      </Scaffold.Body>
    </Scaffold>
  );
}

import { CatLoading, cn, HeaderBackButton, Scaffold } from "@/features/common";
import { useQuery } from "@tanstack/react-query";
import { CareHistoryList } from "../components/care-history-list";
import { catInfoOptions } from "../services/cat-info";
import styles from "./care-history-screen.module.css";

export function CareHistoryScreen() {
  const { data: catInfo, status: catInfoStatus } = useQuery(catInfoOptions());

  const isLoading = catInfoStatus === "pending";
  const isSuccess = catInfoStatus === "success" && catInfo;

  return (
    <Scaffold>
      <Scaffold.Header title="Care history" left={<HeaderBackButton />} />
      <Scaffold.Body
        className={cn(["bg-pattern-cat", isLoading && styles.loading])}
      >
        {isLoading && <CatLoading />}
        {isSuccess && <CareHistoryList catId={catInfo.id} />}
      </Scaffold.Body>
    </Scaffold>
  );
}

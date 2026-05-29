import { AgeGroup } from "@catarchy/shared/constants/cat";
import { useInfiniteQuery } from "@tanstack/react-query";

import { CatCharacter, cn } from "@/features/common";
import { useInfiniteScroll } from "@/features/common";

import { careRecordsOptions } from "../services/care-record";
import { CareHistoryEmpty } from "./care-history-empty";
import { CareHistoryItem } from "./care-history-item";
import styles from "./care-history-list.module.css";

export function CareHistoryList({ catId }: { catId: string }) {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    ...careRecordsOptions({
      catId,
      limit: 5,
    }),
    enabled: Boolean(catId),
  });

  const { loadMoreRef } = useInfiniteScroll({
    fetchNextPage: () => fetchNextPage(),
    hasNextPage: Boolean(hasNextPage),
  });

  const hasNoRecords = data?.pages[0]?.items.length === 0;

  return (
    <div className={styles.container}>
      <div className={cn([styles.list, hasNoRecords && styles.emptyList])}>
        {hasNoRecords && <CareHistoryEmpty catId={catId} />}
        {data?.pages.map((page) =>
          page?.items.map((record) => (
            <CareHistoryItem key={record.id} record={record} />
          )),
        )}
        {hasNextPage && (
          <div id="load-more" ref={loadMoreRef} className={styles.loadMore}>
            <CatCharacter age={AgeGroup.ADULT} scale={1} tag="walk" />
          </div>
        )}
      </div>
    </div>
  );
}

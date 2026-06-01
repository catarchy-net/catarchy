import { AgeGroup } from "@catarchy/shared/constants/cat";
import { useInfiniteQuery } from "@tanstack/react-query";

import {
  CatCharacter,
  HeaderBackButton,
  Scaffold,
  useInfiniteScroll,
} from "@/features/common";

import { AgeUpEvent } from "../components/age-up-event";
import { ChronicleHeader } from "../components/chronicle-header";
import { FriendshipEvent } from "../components/friendship-event";
import { LoveEvent } from "../components/love-event";
import { chroniclesOptions, getChronicles } from "../services/chronicle";
import styles from "./chronicle-screen.module.css";

type ChronicleItem = NonNullable<
  Awaited<ReturnType<typeof getChronicles>>
>["items"][number];

function ChronicleEvent({ item }: { item: ChronicleItem }) {
  const { body, createdAt } = item;
  switch (body.type) {
    case "FRIENDSHIP":
      return (
        <FriendshipEvent
          catName={body.catName}
          targetCatName={body.targetCatName}
          createdAt={createdAt}
        />
      );
    case "LOVE":
      return (
        <LoveEvent
          catName={body.catName}
          targetCatName={body.targetCatName}
          createdAt={createdAt}
        />
      );
    case "AGE_UP":
      return (
        <AgeUpEvent
          catName={body.catName}
          age={body.age}
          createdAt={createdAt}
        />
      );
  }
}

export function ChronicleScreen() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
    chroniclesOptions({ limit: 20 }),
  );

  const { loadMoreRef } = useInfiniteScroll({
    fetchNextPage: () => fetchNextPage(),
    hasNextPage: Boolean(hasNextPage),
  });

  return (
    <Scaffold>
      <Scaffold.Header title="Chronicle" left={<HeaderBackButton />} />
      <Scaffold.Body className={styles.body}>
        <ChronicleHeader />
        <div className={styles.list}>
          {data?.pages.map((page) =>
            page?.items.map((item) => (
              <ChronicleEvent key={item.id} item={item} />
            )),
          )}
          {hasNextPage && (
            <div ref={loadMoreRef} className={styles.loadMore}>
              <CatCharacter age={AgeGroup.ADULT} scale={1} clip tag="walk" />
            </div>
          )}
        </div>
      </Scaffold.Body>
    </Scaffold>
  );
}

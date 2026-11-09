import type { Href } from "expo-router";
import type { PropsWithChildren } from "react";

import type { NavKey } from "./BottomNav";
import { ErrorMessage } from "./ErrorMessage";
import { Header } from "./Header";
import { useHeaderTop } from "./Hero";
import { ScreenLayout } from "./ScreenLayout";

interface PlainScreenProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  backHref?: Href;
  backLabel?: string;
  nav?: NavKey;
}

/** Standard frame for secondary screens (details, lists) that have no illustration. */
export function PlainScreen({
  title,
  subtitle,
  backHref,
  backLabel,
  nav,
  children,
}: PlainScreenProps) {
  const headerTop = useHeaderTop();

  return (
    <ScreenLayout
      nav={nav}
      contentStyle={{ paddingHorizontal: 20, paddingTop: headerTop }}
    >
      <Header
        title={title}
        subtitle={subtitle}
        backHref={backHref}
        backLabel={backLabel}
      />
      {children}
    </ScreenLayout>
  );
}

/** Screen shown when a route parameter is not a valid identifier. */
export function InvalidIdScreen({ message }: { message: string }) {
  const headerTop = useHeaderTop();

  return (
    <ScreenLayout contentStyle={{ paddingHorizontal: 20, paddingTop: headerTop }}>
      <ErrorMessage message={message} />
    </ScreenLayout>
  );
}

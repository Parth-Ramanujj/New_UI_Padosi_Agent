import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-aware Suspense skeleton. Picks a layout that matches the target page
 * so the user sees stable structure instead of a spinner during chunk load.
 */

const Block = ({ className = "" }: { className?: string }) => (
  <Skeleton className={className} />
);

/* ─── Layouts ─── */

const ListingLayout = () => (
  <main className="container-content py-20 sm:py-24">
    <div className="text-center mb-8">
      <Block className="h-8 w-64 mx-auto mb-3" />
      <Block className="h-4 w-96 max-w-full mx-auto" />
    </div>
    <Block className="h-12 w-full rounded-2xl mb-6" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Block key={i} className="h-64 rounded-xl" />
      ))}
    </div>
  </main>
);

const ArticleLayout = () => (
  <main className="container-content py-20 sm:py-24 max-w-4xl">
    <Block className="h-4 w-32 mb-4" />
    <Block className="h-10 w-3/4 mb-4" />
    <Block className="h-5 w-1/2 mb-8" />
    <Block className="h-64 w-full rounded-2xl mb-8" />
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Block key={i} className="h-4 w-full" />
      ))}
    </div>
  </main>
);

const FormLayout = () => (
  <main className="container-content py-20 sm:py-24 max-w-md">
    <Block className="h-8 w-48 mb-2 mx-auto" />
    <Block className="h-4 w-64 mb-8 mx-auto" />
    <div className="space-y-4 rounded-2xl border border-border/40 bg-card p-6">
      <Block className="h-12 w-full rounded-xl" />
      <Block className="h-12 w-full rounded-xl" />
      <Block className="h-12 w-full rounded-xl" />
      <Block className="h-12 w-full rounded-xl" />
    </div>
  </main>
);

const ContentLayout = () => (
  <main className="container-content py-20 sm:py-24 max-w-3xl">
    <Block className="h-9 w-2/3 mb-3" />
    <Block className="h-5 w-1/2 mb-8" />
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Block className="h-5 w-1/3" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  </main>
);

const HeroGridLayout = () => (
  <main className="container-content py-20 sm:py-24">
    <div className="text-center mb-10">
      <Block className="h-12 w-3/4 max-w-2xl mx-auto mb-4" />
      <Block className="h-5 w-1/2 max-w-xl mx-auto mb-6" />
      <Block className="h-14 w-full max-w-xl rounded-2xl mx-auto" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Block key={i} className="h-48 rounded-xl" />
      ))}
    </div>
  </main>
);

const StartLayout = () => (
  <main className="min-h-screen flex items-center justify-center px-4">
    <div className="w-full max-w-2xl rounded-3xl border border-border/40 bg-card/80 p-6 sm:p-8 space-y-4">
      <div className="flex flex-col items-center gap-3">
        <Block className="h-14 w-40" />
        <Block className="h-7 w-64 rounded-full" />
        <div className="flex gap-2">
          <Block className="h-6 w-24 rounded-full" />
          <Block className="h-6 w-20 rounded-full" />
          <Block className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="space-y-3 sm:flex sm:flex-nowrap sm:gap-2 sm:space-y-0">
        <Block className="h-12 flex-1 rounded-xl" />
        <Block className="h-12 flex-1 rounded-xl" />
        <Block className="h-12 flex-1 rounded-xl" />
      </div>
      <Block className="h-12 w-full rounded-2xl" />
    </div>
  </main>
);

/* ─── Route → Layout ─── */

import {
  resolveLayoutKey,
  loadSkeletonOverrides,
  type SkeletonLayoutKey,
  type SkeletonOverrides,
} from "@/config/skeletonLayouts";

export const SKELETON_LAYOUT_COMPONENTS: Record<SkeletonLayoutKey, React.FC> = {
  listing: ListingLayout,
  article: ArticleLayout,
  form: FormLayout,
  content: ContentLayout,
  "hero-grid": HeroGridLayout,
  start: StartLayout,
};

const PageSkeleton: React.FC = () => {
  const { pathname } = useLocation();
  const [overrides, setOverrides] = React.useState<SkeletonOverrides>(() =>
    loadSkeletonOverrides()
  );

  React.useEffect(() => {
    const handler = () => setOverrides(loadSkeletonOverrides());
    window.addEventListener("skeleton-overrides-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("skeleton-overrides-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const layoutKey = resolveLayoutKey(pathname, overrides);
  const Layout = SKELETON_LAYOUT_COMPONENTS[layoutKey] ?? HeroGridLayout;

  const showChrome =
    pathname !== "/login" &&
    pathname !== "/register" &&
    pathname !== "/admin-login" &&
    pathname !== "/start";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showChrome && <Navbar />}
      <div className="flex-grow"><Layout /></div>
      {showChrome && <Footer />}
    </div>
  );
};

export default PageSkeleton;

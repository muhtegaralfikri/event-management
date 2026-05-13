"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

const isPlainLeftClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

export const NavigationProgress = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const previousRouteKey = useRef(routeKey);

  useEffect(() => {
    if (previousRouteKey.current === routeKey) {
      return;
    }

    previousRouteKey.current = routeKey;
    const timeout = window.setTimeout(() => {
      setIsNavigating(false);
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [routeKey]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!isPlainLeftClick(event) || event.defaultPrevented) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) {
        return;
      }

      if (
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search &&
        nextUrl.hash !== currentUrl.hash
      ) {
        return;
      }

      if (nextUrl.href === currentUrl.href) {
        return;
      }

      setIsNavigating(true);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    if (!isNavigating) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsNavigating(false);
    }, 8000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isNavigating]);

  if (!isNavigating) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[100] h-1 bg-teal-950/10">
        <div className="navigation-progress-bar h-full bg-teal-700 shadow-[0_0_18px_rgba(15,118,110,0.45)]" />
      </div>
      <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-stone-200 bg-white/95 px-4 py-2 text-sm font-medium text-stone-800 shadow-lg backdrop-blur">
        <LoaderCircle className="h-4 w-4 animate-spin text-teal-700" aria-hidden="true" />
        Memuat halaman...
      </div>
    </>
  );
};

"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to detect if the component has mounted on the client.
 * Essential for preventing hydration mismatches with SSR.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

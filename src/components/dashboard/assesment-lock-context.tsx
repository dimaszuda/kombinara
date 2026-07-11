"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AssesmentLockContextValue {
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
}

const AssesmentLockContext = createContext<AssesmentLockContextValue>({
  isLocked: false,
  setLocked: () => {},
});

export function AssesmentLockProvider({ children }: { children: ReactNode }) {
  const [isLocked, setLocked] = useState(false);
  return (
    <AssesmentLockContext.Provider value={{ isLocked, setLocked }}>
      {children}
    </AssesmentLockContext.Provider>
  );
}

export function useAssesmentLock() {
  return useContext(AssesmentLockContext);
}

"use client";

import React, { createContext, useContext } from "react";

interface InstructorContextType {
  // Reserved for future instructor-scoped state
}

const InstructorContext = createContext<InstructorContextType | undefined>(undefined);

export function InstructorProvider({ children }: { children: React.ReactNode }) {
  return <InstructorContext.Provider value={{}}>{children}</InstructorContext.Provider>;
}

export function useInstructor() {
  const context = useContext(InstructorContext);
  if (context === undefined) {
    throw new Error("useInstructor must be used within an InstructorProvider");
  }
  return context;
}

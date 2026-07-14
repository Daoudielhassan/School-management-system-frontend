"use client";

import React, { createContext, useContext } from "react";

interface StudentContextType {
  // Reserved for future student-scoped state
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  return <StudentContext.Provider value={{}}>{children}</StudentContext.Provider>;
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
}

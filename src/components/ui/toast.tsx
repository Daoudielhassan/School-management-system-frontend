"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

interface Toast {
  id: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

// ToastActionElement: Represents the action element for a toast
export type ToastActionElement = React.ReactElement<{
  label: string;
  onClick: () => void;
}>;

// ToastProps: Defines the properties for the Toast component
export interface ToastProps {
  toast: {
    id: string;
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
  };
  onClose: () => void;
}


const ToastContext = createContext<ToastContextType | null>(null)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    setToasts((prev) => [...prev, { ...toast, id: Math.random().toString(36).substring(2, 15) }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const ToastViewport = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

export const Toast = ({
  toast,
  onClose,
}: {
  toast: Toast
  onClose: () => void
}) => {
  return (
    <div className="bg-gray-800 text-white rounded-md shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <ToastTitle>{toast.title}</ToastTitle>
          {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
        </div>
        <ToastClose onClick={onClose}>&times;</ToastClose>
      </div>
      {toast.action && (
        <div className="mt-2">
          <ToastAction onClick={toast.action.onClick}>{toast.action.label}</ToastAction>
        </div>
      )}
    </div>
  )
}

export const ToastTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-medium">{children}</h3>
)

export const ToastDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm mt-1">{children}</p>
)

export const ToastClose = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button onClick={onClick} className="text-gray-400 hover:text-gray-200">
    {children}
  </button>
)

export const ToastAction = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button onClick={onClick} className="text-blue-500 hover:underline">
    {children}
  </button>
)


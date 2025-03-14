import React, { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-1/2">
        {children}
      </div>
    </div>
  );
};

export const ModalContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const ModalHeader: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="p-4 border-b">{children}</div>;
};

export const ModalBody: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="p-4">{children}</div>;
};

export const ModalFooter: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="p-4 border-t flex justify-end">{children}</div>;
};
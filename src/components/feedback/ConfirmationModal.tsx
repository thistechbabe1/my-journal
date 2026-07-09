'use client';

import React from 'react';
import ActionButton from '../editorial/ActionButton';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-card border border-card-border p-6 rounded-lg max-w-sm w-full shadow-sm text-left space-y-4">
        <div className="space-y-1.5">
          <h4 className="font-serif text-lg font-medium text-foreground">
            {title}
          </h4>
          <p className="text-xs text-sharon-muted leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg border border-card-border text-[10px] font-bold hover:bg-sharon-muted-light cursor-pointer transition-colors text-foreground"
          >
            {cancelText}
          </button>
          <ActionButton
            onClick={onConfirm}
            variant={variant}
            className="px-3.5 py-1.5 text-[10px] font-bold"
          >
            {confirmText}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

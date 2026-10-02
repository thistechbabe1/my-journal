'use client';

import React from 'react';
import { X } from 'lucide-react';

interface NotificationBarProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
  onClose: () => void;
}

export default function NotificationBar({
  message,
  actionText,
  onAction,
  onClose
}: NotificationBarProps) {
  return (
    <div className="bg-sharon-accent text-white font-sans text-xs py-2 px-4 flex items-center justify-between gap-4 select-none">
      <div className="flex-1 text-center font-medium ">
        <span>{message}</span>
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="ml-3 underline hover:text-white/80 transition-colors font-bold cursor-pointer"
          >
            {actionText}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-white/70 hover:text-white transition-colors p-0.5 rounded cursor-pointer shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  );
}

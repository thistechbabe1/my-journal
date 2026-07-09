import React from 'react';

export default function NotebookPage({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-card-border rounded-lg p-8 sm:p-12 shadow-sm font-serif max-w-2xl mx-auto ${className}`}>
      {children}
    </div>
  );
}

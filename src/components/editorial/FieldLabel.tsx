import React from 'react';

export default function FieldLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-xs font-bold uppercase tracking-wider text-sharon-muted text-left mb-1.5 ${className}`}>
      {children}
    </label>
  );
}

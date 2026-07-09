import React from 'react';

export default function EditorialCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`sharon-card p-6 ${className}`}>
      {children}
    </div>
  );
}

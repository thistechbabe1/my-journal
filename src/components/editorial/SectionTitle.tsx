import React from 'react';

export default function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`font-serif text-lg font-medium text-foreground text-left ${className}`}>
      {children}
    </h3>
  );
}

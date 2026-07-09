import React from 'react';

export default function Divider({ className = '' }: { className?: string }) {
  return <hr className={`border-card-border/60 my-6 ${className}`} />;
}

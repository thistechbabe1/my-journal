import React from 'react';

export default function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left">
      <div>
        <h1 className="text-4xl font-serif font-light text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-sharon-muted mt-1.5 font-sans">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

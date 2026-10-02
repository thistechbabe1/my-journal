import React from 'react';

export default function QuoteBlock({ quote, author }: { quote: string; author?: string }) {
  return (
    <div className="py-4 px-6 border-l border-card-border bg-sharon-muted-light/10 text-left rounded-r-lg">
      <p className="font-serif italic text-sm text-foreground leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>
      {author && (
        <span className="block text-[10px] text-sharon-muted mt-2 font-semibold">
          — {author}
        </span>
      )}
    </div>
  );
}

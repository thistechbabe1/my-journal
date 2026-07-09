import React from 'react';

export default function QuietProgress({ value, label }: { value: number; label: string }) {
  return (
    <div className="space-y-1 text-left">
      <div className="flex justify-between items-center text-[10px] font-semibold">
        <span className="text-sharon-muted">{label}</span>
        <span className="text-sharon-primary">{value}%</span>
      </div>
      <div className="w-full h-1 bg-sharon-muted-light rounded-full overflow-hidden">
        <div
          className="h-full bg-sharon-accent transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

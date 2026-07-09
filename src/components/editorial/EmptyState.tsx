import React from 'react';

export default function EmptyState({ title, description, action, icon: Icon }: { title: string; description: string; action?: React.ReactNode; icon?: React.ComponentType<any> }) {
  return (
    <div className="sharon-card p-16 text-center text-sharon-muted flex flex-col items-center justify-center space-y-4">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-sharon-muted-light flex items-center justify-center text-sharon-primary">
          <Icon size={22} />
        </div>
      )}
      <div>
        <h3 className="font-serif text-lg font-medium text-foreground">{title}</h3>
        <p className="text-xs mt-1 font-sans">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

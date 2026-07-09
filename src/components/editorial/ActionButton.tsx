import React from 'react';

export default function ActionButton({
  children,
  onClick,
  disabled,
  type = 'button',
  variant = 'secondary',
  className = ''
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}) {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 font-sans";
  const variants = {
    primary: "bg-sharon-primary hover:bg-sharon-primary-light text-white border border-transparent",
    secondary: "border border-card-border bg-card text-foreground hover:bg-sharon-muted-light/60",
    danger: "bg-danger hover:bg-danger/80 text-white border border-transparent"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

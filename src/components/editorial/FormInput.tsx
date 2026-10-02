import React from 'react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export default function FormInput({
  label,
  error,
  helperText,
  containerClassName = '',
  className = '',
  id,
  type = 'text',
  ...props
}: FormInputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 flex flex-col ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-[11px] font-bold text-sharon-muted select-none">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`w-full min-h-[44px] px-3.5 py-2.5 text-xs font-semibold rounded-lg bg-sharon-muted-light/40 border border-card-border text-foreground placeholder:text-sharon-muted/60 focus:border-sharon-primary focus:bg-card outline-none transition-all ${
          error ? 'border-danger focus:border-danger' : ''
        } ${className}`}
        {...props}
      />
      {error ? (
        <span className="text-[11px] font-semibold text-danger">{error}</span>
      ) : helperText ? (
        <span className="text-[11px] text-sharon-muted">{helperText}</span>
      ) : null}
    </div>
  );
}

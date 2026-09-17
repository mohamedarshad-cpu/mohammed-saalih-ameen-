import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  id,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200';

  const variantStyles = {
    default: 'bg-white border border-slate-200/80 shadow-sm hover:shadow-md',
    elevated: 'bg-white border border-slate-200/60 shadow-md hover:shadow-lg',
    bordered: 'bg-white border-2 border-slate-200 shadow-none',
    flat: 'bg-slate-50/80 border border-slate-200/60',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      id={id}
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

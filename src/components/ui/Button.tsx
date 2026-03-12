import React, { forwardRef } from "react";

// Usando un enfoque simple para la varianza de clases sin dependencias externas
const variants = {
  primary:
    "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20",
  secondary:
    "bg-card hover:bg-background border border-border text-text-main shadow-sm",
  ghost: "text-text-secondary hover:text-text-main",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2 text-sm",
  lg: "px-8 py-3 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      iconLeft,
      iconRight,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed";

    const combinedClasses = [
      baseClasses,
      variants[variant],
      sizes[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button className={combinedClasses} ref={ref} {...props}>
        {iconLeft && <span className="mr-2 -ml-1 h-5 w-5">{iconLeft}</span>}
        {children}
        {iconRight && <span className="ml-2 -mr-1 h-5 w-5">{iconRight}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";

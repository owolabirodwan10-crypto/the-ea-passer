import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "ghost" | "danger" | "success";
type Size = "sm" | "md";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-primary to-[#1f5fd6] text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_8px_20px_-10px_rgba(47,124,246,0.7)] hover:-translate-y-px",
  ghost: "bg-transparent text-text border border-border hover:border-mutedSoft",
  danger: "bg-transparent text-error border border-error/40 hover:bg-error/10",
  success: "bg-success text-[#062017] hover:brightness-110",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-[13px] px-3.5 py-2",
  md: "text-sm px-4.5 py-2.5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";

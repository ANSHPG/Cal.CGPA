import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-active)] shadow-sm":
              variant === "primary",
            "bg-[var(--color-surface-card)] text-[var(--color-ink)] hover:bg-[var(--color-surface-strong)]":
              variant === "secondary",
            "border border-[var(--color-hairline)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]":
              variant === "outline",
            "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]":
              variant === "ghost",
            "h-10 px-5 py-3": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-12 rounded-md px-8 text-base": size === "lg",
            "h-9 w-9 rounded-full": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

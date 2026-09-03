import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  className?: string;
};

type ButtonProps = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    /** When provided, renders as a styled link instead of a <button>, so it
     * is never nested inside another interactive element. */
    href?: string;
  };

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-blue-500",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 focus-visible:ring-blue-500",
  danger:
    "border border-red-300 bg-white text-red-700 hover:bg-red-50 focus-visible:ring-red-500",
  ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-blue-500",
};

const baseClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export default function Button({
  variant = "primary",
  loading = false,
  loadingText,
  disabled,
  className = "",
  children,
  href,
  ...rest
}: ButtonProps) {
  const content = loading ? (loadingText ?? "Working...") : children;
  const classes = `${baseClassName} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button {...rest} disabled={disabled || loading} className={classes}>
      {content}
    </button>
  );
}

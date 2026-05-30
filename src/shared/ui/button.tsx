import { cn } from "@/shared/lib";

type ButtonVariant = "primary" | "secondary" | "danger";

type Props = {
  variant?: ButtonVariant;
  isLoading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({
  variant = "primary",
  isLoading,
  className,
  disabled,
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Загрузка..." : children}
    </button>
  );
}

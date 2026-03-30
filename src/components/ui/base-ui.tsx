import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
}

export function ProgressBar({ value, max = 100, className, color = "bg-primary-500" }: ProgressBarProps) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);
  const isHex = color.startsWith("#");

  return (
    <div className={cn("w-full bg-zinc-800 rounded-full h-2 overflow-hidden shadow-inner", className)}>
      <div
        className={cn("h-full transition-all duration-1000 ease-in-out", !isHex && color)}
        style={{ 
          width: `${percentage}%`,
          backgroundColor: isHex ? color : undefined 
        }}
      />
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  isLoading, 
  className, 
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-900/20",
    secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
}

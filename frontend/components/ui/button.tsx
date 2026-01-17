import * as React from 'react';
import { cn } from '@/lib/utils';

// Ideally we'd valid shadcn setup but for now let's just make a simple component
const buttonVariants = {
  default: 'glass-pill text-white/80 hover:text-white shadow-lg',
  destructive: 'bg-red-500/80 text-white hover:bg-red-500',
  outline:
    'border border-white/15 bg-transparent text-white/70 hover:bg-white/5',
  secondary: 'bg-white/10 text-white/70 hover:bg-white/20',
  ghost: 'hover:bg-white/5 hover:text-white',
  link: 'text-primary underline-offset-4 hover:underline',
};

const buttonSizes = {
  default: 'h-12 px-6',
  sm: 'h-9 rounded-full px-3',
  lg: 'h-14 rounded-full px-10',
  icon: 'h-10 w-10',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const Comp = 'button';
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-light tracking-[0.2em] uppercase ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:shadow-custom-md hover:scale-105 shadow-custom-sm hover:shadow-glow transition-all duration-300",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg",
        outline: "border-2 border-primary text-primary bg-card hover:bg-primary hover:text-primary-foreground hover:shadow-glow transition-all duration-300",
        secondary: "bg-gradient-secondary text-secondary-foreground hover:shadow-custom-md hover:scale-105 shadow-custom-sm hover:shadow-neon transition-all duration-300",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground transition-colors duration-200",
        link: "text-primary underline-offset-4 hover:underline hover:text-accent transition-colors duration-200",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-custom-sm hover:shadow-custom-md hover:shadow-glow",
        hero: "bg-gradient-hero text-primary-foreground hover:shadow-glow hover:scale-105 shadow-custom-lg font-bold hover:shadow-neon transition-all duration-400",
        mobile: "bg-primary text-primary-foreground hover:bg-primary-dark shadow-custom-sm active:shadow-none touch-manipulation hover:shadow-glow transition-all duration-200",
        neon: "bg-gradient-to-r from-primary via-accent to-secondary text-white font-bold hover:scale-105 hover:shadow-neon shadow-glow transition-all duration-300",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4 text-sm",
        lg: "h-14 rounded-xl px-8 text-lg font-semibold",
        icon: "h-12 w-12",
        mobile: "h-14 px-6 py-4 text-base font-semibold w-full",
        pill: "h-10 px-6 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-blue-400 text-white shadow-sm hover:bg-gray-800 active:bg-gray-1200",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800",
        outline:
          "border border-gray-300 bg-white text-gray-900 shadow-sm hover:bg-gray-100 active:bg-gray-200",
        secondary:
          "bg-gray-200 text-gray-900 shadow-sm hover:bg-gray-300 active:bg-gray-400",
        ghost: "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
        link: "text-gray-900 underline-offset-4 hover:underline",
        dark: "bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-900",
        light: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-sm px-4 text-xs",
        lg: "h-12 rounded-sm px-8 text-base",
        icon: "size-10",
        xs: "h-6 rounded-sm px-2 text-xs",
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
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

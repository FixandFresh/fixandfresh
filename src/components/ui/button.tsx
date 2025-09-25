import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/25 hover:from-red-700 hover:to-rose-700",
        outline:
          "border-2 border-emerald-200 bg-white/80 backdrop-blur-sm text-emerald-700 shadow-md hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-lg",
        secondary:
          "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 shadow-md hover:from-slate-200 hover:to-slate-300 hover:shadow-lg",
        ghost: "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg",
        link: "text-emerald-600 underline-offset-4 hover:underline hover:text-emerald-700",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-13 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
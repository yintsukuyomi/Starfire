import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-ios-body font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation active:scale-98 font-ios",
  {
    variants: {
      variant: {
        default: "bg-ios-blue text-white hover:bg-ios-blue/90 active:bg-ios-blue/80 shadow-ios rounded-ios",
        destructive:
          "bg-ios-red text-white hover:bg-ios-red/90 active:bg-ios-red/80 shadow-ios rounded-ios",
        outline:
          "border-2 border-ios-blue bg-transparent text-ios-blue hover:bg-ios-blue/10 active:bg-ios-blue/20 rounded-ios",
        secondary:
          "bg-ios-gray-6 text-foreground hover:bg-ios-gray-5 active:bg-ios-gray-4 rounded-ios",
        ghost: "hover:bg-accent/50 active:bg-accent/80 rounded-ios",
        link: "text-ios-blue underline-offset-4 hover:underline p-0 h-auto",
        // iOS-specific variants
        ios: "bg-ios-blue text-white hover:bg-ios-blue/90 active:bg-ios-blue/80 shadow-ios rounded-ios font-semibold",
        "ios-filled": "bg-accent text-accent-foreground hover:bg-accent/80 active:bg-accent/60 rounded-ios shadow-ios-sm",
        "ios-tinted": "bg-ios-blue/10 text-ios-blue hover:bg-ios-blue/20 active:bg-ios-blue/30 rounded-ios",
        "ios-gray": "bg-ios-gray-6 text-ios-gray hover:bg-ios-gray-5 active:bg-ios-gray-4 rounded-ios",
      },
      size: {
        default: "h-11 px-6 py-2 min-h-[44px]", 
        sm: "h-9 rounded-ios px-4 min-h-[36px] text-ios-footnote",
        lg: "h-12 rounded-ios px-8 min-h-[48px] text-ios-headline",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] rounded-ios",
        xs: "h-8 px-3 text-ios-caption1 min-h-[32px] rounded-lg",
        // iOS-specific sizes
        "ios-large": "h-12 px-8 text-ios-headline font-semibold min-h-[50px] rounded-ios",
        "ios-small": "h-8 px-4 text-ios-footnote min-h-[32px] rounded-lg",
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

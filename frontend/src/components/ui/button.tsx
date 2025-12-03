import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Custom variants for gaming theme
        gold: "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0A0E27] hover:from-[#FFA500] hover:to-[#FFD700] shadow-lg shadow-[#FFD700]/20 font-semibold",
        neon: "bg-gradient-to-r from-[#00F5FF] to-[#00D4FF] text-[#0A0E27] hover:from-[#00D4FF] hover:to-[#00F5FF] shadow-lg shadow-[#00F5FF]/30 font-semibold",
        royal: "bg-gradient-to-br from-[#0A0E27] to-[#1a1f3a] text-[#FFD700] border-2 border-[#FFD700]/30 hover:border-[#FFD700] shadow-lg hover:shadow-[#FFD700]/20",
        // Premium Metallic Variants
        'premium-gold': "bg-premium-gold text-[#0A0E27] font-bold shadow-glow-gold hover:shadow-gold-glow-strong border border-[#FFD700]/50 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        'premium-royal': "bg-premium-royal text-[#FFD700] font-bold shadow-glow-royal hover:shadow-royal-lg border border-[#FFD700]/30 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
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
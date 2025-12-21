import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-300",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-300",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300",
        ghost: "hover:bg-accent hover:text-accent-foreground transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline",
        
        // Electric Blue - Primary Action
        electric: "bg-electric-blue text-white hover:shadow-glow-blue-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-bold animate-glow-electric",
        
        'electric-outline': "bg-casino-darkest border-2 border-glow-blue text-glow-blue hover:bg-glow-blue hover:text-casino-black hover:shadow-glow-blue-lg hover:scale-[1.02] transition-all duration-300 font-bold",
        
        // Metallic Green - Professional Accent
        'metallic': "bg-metallic-green-shine text-white hover:shadow-glow-metallic-lg hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-semibold shadow-metallic-sheen animate-glow-metallic",
        
        'metallic-outline': "bg-casino-darkest border-2 border-metallic-green-shine text-glow-emerald hover:bg-metallic-green hover:text-white hover:shadow-glow-emerald-lg hover:scale-[1.02] transition-all duration-300 font-semibold",
        
        // Emerald Green - Success Actions
        'emerald': "bg-btn-emerald text-white hover:shadow-glow-emerald-lg hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-bold animate-glow-emerald",
        
        // Blue + Green Combination - Premium
        'blue-emerald': "bg-blue-emerald text-white hover:shadow-glow-professional hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-bold",
        
        // Purple Glow - Partner Actions
        'purple-glow': "bg-btn-purple text-white hover:shadow-glow-purple-lg hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-bold",
        
        // Multi-color - Ultra Premium
        'multi-glow': "bg-btn-multi text-white hover:shadow-glow-rainbow hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-bold bg-[length:200%_auto] animate-fluid-gradient",
        
        // Dark Glass - Subtle Actions
        'dark-glass': "bg-casino-darker/80 backdrop-blur-sm border border-glow-blue/20 text-glow-blue hover:bg-casino-darker hover:border-glow-blue/50 hover:shadow-glow-blue hover:scale-[1.02] transition-all duration-300",
        
        'dark-glass-emerald': "bg-casino-darker/80 backdrop-blur-sm border border-glow-emerald/20 text-glow-emerald hover:bg-casino-darker hover:border-glow-emerald/50 hover:shadow-glow-emerald hover:scale-[1.02] transition-all duration-300",
        
        // Game specific
        andar: "bg-andar-gradient text-white hover:shadow-andar-glow hover:scale-[1.02] transition-all duration-300 font-bold border border-error-DEFAULT/30",
        
        bahar: "bg-bahar-gradient text-white hover:shadow-bahar-glow hover:scale-[1.02] transition-all duration-300 font-bold border border-info-DEFAULT/30",
        
        // Legacy gold variants
        gold: "bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-white hover:shadow-lg hover:shadow-yellow-500/50 hover:scale-[1.02] transition-all duration-300 font-bold",
        
        'premium-gold': "bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-white hover:shadow-xl hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-bold animate-shimmer",
        
        neon: "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-[1.02] transition-all duration-300 font-bold",
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
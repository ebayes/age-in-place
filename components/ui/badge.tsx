import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-[8px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "",
        secondary: "",
        outline: "border border-border bg-transparent",
      },
      color: {
        gray: "",
        blue: "",
        green: "",
        red: "",
        amber: "",
        purple: "",
        pink: "",
        teal: "",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] font-medium",
        md: "px-3 py-1 text-[12px] font-medium",
        lg: "px-4 py-1.5 text-[14px] font-medium",
      },
    },
    compoundVariants: [
      // Primary variant colors
      { variant: "primary", color: "gray", class: "bg-gray-500 text-gray-50 hover:bg-gray-600 dark:bg-gray-600 dark:text-gray-50" },
      { variant: "primary", color: "green", class: "bg-green-500 text-gray-50 hover:bg-green-600 dark:bg-green-600 dark:text-green-50" },
      { variant: "primary", color: "red", class: "bg-red-500 text-gray-50 hover:bg-red-600 dark:bg-red-700 dark:text-red-50" },
      { variant: "primary", color: "amber", class: "bg-amber-700 text-gray-50 hover:bg-amber-800 dark:bg-amber-700 dark:text-amber-50" },
      { variant: "primary", color: "purple", class: "bg-purple-500 text-gray-50 hover:bg-purple-600 dark:bg-purple-800 dark:text-purple-50" },
      { variant: "primary", color: "teal", class: "bg-teal-600 text-gray-50 hover:bg-teal-700 dark:bg-teal-500 dark:text-teal-50" },
      { variant: "primary", color: "blue", class: "bg-blue-500 text-gray-50 hover:bg-blue-600 dark:bg-blue-600 dark:text-blue-50" },
      { variant: "primary", color: "pink", class: "bg-pink-500 text-gray-50 hover:bg-pink-600 dark:bg-pink-600 dark:text-pink-50" },

      // Secondary variant colors
      { variant: "secondary", color: "gray", class: "bg-gray-100 text-gray-700 dark:bg-gray-300 dark:text-gray-900" },
      { variant: "secondary", color: "green", class: "bg-green-75 text-green-800 dark:bg-green-50 dark:text-green-950" },
      { variant: "secondary", color: "red", class: "bg-red-75 text-red-800 dark:bg-red-50 dark:text-red-950" },
      { variant: "secondary", color: "amber", class: "bg-amber-75 text-amber-900 dark:bg-amber-50 dark:text-amber-900" },
      { variant: "secondary", color: "purple", class: "bg-purple-50 text-purple-800 dark:bg-purple-50 dark:text-purple-950" },
      { variant: "secondary", color: "teal", class: "bg-teal-75 text-teal-800 dark:bg-teal-50 dark:text-teal-900" },
      { variant: "secondary", color: "blue", class: "bg-blue-75 text-blue-800 dark:bg-blue-50 dark:text-blue-900" },
      { variant: "secondary", color: "pink", class: "bg-pink-75 text-pink-800 dark:bg-pink-50 dark:text-pink-950" },

      // Outline variant colors
      { variant: "outline", color: "gray", class: "border-gray-500 text-gray-700 dark:border-gray-500 dark:text-gray-900" },
      { variant: "outline", color: "green", class: "border-green-400 text-green-600 dark:border-green-300 dark:text-green-800" },
      { variant: "outline", color: "red", class: "border-red-400 text-red-500 dark:border-red-300 dark:text-red-900" },
      { variant: "outline", color: "amber", class: "border-amber-400 text-amber-700 dark:border-amber-100 dark:text-amber-800" },
      { variant: "outline", color: "purple", class: "border-purple-500 text-purple-600 dark:border-purple-500 dark:text-purple-950" },
      { variant: "outline", color: "teal", class: "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-800" },
      { variant: "outline", color: "blue", class: "border-blue-400 text-blue-600 dark:border-blue-300 dark:text-blue-800" },
      { variant: "outline", color: "pink", class: "border-pink-500 text-pink-500 dark:border-pink-400 dark:text-pink-700" },
    ],
    defaultVariants: {
      variant: "primary",
      color: "gray",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof badgeVariants> {}

function Badge({ 
  className, 
  color, 
  variant, 
  size, 
  ...props 
}: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ color, variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader, ArrowLeft, ArrowRight } from "@/components/icons";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm rounded-[8px] font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-300 dark:text-gray-950 dark:hover:bg-purple-400",
        secondary:
          "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-300 dark:text-gray-950 dark:hover:bg-gray-400",
        destructive:
          "bg-red-500 text-gray-100 hover:bg-red-600 dark:bg-red-400 dark:text-gray-950 dark:hover:bg-red-500",
        outline:
          "border border-border text-gray-800 hover:bg-gray-100 dark:border-border-xheavy dark:text-white",
        ghost:
          "bg-transparent text-gray-500 hover:bg-gray-100 dark:text-white",
        link:
          "bg-transparent text-gray-800 hover:text-gray-800 hover:underline dark:text-white",
        dashed:
          "bg-transparent text-gray-1000 hover:bg-gray-100 border border-dashed border-gray-200 dark:border-gray-700 rounded-[6px]",
      },
      size: {
        sm: "text-[12px] px-[8px] py-[4px] h-[24px]",
        md: "text-[14px] px-[12px] py-[6px] h-[32px]",
        lg: "text-[14px] px-[12px] py-[6px] h-[36px]",
        xl: "text-[16px] px-[16px] py-[12px] h-[44px]",
        icon: "w-[42px] h-[30px]",
        square: "w-[32px] h-[32px]",
        squaresm: "w-[24px] h-[24px]",
      },
      loading: {
        true: "cursor-not-allowed opacity-70",
      },
      focused: {
        true: "ring-2 ring-primary ring-offset-2 ring-offset-background hover:ring-green-600 dark:hover:ring-green-400",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      loading: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  prefix?: React.ElementType;
  suffix?: React.ElementType;
  loading?: boolean;
  direction?: "left" | "right";
  focused?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size = "md",
      asChild = false,
      prefix: PrefixIcon,
      suffix: SuffixIcon,
      loading = false,
      direction,
      focused,
      children,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? Slot : "button";

    const iconSizes: { [key: string]: string } = {
      sm: "xs",
      md: "sm",
      lg: "md",
      xl: "lg",
    };
    const iconSize = iconSizes[size] || "sm";

    const DirectionIcon =
      direction === "left"
        ? ArrowLeft
        : direction === "right"
        ? ArrowRight
        : null;

    const content = (
      <>
        {loading ? (
          <Loader size={iconSize} className="mr-[4px] animate-spin" />
        ) : (
          (PrefixIcon || direction === "left") && (
            <span className="mr-[4px]">
              {PrefixIcon ? (
                <PrefixIcon size={iconSize} />
              ) : (
                DirectionIcon && <DirectionIcon size={iconSize} />
              )}
            </span>
          )
        )}
        {children}
        {!loading && (SuffixIcon || direction === "right") && (
          <span className="ml-[4px]">
            {SuffixIcon ? (
              <SuffixIcon size={iconSize} />
            ) : (
              DirectionIcon && <DirectionIcon size={iconSize} />
            )}
          </span>
        )}
      </>
    );

    return (
      <Component
        className={cn(
          buttonVariants({ variant, size, loading, focused, className })
        )}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {asChild ? (
          <span className="inline-flex items-center">{content}</span>
        ) : (
          content
        )}
      </Component>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
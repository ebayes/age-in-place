"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, side = "top", ...props }, ref) => (
  <HoverCardPrimitive.Portal>
    <div ref={ref}>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      {/* HoverCard Content */}
      <HoverCardPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        side={side}
        className={cn(
          "relative z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {/* Arrow */}
        <HoverCardPrimitive.Arrow
          className="fill-current text-popover"
          width={16}
          height={8}
        />
        {/* HoverCard Content Children */}
        {props.children}
      </HoverCardPrimitive.Content>
    </div>
  </HoverCardPrimitive.Portal>
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }
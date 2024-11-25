// components/ui/combo-box.tsx

"use client";

import * as React from "react";
import { PopoverProps } from "@radix-ui/react-popover";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { cn, useContextSafely } from "@/lib/utils";
import { Button } from "./button";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { Check, ChevronDown, Search } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

interface SelectContextApi {
  selection: string | undefined;
  select: (val: string) => void;
  open: boolean | undefined;
  setOpen: (val: boolean) => void;
}

const SelectContext = React.createContext<SelectContextApi | null>(null);

interface SelectProps extends PopoverProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
}

/** Select Component **/
export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      defaultOpen = false,
      open,
      onOpenChange,
      defaultValue = '',
      value,
      onValueChange,
      className,
      children,
      placeholder = 'Select...',
      ...otherProps
    },
    ref
  ) => {
    const [selection, setSelection] = useControllableState({
      prop: value,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const [_open, _setOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });

    return (
      <SelectContext.Provider
        value={{
          selection,
          select: (value: string) => {
            setSelection(value);
          },
          open: _open,
          setOpen: _setOpen,
        }}
      >
        <PopoverPrimitive.Root {...otherProps} open={_open} onOpenChange={_setOpen}>
          {children}
        </PopoverPrimitive.Root>
      </SelectContext.Provider>
    );
  }
);
Select.displayName = 'Select';

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> {
  renderValue?: (selectedValue: string) => React.ReactNode;
  placeholder?: string;
}

/** SelectTrigger Component **/
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  SelectTriggerProps
>(
  (
    {
      children,
      className,
      placeholder = 'Select...',
      renderValue,
      ...otherProps
    },
    ref
  ) => {
    const Select = useContextSafely(SelectContext);
    const selectedValue = Select.selection;

    return (
      <PopoverPrimitive.Trigger
        {...otherProps}
        ref={ref}
        className={cn(
          'flex items-center justify-between w-full h-10 px-3 py-2 text-sm bg-transparent border rounded-md',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          className
        )}
      >
        {selectedValue ? (
          renderValue ? renderValue(selectedValue) : selectedValue
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown size={16} className="ml-2 text-gray-400" />
      </PopoverPrimitive.Trigger>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

/** SelectInput Component **/
export const SelectInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(
  (
    {
      className,
      placeholder = 'Type to search...',
      value,
      defaultValue,
      onValueChange,
      ...otherProps
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useControllableState({
      prop: value,
      defaultProp: defaultValue as string | undefined,
      onChange: onValueChange,
    });

    return (
      <div className="px-2 py-1.5">
        <div className="relative">
          <Search className="absolute w-4 h-4 text-gray-400 top-2 left-2" />
          <CommandPrimitive.Input
            ref={ref}
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
            className={cn(
              'w-full h-8 px-8 text-sm bg-transparent border-b focus:outline-none',
              className
            )}
            {...otherProps}
          />
        </div>
      </div>
    );
  }
);
SelectInput.displayName = 'SelectInput';

/** SelectContent Component **/
export const SelectContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(
  (
    { children, className, sideOffset = 4, ...otherProps },
    ref
  ) => {
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          className={cn(
            'z-50 w-full p-1 bg-white border rounded-md shadow-md',
            className
          )}
          {...otherProps}
        >
          <CommandPrimitive>
            {children}
          </CommandPrimitive>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  }
);
SelectContent.displayName = 'SelectContent';

/** SelectItem Component **/
interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  value: string;
  icon?: React.ReactNode;
}

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  SelectItemProps
>(
  ({ children, className, value, icon, ...otherProps }, ref) => {
    const Select = useContextSafely(SelectContext);
    const isSelected = Select.selection === value;

    return (
      <CommandPrimitive.Item
        ref={ref}
        value={value}
        className={cn(
          'flex items-center px-2 py-1.5 text-sm cursor-pointer select-none rounded-md',
          isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100',
          className
        )}
        onSelect={() => {
          Select.select(value);
          Select.setOpen(false);
        }}
        {...otherProps}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
        {isSelected && (
          <Check size={16} className="ml-auto text-white" />
        )}
      </CommandPrimitive.Item>
    );
  }
);
SelectItem.displayName = 'SelectItem';

/** SelectEmpty Component **/
export const SelectEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(
  ({ children, className, ...otherProps }, ref) => (
    <CommandPrimitive.Empty
      ref={ref}
      className={cn('px-2 py-1.5 text-sm text-center text-gray-500', className)}
      {...otherProps}
    >
      {children}
    </CommandPrimitive.Empty>
  )
);
SelectEmpty.displayName = 'SelectEmpty';
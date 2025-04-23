import React, { useState } from "react";
import { cn } from "../utils/cn";
import { ChevronDown } from "lucide-react";

// 简化版Select组件，不使用@radix-ui/react-select，直接使用原生的select
export const Select = ({ children, defaultValue, onValueChange, ...props }) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e) => {
    setValue(e.target.value);
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };

  return (
    <select 
      value={value} 
      onChange={handleChange} 
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </select>
  );
};

export const SelectTrigger = ({ children, className, id, ...props }) => {
  return (
    <div 
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
        className
      )}
      id={id}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </div>
  );
};

export const SelectValue = ({ children, placeholder }) => {
  return <span className="block truncate">{children || placeholder}</span>;
};

export const SelectContent = ({ children }) => {
  return (
    <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-background text-foreground shadow-md mt-1">
      <div className="p-1">{children}</div>
    </div>
  );
};

export const SelectItem = ({ children, value, className, ...props }) => {
  return (
    <option 
      value={value} 
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent",
        className
      )}
      {...props}
    >
      {children}
    </option>
  );
}; 
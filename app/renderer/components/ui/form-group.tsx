import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormGroupProps {
  label?: string;
  labelInfo?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormGroup({
  label,
  labelInfo,
  className,
  children,
}: FormGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </Label>
          {labelInfo && (
            <span className="text-xs text-muted-foreground">{labelInfo}</span>
          )}
        </div>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

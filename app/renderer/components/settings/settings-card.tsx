import { Switch } from "@/components/ui/switch";
import { ReactNode } from "react";

interface SettingsCardProps {
  title: string;
  helperText?: string;
  toggle?: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
  };
  children?: ReactNode;
  className?: string;
}

export default function SettingsCard({
  title,
  helperText,
  toggle,
  children,
  className = "",
}: SettingsCardProps) {
  const hasContent = !!children;
  const headerMargin = hasContent || helperText ? "mb-2" : "mb-0";
  const helperMargin = hasContent ? "mb-4" : "";

  return (
    <div className={`rounded-lg border border-border bg-card p-4 ${className}`}>
      <div className={`flex items-center justify-between ${headerMargin}`}>
        <h3 className="text-base font-semibold">{title}</h3>
        {toggle && (
          <Switch
            checked={toggle.checked}
            onCheckedChange={toggle.onCheckedChange}
            disabled={toggle.disabled}
          />
        )}
      </div>
      {helperText && (
        <p className={`text-sm text-muted-foreground ${helperMargin}`}>
          {helperText}
        </p>
      )}
      {children}
    </div>
  );
}

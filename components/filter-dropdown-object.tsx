"use client";

import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FilterDropdownObjectProps {
  label: string;
  options: any[];
  value: any;
  onChange: (value: any) => void;
  labelKey: string;
  idKey?: string;
  isEqual?: (a: any, b: any) => boolean;
  className?: string;
  disabled?: boolean;
}

export function FilterDropdownObject({
  label,
  options,
  value,
  onChange,
  labelKey,
  idKey,
  isEqual = (a, b) => a === b,
  className,
  disabled = false,
}: FilterDropdownObjectProps) {
  const getLabel = (item: any) => String(item?.[labelKey]);
  const getKey = (item: any) => (idKey ? String(item?.[idKey]) : String(item?.[labelKey]));

  const labelValue = value ? getLabel(value) : "Todos";
  const displayValue =
    !labelValue || labelValue === "Todos" ? label : `${label}: ${labelValue}`;

  return (
    <div className={cn("w-full", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between overflow-hidden"
            disabled={disabled}
            aria-label={`Filtrar por ${label?.toString()?.toLowerCase() || "filtro"}`}
          >
            <span className="truncate">{displayValue}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="overflow-y-scroll lg:max-h-[320px] w-[250px] p-1"
        >
          {options.map((option) => {
            const selected = isEqual(option, value);
            const key = getKey(option);
            return (
              <DropdownMenuItem
                key={key}
                onSelect={() => {
                  onChange(option);
                  localStorage.removeItem("selectedTab");
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm",
                  selected && "bg-accent font-medium"
                )}
              >
                <span className={cn("truncate", selected && "font-medium")}>
                  {getLabel(option)}
                </span>
                {selected && <Check className="ml-2 h-4 w-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

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

interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  className,
  disabled = false,
}: FilterDropdownProps) {
  // Mostrar el valor seleccionado o la etiqueta si es "Todos"
  const displayValue = value === "Todos" ? label : `${label}: ${value}`;

  return (
    <div className={cn("w-full", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between overflow-hidden"
            disabled={disabled}
            aria-label={`Filtrar por ${label?.toString()?.toLowerCase() || "filtro"
              }`}
          >
            <span className="truncate">{displayValue}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="overflow-y-auto max-h-[250px] w-[250px] p-1">
          {options.map((option) => {
            const isSelected = value === option;
            return (
              <DropdownMenuItem
                key={option}
                onSelect={() => {
                  onChange(option);
                  localStorage.removeItem("selectedTab");
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm",
                  isSelected && "bg-accent font-medium"
                )}
              >
                <span className={cn("truncate", isSelected && "font-medium")}>
                  {option}
                </span>
                {isSelected && <Check className="ml-2 h-4 w-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

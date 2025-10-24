"use client";

import React from "react";
import { LayoutGrid, Gift, Bell, Settings, ChevronRight } from "lucide-react";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  hasSubmenu?: boolean;
  badge?: number;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    icon: LayoutGrid,
    label: "General",
    href: "/general",
  },
  {
    icon: Gift,
    label: "Beneficios",
    href: "/beneficios",
  },
  {
    icon: Bell,
    label: "Alertas",
    href: "/alertas",
  },
  {
    icon: Settings,
    label: "Configuración",
    href: "/configuracion",
    hasSubmenu: true,
  },
];

interface SidebarProps {
  activeItem?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem = "/general",
}) => {
  return (
    <aside 
        style={{
            display:"grid",
            justifyContent:"center",
            marginTop:"100px",
        }}
        className="w-64  min-h-screen ">
      <nav 
      
          
        className="p-4 space-y-1 ">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg
                transition-colors duration-200 group
                ${
                  isActive
                    ? "bg-gray-50 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>

              {item.hasSubmenu && (
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              )}

              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>
    </aside>
  );
};

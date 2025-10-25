"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  Bell,
  BarChart2,
  FileText,
  User,
  Settings,
  ChevronDown,
  School,
  BellElectric,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/middleware/user-context";

interface NavigationMenuProps {
  onItemClick?: () => void;
}

export function NavigationMenu({ onItemClick }: NavigationMenuProps) {
  const pathname = usePathname();
  const { getFuntions } = useUser();

  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname?.startsWith(path);
  };

  const menuItems = [
   
    { name: "Dashboard", href: "/", icon: Home },
    ...(getFuntions("Alertas")
      ? [{ name: "Alertas", href: "/alertas", icon: Bell }]
      : []),
    { name: "Alumnos", href: "/alumnos", icon: Users },
    ...(getFuntions("Evaluacion Asistida")
      ? [
          {
            name: "Evaluacion Asistida",
            href: "/evaluacion-asistida",
            icon: Bell,
          },
        ]
      : []),
    { name: "Comparativo", href: "/comparativo", icon: BarChart2 },
    { name: "Informes", href: "/informes", icon: FileText },
    { name: "Perfil", href: "/perfil", icon: User },
    ...(getFuntions("Avisos")
      ? [{ name: "Avisos", href: "/avisos", icon: BellElectric }]
      : []),
     {
      name: "Beneficios",
      href: "/beneficios",
      icon: BarChart2,
    },  
  ];

  return (
    <nav className="flex-1 p-4">
      <ul className="space-y-1">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={onItemClick}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          </li>
        ))}
        <li  >
           
        </li>
        {/* Settings Submenu */}
        {getFuntions("Configuracion") ? (
          <li>
            <details
              className={cn(pathname?.startsWith("/configuracion") && "open")}
            >
              <summary
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors list-none",
                  pathname?.startsWith("/configuracion")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center">
                  <Settings className="mr-3 h-5 w-5" />
                  Configuración
                </div>
                <ChevronDown className="h-4 w-4 transition-transform ui-open:rotate-180" />
              </summary>
              <ul className="mt-1 space-y-1 pl-10">
                <li>
                  <Link
                    href="/configuracion/preguntas"
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive("/configuracion/preguntas")
                        ? "bg-primary/80 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={onItemClick}
                  >
                    <FileText className="mr-3 h-4 w-4" />
                    Preguntas
                  </Link>
                </li>
              </ul>
            </details>
          </li>
        ) : null}

        {/* Administrative Submenu */}
        {getFuntions("Administrativo") ? (
          <li>
            <details
              className={cn(pathname?.startsWith("/administrativo") && "open")}
            >
              <summary
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors list-none",
                  pathname?.startsWith("/administrativo")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center">
                  <School className="mr-3 h-5 w-5" />
                  Administrativo
                </div>
                <ChevronDown className="h-4 w-4 transition-transform ui-open:rotate-180" />
              </summary>
              <ul className="mt-1 space-y-1 pl-10">
                <li>
                  <Link
                    href="/administrativo/docentes"
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive("/administrativo/docentes")
                        ? "bg-primary/80 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={onItemClick}
                  >
                    <School className="mr-3 h-4 w-4" />
                    Docentes
                  </Link>
                </li>
              </ul>
            </details>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}

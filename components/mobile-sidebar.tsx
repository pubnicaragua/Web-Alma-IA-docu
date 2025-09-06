"use client"

import * as React from "react"
import { X, School } from "lucide-react"
import { cn } from "@/lib/utils"
import { NavigationMenu } from "./navigation-menu"
import { UserInfo } from "./user-info"

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const sidebarRef = React.useRef<HTMLDivElement>(null)

  // Cerrar el sidebar cuando se hace clic fuera de él
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Bloquear el scroll cuando el sidebar está abierto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "print:hidden fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={sidebarRef}
        className={cn(
          "print:hidden fixed inset-y-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out right-0",
          isOpen ? "transform-none" : "translate-x-full",
        )}
      >
        {/* Header del sidebar con logo y nombre */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <School className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-bold">
              <span className="text-primary">Alma</span>
              <span className="text-pink-400">IA</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido del sidebar */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-2">
            <NavigationMenu onItemClick={onClose} />
          </div>
        </div>

        {/* Footer del sidebar con información del usuario */}
        <UserInfo />
      </div>
    </>
  )
}

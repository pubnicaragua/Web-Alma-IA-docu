"use client"

import * as React from "react"
import { X } from "lucide-react"
import Image from "next/image"
import { NavigationMenu } from "./navigation-menu"
import { UserInfo } from "./user-info"

interface AndroidNavMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function AndroidNavMenu({ isOpen, onClose }: AndroidNavMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Cerrar el menú cuando se hace clic fuera de él
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Bloquear el scroll cuando el menú está abierto
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

  if (!isOpen) return null

  return (
    <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay oscuro */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Menú de navegación */}
      <div
        ref={menuRef}
        className="relative w-[85%] max-w-[320px] bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out"
        style={{
          animation: isOpen ? "scaleIn 0.2s ease-out forwards" : "none",
        }}
      >
        {/* Header del menú con logo */}
        <div className="flex items-center justify-between p-4 border-b bg-primary">
          <div className="flex items-center">
            <div className="h-8 w-auto">
              <Image src="/logotipo.png" alt="AlmaIA Logo" width={100} height={32} className="h-full w-auto" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white hover:bg-white/20 focus:outline-none"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido del menú */}
        <div className="max-h-[70vh] overflow-y-auto">
          <NavigationMenu onItemClick={onClose} />
        </div>

        {/* Footer del menú con información del usuario */}
        <UserInfo />
      </div>
    </div>
  )
}

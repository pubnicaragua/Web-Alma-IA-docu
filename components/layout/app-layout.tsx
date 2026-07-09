"use client";
import type React from "react";
import { Suspense, useState } from "react";
import { Header } from "@/components/header";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { AndroidNavMenu } from "@/components/android-nav-menu";
import { NavigationMenu } from "@/components/navigation-menu";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
  isOpen?: boolean;
}

export function AppLayout({ children, isOpen = false }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  useSessionTimeout();

  if (isOpen) {
    return <main className="flex-1 overflow-y-auto">{children}</main>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <Suspense fallback={null}>
        <Header toggleSidebar={toggleMobileMenu} />
      </Suspense>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar para escritorio (siempre visible en md y superior) */}
        <aside className="print:hidden hidden md:block w-64 bg-white border-r border-gray-200">
          <div className="h-12 border-b"></div>
          <NavigationMenu />
          {/* Eliminamos la información del usuario en la versión de escritorio */}
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-2 md:p-6">{children}</main>
      </div>

      {/* Menú para Android (solo en dispositivos móviles) */}
      {isMobile ? (
        <AndroidNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      ) : (
        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

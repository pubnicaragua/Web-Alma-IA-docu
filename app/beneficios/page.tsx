"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Gift, ShoppingBag, Settings } from "lucide-react";
import { MarcaCircular, NavigationItem } from "@/services/beneficios";
import { useOfertas } from "./hook/useOfertas";
import { OfertasCarousel } from "./components/OfertasCarousel/OfertasCarousel";
import { BrandsGrid } from "./components/BrandsGridProps/BrandsGridProps";
import { PromocionesGrid } from "./components/PromocionesGrid/PromocionesGrid";
import { Sidebar } from "@/components/beneficiosSidebar/Sidebar";
import { AppLayout } from "@/components/layout/app-layout";

const NAVIGATION_ITEMS: NavigationItem[] = [
  { icon: Home, label: "General", href: "/" },
  { icon: Gift, label: "Beneficios", href: "/beneficios" },
  { icon: ShoppingBag, label: "Amigos", href: "/amigos", badge: 3 },
  { icon: Settings, label: "Configuración", href: "/configuracion" },
];

export default function OfertasPage() {
  const router = useRouter();
  const { ofertas, promociones, isLoading, error } = useOfertas();
  const [marcas, setMarcas] = useState<MarcaCircular[]>([]);

  useEffect(() => {
    setMarcas(
      ofertas.map((oferta) => ({
        id: oferta.beneficio_id,
        nombre: oferta.nombre_beneficio,
        logoUrl: oferta.url_imagen,
      }))
    );
  }, [ofertas]);

  const handleOfertaClick = (beneficio: any) => {
    router.push(`/beneficios/${beneficio.beneficio_id}`);
  };

  const handleMarcaClick = (marca: any) => {
    console.log("Marca clickeada:", marca);
  };

  const handleFavoriteClick = (beneficioId: number) => {
    console.log("Favorito clickeado:", beneficioId);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando ofertas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error al cargar ofertas
          </h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Content */}
        <div className="space-y-8">
          <OfertasCarousel
            ofertas={ofertas}
            onOfertaClick={handleOfertaClick}
          />

          <BrandsGrid
            marcas={marcas}
            onMarcaClick={handleMarcaClick}
            onVerMas={() => console.log("Ver más marcas")}
          />

          <PromocionesGrid
            promociones={promociones}
            onPromoClick={handleOfertaClick}
            onFavoriteClick={handleFavoriteClick}
            onVerMas={() => console.log("Ver más promociones")}
          />
        </div>
      </div>
    </AppLayout>
  );
}

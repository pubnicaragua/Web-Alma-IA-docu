import React from "react";
import Image from "next/image";
import { Beneficio } from "@/services/beneficios";
 
interface CarouselCardProps {
  beneficio: Beneficio;
  onClick?: () => void;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({
  beneficio,
  onClick,
}) => {
  // Obtener el descuento máximo si existe
  const descuentoMaximo =
    beneficio.beneficios_descripcion
      ?.filter((d) => d.es_descuento)
      .map((d) => d.descuento_porcentaje)
      .sort((a, b) => b - a)[0] || 0;

  // Obtener el precio mínimo si existe
  const precioMinimo =
    beneficio.beneficios_descripcion && beneficio.beneficios_descripcion.length > 0
      ? Math.min(...beneficio.beneficios_descripcion.map((d) => d.precio))
      : null;

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105 min-w-[480px] h-[200px]"
      onClick={onClick}
    >
      <Image
        src={beneficio.url_imagen}
        alt={beneficio.nombre_beneficio}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 300px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

    
    </div>
  );
};
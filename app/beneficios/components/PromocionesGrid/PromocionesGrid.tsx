"use client";

import React from "react";
import { PromoCard } from "../Card/PromoCard";
import { Beneficio } from "@/services/beneficios";
 
interface PromocionesGridProps {
  promociones: Beneficio[];
  onPromoClick?: (beneficio: Beneficio) => void;
  onFavoriteClick?: (beneficioId: number) => void;
  onVerMas?: () => void;
}

export const PromocionesGrid: React.FC<PromocionesGridProps> = ({
  promociones,
  onPromoClick,
  onFavoriteClick,
  onVerMas,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          ¡Promociones para ti!
        </h2>
        {onVerMas && (
          <button
            onClick={onVerMas}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            Ver más
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {promociones.map((promo, index) => (
          <PromoCard
            key={promo.beneficio_id}
            beneficio={promo}
            isNew={index === 0}
            onClick={() => onPromoClick?.(promo)}
            onFavoriteClick={() => onFavoriteClick?.(promo.beneficio_id)}
          />
        ))}
      </div>
    </div>
  );
};
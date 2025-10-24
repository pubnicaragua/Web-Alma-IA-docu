"use client";

import React, { useRef } from "react";
 
import { ChevronRight } from "lucide-react";
import { MarcaCircular } from "@/services/beneficios";
import { BrandCircle } from "../BrandCircle/BrandCircle";

interface BrandsGridProps {
  marcas: MarcaCircular[];
  onMarcaClick?: (marca: MarcaCircular) => void;
  onVerMas?: () => void;
}

export const BrandsGrid: React.FC<BrandsGridProps> = ({
  marcas,
  onMarcaClick,
  onVerMas,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {marcas.map((marca) => (
          <BrandCircle
            key={marca.id}
            marca={marca}
            onClick={() => onMarcaClick?.(marca)}
          />
        ))}

        {onVerMas && (
          <div
            className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
            onClick={onVerMas}
          >
            <div className="w-16 h-16 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center transition-colors">
              <ChevronRight className="w-6 h-6 text-gray-900" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Ver más</span>
          </div>
        )}
      </div>
    </div>
  );
};
"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Beneficio } from "@/services/beneficios";
import { CarouselCard } from "../CarouselCard/CarouselCard";

interface OfertasCarouselProps {
  ofertas: Beneficio[];
  onOfertaClick?: (beneficio: Beneficio) => void;
}

export const OfertasCarousel: React.FC<OfertasCarouselProps> = ({
  ofertas,
  onOfertaClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNavigation, setShowNavigation] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Detectar si hay overflow (contenido supera el ancho visible)
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        const hasOverflow =
          scrollContainerRef.current.scrollWidth >
          scrollContainerRef.current.clientWidth;
        setShowNavigation(hasOverflow);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [ofertas]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 320;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 420;
      scrollContainerRef.current.scrollTo({
        left: cardWidth * index,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % ofertas.length;
    scrollToIndex(nextIndex);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Ofertas especiales</h2>
        
        {/* Solo mostrar botón si hay overflow */}
        {showNavigation && (
          <button
            onClick={handleNext}
            className="bg-yellow-400 hover:bg-yellow-500 rounded-full p-2 transition-colors"
            aria-label="Siguiente oferta"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {ofertas.map((oferta) => (
          <div key={oferta.beneficio_id} className="snap-start">
            <CarouselCard
              beneficio={oferta}
              onClick={() => onOfertaClick?.(oferta)}
            />
          </div>
        ))}
      </div>

      {/* Solo mostrar dots si hay overflow */}
      {showNavigation && (
        <div className="flex justify-center gap-2">
          {ofertas.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-gray-900"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Ir a oferta ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
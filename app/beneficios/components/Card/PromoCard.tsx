import React from "react";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { Beneficio } from "@/services/beneficios";

interface PromoCardProps {
  beneficio: Beneficio;
  isNew?: boolean;
  onFavoriteClick?: () => void;
  onClick?: () => void;
}

export const PromoCard: React.FC<PromoCardProps> = ({
  beneficio,
  isNew = false,
  onFavoriteClick,
  onClick,
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteClick?.();
  };

  const primeraDescripcion = beneficio.beneficios_descripcion?.[0];
  const tieneStock =
    beneficio.beneficios_descripcion?.some((d) => d.stock > 0) || false;

  const precioOriginal = primeraDescripcion?.precio || 0;
  const descuento = primeraDescripcion?.descuento_porcentaje || 0;
  const precioFinal =
    descuento > 0
      ? precioOriginal - (precioOriginal * descuento) / 100
      : precioOriginal;

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-xl bg-white w-full"
      onClick={onClick}
    >
      {/* Botón de favorito */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 z-10 hover:bg-white transition-all shadow-md hover:shadow-lg"
        aria-label="Agregar a favoritos"
      >
        <Heart className="w-5 h-5 text-gray-700 hover:text-red-500 transition-colors" />
      </button>

      {/* Imagen cuadrada */}
      <div className="relative w-full aspect-square">
        {beneficio.url_imagen ? (
          <Image
            src={beneficio.url_imagen}
            alt={beneficio.nombre_beneficio}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 rounded-lg"></div>
        )}

        {/* Badge "Nuevo" */}
        {isNew && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-lg">
            Nuevo
          </div>
        )}
      </div>

      {descuento > 0 && (
        <div
          style={{
            width: 80,
            marginLeft: 10,
          }}
          className="  bg-yellow-400 text-gray-900 text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg  "
        >
          -{descuento}%
        </div>
      )}
      {!tieneStock && (
        <div
          style={{
            width: 80,
            marginLeft: 10,
          }}
          className="  mt-4  bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-lg"
        >
          Agotado
        </div>
      )}
      {/* Contenido debajo de la imagen */}
      <div className="p-4 space-y-3">
        {/* Precio */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">
            $ {Math.round(precioFinal)}
          </span>
          {descuento > 0 && (
            <span className="text-sm text-gray-500 line-through">
              $ {precioOriginal}
            </span>
          )}
        </div>

        {/* Descripción del beneficio */}
        <p className="text-sm text-gray-700 line-clamp-2 min-h-[2.5rem]">
          {primeraDescripcion?.descripcion || beneficio.nombre_beneficio}
        </p>

        {/* Botón de compra */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          disabled={!tieneStock}
          className="w-full flex items-center justify-start gap-2   text-dark font-medium py-2.5 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{tieneStock ? "Comprar ahora" : "Sin stock"}</span>
        </button>
      </div>
    </div>
  );
};

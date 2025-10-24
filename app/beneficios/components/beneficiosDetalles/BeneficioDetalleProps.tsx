// app/beneficios/components/BeneficioDetalle/BeneficioDetalle.tsx
"use client";

import React from "react";
import Image from "next/image";
import {
  ShoppingCart,
  ExternalLink,
  Calendar,
  Package,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Beneficio } from "@/services/beneficios";

interface BeneficioDetalleProps {
  beneficio: Beneficio;
}

export const BeneficioDetalle: React.FC<BeneficioDetalleProps> = ({
  beneficio,
}) => {
  const router = useRouter();
  const primeraDescripcion = beneficio.beneficios_descripcion?.[0];

  const precioOriginal = primeraDescripcion?.precio || 0;
  const descuento = primeraDescripcion?.descuento_porcentaje || 0;
  const precioFinal =
    descuento > 0
      ? precioOriginal - (precioOriginal * descuento) / 100
      : precioOriginal;

  const tieneStock = primeraDescripcion?.stock && primeraDescripcion.stock > 0;

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const calcularDiasRestantes = (fecha: string) => {
    const dias = Math.ceil(
      (new Date(fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return dias > 0 ? dias : 0;
  };

  const diasRestantes = primeraDescripcion?.vigencia_promo
    ? calcularDiasRestantes(primeraDescripcion.vigencia_promo)
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <div 
        style={{
           
          position:"relative"
        }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda - Imagen */}
        <div className="space-y-4">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white  ">
            <Image
              src={beneficio.url_imagen}
              alt={beneficio.nombre_beneficio}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Columna derecha - Información */}
        <div className="space-y-6">
          {/* Encabezado con acción rápida */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">
                  Compra ahora
                </span>
                <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center">
                  <span className="text-xs">?</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Vendido por {beneficio.nombre_beneficio.split(" ")[0]}
              </p>
            </div>

            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Más promos
              <span>›</span>
            </button>
          </div>

          {/* Título */}
          <h1 className="text-1xl font-bold text-gray-900 leading-tight">
            {beneficio.nombre_beneficio}
          </h1>

          {/* Precio */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-4xl font-bold text-gray-900">
              $ {Math.round(precioFinal)}
            </span>
            {descuento > 0 && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  $ {precioOriginal}
                </span>
                <span className="bg-yellow-400 text-gray-900 font-bold px-3 py-1 rounded-lg">
                  -{descuento}%
                </span>
                <span className="text-sm text-gray-600">
                  Ahorras $ {Math.round(precioOriginal - precioFinal)}
                </span>
              </>
            )}
          </div>

          {/* Botón principal */}
          <button
            style={{
              bottom:0,
              position:'absolute',
              width:400,
              height:60,
              background:"#FFCB3C",
              borderRadius:50,
            }}
            onClick={() => {
              if (primeraDescripcion?.url_web) {
                window.open(primeraDescripcion.url_web, "_blank");
              }
            }}
            className="w-full bg-yellow-400    text-gray-900 font-bold py-4 px-6 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg"
          >
            <ExternalLink className="w-5 h-5" />
            <span>
              Continuar en la página web
            </span>
          </button>
        </div>
      </div>

      <div className="mt-10">
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">
            Descripción de la oferta
          </h2>
          <p className="text-gray-700 leading-relaxed mt-10">
            {primeraDescripcion?.descripcion || beneficio.nombre_beneficio}
          </p>
          {primeraDescripcion?.descripcion &&
            primeraDescripcion.descripcion.length > 150 && (
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Ver más
              </button>
            )}
        </div>

        {/* Información de vigencia y stock */}
        <div className="  border-gray-200 pt-6 space-y-4">
          {primeraDescripcion?.vigencia_promo && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">
                  Vigencia de la promo:
                </p>
                <p className="text-gray-700">Del 21 al 22 de agosto de 2025</p>
              </div>
            </div>
          )}

          {primeraDescripcion?.vigencia_canje && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">
                  Válido para canjear hasta:
                </p>
                <p className="text-gray-700">
                  {formatearFecha(primeraDescripcion.vigencia_canje)}
                </p>
              </div>
            </div>
          )}

          {primeraDescripcion?.stock !== undefined && (
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Stock:</p>
                <p className="text-gray-700">
                  {primeraDescripcion.stock.toLocaleString()} promociones
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

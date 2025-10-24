// app/beneficios/show/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Beneficio,
  getBeneficioDetalle,
  getBeneficiosID,
} from "@/services/beneficios";
import { BeneficioDetalle } from "../components/beneficiosDetalles/BeneficioDetalleProps";

export default function ShowBeneficioPage() {
  const params = useParams();
  const [beneficio, setBeneficio] = useState<Beneficio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBeneficio = async () => {
      try {
        setIsLoading(true);
        // Llama a tu API
        const response = await getBeneficiosID(Number(params.id));

        setBeneficio(response);
        console.log(response);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error desconocido"));
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchBeneficio();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando beneficio...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !beneficio) {
    return (
      <AppLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Beneficio no encontrado
            </h2>
            <p className="text-gray-600 mb-4">{error?.message}</p>

            <a
              href="/beneficios"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Volver a beneficios
            </a>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <BeneficioDetalle beneficio={beneficio} />
    </AppLayout>
  );
}

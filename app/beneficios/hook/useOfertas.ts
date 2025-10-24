"use client";

import { Beneficio, getBeneficios, MarcaCircular } from "@/services/beneficios";
import { useState, useEffect } from "react";
import { BENEFICIOS_DUMMY } from "../dummy/BENEFICIOS_DUMMY";
import axios from "axios";

interface UseOfertasReturn {
  ofertas: Beneficio[];
  promociones: Beneficio[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  marcas: MarcaCircular[];
}

export const useOfertas = (): UseOfertasReturn => {
  const [ofertas, setOfertas] = useState<Beneficio[] | null>([]);
  const [promociones, setPromociones] = useState<Beneficio[] | null>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [marcas, setMarcas] = useState<MarcaCircular[]>([]);
  const fetchOfertas = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getBeneficios();
      if (!data) return;
      setOfertas(data);
      setPromociones(data);
      setIsLoading(false);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error desconocido"));
      setIsLoading(false);
    }
  };

  const getMarcas = () => {
    const marcas = ofertas.map((ofertas) => {
      return {
        id: ofertas.beneficio_id,
        nombre: ofertas.nombre_beneficio,
        logoUrl: ofertas.url_imagen,
      };
    });

    setMarcas(marcas);
    console.log(marcas);
  };

  useEffect(() => {
    fetchOfertas();
    getMarcas();
  }, []);

  return {
    ofertas,
    promociones,
    isLoading,
    error,
    refetch: fetchOfertas,
    marcas,
  };
};

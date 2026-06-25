import axios from "axios";

// Interfaces del backend (coinciden con la API)
export interface BeneficioDescripcion {
  descripcion_beneficios_id: number;
  descripcion: string;
  precio: number;
  es_descuento: boolean;
  descuento_porcentaje: number;
  stock: number;
  beneficio_id: number;
  vigencia_canje: string;
  vigencia_promo: string;
  url_web: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface Beneficio {
  beneficio_id: number;
  url_imagen: string;
  nombre_beneficio: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  beneficios_descripcion?: BeneficioDescripcion[];
}

// Esta interfaz parece ser para un endpoint específico de detalle
export interface BeneficioHttp {
  beneficios: Beneficio;
  beneficios_descripcio: BeneficioDescripcion[];
}

// Interfaces para la UI
export interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
}

export interface MarcaCircular {
  id: number;
  nombre: string;
  logoUrl: string;
}

const API_BASE_URL = "/api/proxy";

export const getBeneficios = async (): Promise<Beneficio[] | null> => {
  console.log("hola", API_BASE_URL);

  try {
    const response = await axios.get(`${API_BASE_URL}/beneficios/todos`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = response.data as Beneficio[];

    alert("completado");
    return data;
  } catch (error) {
    console.error("Error en getBeneficios:", error);
    return null;
  }
};

export const getBeneficioDetalle = async (
  beneficioId: number
): Promise<BeneficioHttp | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/beneficios/${beneficioId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Error al obtener el detalle del beneficio");
    }
    const data = (await response.json()) as BeneficioHttp;
    return data;
  } catch (error) {
    console.error("Error en getBeneficioDetalle:", error);
    throw error;
  }
};

export const getBeneficiosID = async (
  id: number
): Promise<Beneficio | null> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/beneficios/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = response.data[0] as Beneficio;
    return data;
  } catch (error) {
    console.error("Error en getBeneficiosID:", error);
    return null;
  }
};

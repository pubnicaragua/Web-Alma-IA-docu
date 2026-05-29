import type { StudentGeneral } from "@/types/student";
import { Mail, Phone, User } from "lucide-react";

interface PropTypes {
    alumno: StudentGeneral
}

export function formatNullableDate(value: Date | string | null | undefined) {
    if (!value) return "No disponible";

    const parts = value.toString().split("T")[0].split("-");
    if (parts.length !== 3) return "No disponible";

    return parts.reverse().join("/");
}

export function StudentDetailInfoGeneral({ alumno }: Readonly<PropTypes>) {
    const personas = alumno.personas;
    const genero = personas?.generos?.nombre || "No disponible";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8" >
            {/* Datos personales */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                    <User className="mr-2 h-5 w-5 text-blue-500" />
                    Datos personales
                </h3>
                <div className="space-y-3">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">
                            ID del alumno:
                        </span>
                        <span className="text-gray-800 font-medium">
                            {alumno.alumno_id ?? "No disponible"}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">
                            Tipo de documento:
                        </span>
                        <span className="text-gray-800 font-medium">
                            {personas?.tipo_documento || "No disponible"}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">
                            Numero de documento:
                        </span>
                        <span className="text-gray-800 font-medium">
                            {personas?.numero_documento || "No disponible"}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">
                            Fecha de nacimiento:
                        </span>
                        <span className="text-gray-800 font-medium">
                            {formatNullableDate(personas?.fecha_nacimiento)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Genero:</span>
                        <span className="text-gray-800 font-medium">
                            {genero}
                        </span>
                    </div>
                </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                    <Mail className="mr-2 h-5 w-5 text-blue-500" />
                    Información de contacto
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <Phone className="h-5 w-5 text-blue-500 mr-3" />
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">
                                Teléfono principal:
                            </span>
                            <span className="text-gray-800 font-medium">
                                {alumno.telefono_contacto1 || "No disponible"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <Phone className="h-5 w-5 text-blue-500 mr-3" />
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">
                                Teléfono secundario:
                            </span>
                            <span className="text-gray-800 font-medium">
                                {alumno.telefono_contacto2 || "No disponible"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <Mail className="h-5 w-5 text-blue-500 mr-3" />
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Correo:</span>
                            <span className="text-gray-800 font-medium">
                                {alumno.email || "No disponible"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

import type { StudentRepresentative } from "@/types/student";
import { Users } from "lucide-react";


interface PropTypes {
    apoderados: StudentRepresentative[]
}

export function StudentDetailInfoRepresentatives({ apoderados }: Readonly<PropTypes>) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-500" />
                Apoderados
            </h3>
            {apoderados.length ? (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                        <thead>
                            <tr className="bg-blue-300">
                                <th className="px-4 py-3 text-left font-medium text-white">
                                    Nombre
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-white">
                                    Tipo
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-white">
                                    Observaciones
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-white">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {apoderados.map((apoderado, index) => {
                                const person = apoderado.apoderados?.personas;
                                const name = [person?.nombres, person?.apellidos]
                                    .filter(Boolean)
                                    .join(" ") || "No disponible";
                                const type = apoderado.tipo_apoderado || "No disponible";
                                const status = apoderado.estado_usuario || "No disponible";

                                return (
                                    <tr
                                        key={index}
                                        className="border-b-2 border-gray-100 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-sm font-medium">
                                            {name}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${type === "Padre" ||
                                                    type === "Madre"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-blue-100 text-blue-800"
                                                    }`}
                                            >
                                                {type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {apoderado.observaciones || "No disponible"}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${status === "activo"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-blue-500 rounded-md p-2">
                    <h1 className="font-medium text-white">
                        Apoderados no disponibles
                    </h1>
                </div>
            )}
        </div>
    )
}



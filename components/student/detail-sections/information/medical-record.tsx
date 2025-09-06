import type { StudentMedicalRecord } from "@/types/student";
import { AlertTriangle } from "lucide-react";

interface PropTypes {
    ficha: StudentMedicalRecord
}

export function StudentDetailInfoMedicalRecord({ ficha }: Readonly<PropTypes>) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-blue-500" />
                Antecedentes clínicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-2">
                        Historial médico
                    </h4>
                    <p className="text-gray-600">
                        {ficha?.historial_medico.trim() || "No disponible"}
                    </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-2">
                        Alergias conocidas
                    </h4>
                    <p className="text-gray-600">
                        {ficha?.alergias.trim() || "No disponible"}
                    </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-2">
                        Condiciones médicas actuales
                    </h4>
                    {ficha?.condiciones_medicas_relevantes.trim() ||
                        "No disponible"}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-2">
                        Medicamentos actuales
                    </h4>
                    <p className="text-gray-600">
                        {ficha?.medicamentos_actuales.trim() ||
                            "No disponible"}
                    </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-2">
                        Diagnósticos previos
                    </h4>
                    <p className="text-gray-600">
                        {ficha?.diagnosticos_previos.trim() ||
                            "No disponible"}
                    </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 md:col-span-2">
                    <h4 className="font-medium text-gray-700 mb-2">
                        Terapias y tratamientos en curso
                    </h4>
                    <p className="text-gray-600">
                        {ficha?.terapias_tratamiento_curso.trim() ||
                            "No disponible"}
                    </p>
                </div>
            </div>
        </div>
    )
}
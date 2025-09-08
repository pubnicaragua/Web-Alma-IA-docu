import { useCallback } from "react";
import { useAxios } from "@/hooks/use-axios";
import { StudentDetailAddEventModal } from "./add-modal";
import { StudentDetailEventsTable } from "./table";
import type { AlumnoEventoItem } from "@/types/assisted-evaluation";

interface PropTypes {
    alumno_id: number;
    curso_id: number;
}

export function StudentDetailEvents({ alumno_id, curso_id }: Readonly<PropTypes>) {

    const fetchEvents = useCallback(async () => {
        if (!alumno_id) return;
        return window.axios.get(`/evaluacion-asistida/evento_informacion_evento`, {
            params: {
                alumno_id
            }
        });
    }, [alumno_id]);

    const axios = useAxios<AlumnoEventoItem[]>(fetchEvents, [alumno_id]);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Registro de eventos o sucesos
                </h3>
                <StudentDetailAddEventModal
                    alumno_id={alumno_id}
                    curso_id={curso_id}
                    refetch={() => axios.refetch()}
                />
            </div>
            <StudentDetailEventsTable
                alumnos={axios.data ?? []}
                loading={axios.loading}
            />
        </div>
    );
}
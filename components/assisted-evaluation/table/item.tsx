import { TableCell, TableRow } from "@/components/ui/table";
import { AssitedEvTableCheckbox } from "./checkbox";
import { AssitedEvTableModal } from "./modal";
import { AlumnoFormatted, EventoRespuesta } from "@/types/assisted-evaluation";
import { useMemo } from "react";
import { format } from "date-fns";

interface PropTypes {
    alumno: AlumnoFormatted;
    opciones: EventoRespuesta[];
    preguntaId: number;
    cursoId: number;
    fecha: string;
    handleCheck: (alumnoId: number, opcion: number | null) => void;
    handleUpdate: (alumnoId: number, observacion: string, hora: string) => void;
}

export function AssitedEvaluationTableItem({
    alumno,
    opciones,
    preguntaId,
    cursoId,
    fecha,
    handleCheck,
    handleUpdate
}: Readonly<PropTypes>) {

    const isDisable = useMemo(() => fecha != format(new Date(), 'yyyy-MM-dd'), [fecha]);

    return (
        <TableRow>
            <TableCell className="text-center">
                {alumno.alumno_id}
            </TableCell>
            <TableCell className="text-left">
                {alumno.alumno_nombre}
            </TableCell>
            {opciones.map(({ id: valor }) => (
                <TableCell key={valor} className="pl-0">
                    <AssitedEvTableCheckbox
                        alumno_id={alumno.alumno_id}
                        preguntaId={preguntaId}
                        cursoId={cursoId}
                        fecha={fecha}
                        emocion_marcada={alumno.respuesta_id}
                        opcion_valor={valor}
                        handleCheck={handleCheck}
                    />
                </TableCell>
            ))}
            <TableCell className="print:hidden">
                <AssitedEvTableModal
                    respuesta_id={alumno.respuesta_id}
                    alumno_id={alumno.alumno_id}
                    observacion={alumno.observacion}
                    hora={alumno.hora}
                    pregunta_id={preguntaId}
                    curso_id={cursoId}
                    fecha={fecha}
                    isDisabled={isDisable}
                    handleUpdate={handleUpdate}
                />
            </TableCell>
        </TableRow>
    )

}

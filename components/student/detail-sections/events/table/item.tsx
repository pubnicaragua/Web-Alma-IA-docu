import { TableRow, TableCell } from "@/components/ui/table";
import { AlumnoEventoItem } from "@/types/assisted-evaluation";

interface PropTypes {
    evento: AlumnoEventoItem
}

export function StudentDetailEventTableItem({ evento }: Readonly<PropTypes>) {
    return (
        <TableRow>
            <TableCell className="text-center">{evento.fecha}</TableCell>
            <TableCell className="text-center">{evento.hora || '-'}</TableCell>
            <TableCell className="text-center">{evento.personas?.nombres + ' ' + evento.personas?.apellidos || '-'}</TableCell>
            <TableCell className="text-center">
                <span>{evento?.eventos_preguntas?.evento}: {" "}</span>
                <span>{evento.evento_respuestas_posibles.respuesta_texto}</span>
            </TableCell>
            <TableCell className="text-center">{evento.observacion || '-'}</TableCell>
        </TableRow>
    )
}
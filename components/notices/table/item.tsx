import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { NoticeModalEdit } from "../modals/edit";
import { NoticeModalView } from "../modals/view";
import { NoticeModalDelete } from "../modals/delete";

const NOTICE_STATUS_COLORS = {
    Completado: 'border-green-500 text-green-500',
    Incompleto: 'border-red-500 text-red-500',
    Pendiente: 'border-yellow-500 text-yellow-500',
}

export function NoticeTableItem({ notice }: any) {
    return (
        <TableRow>
            <TableCell>{notice.aviso_id}</TableCell>
            <TableCell>
                <div>
                    <span className="font-medium">{notice.aviso_titulo}</span>
                    {notice.aviso_ruta_archivo ? (
                        <div className="mt-1">
                            <a
                                href={notice.aviso_ruta_archivo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs text-blue-600 hover:underline gap-1"
                            >
                                📎 Ver archivo
                            </a>
                        </div>
                    ) : null}
                </div>
            </TableCell>
            <TableCell>{notice.tipo_aviso}</TableCell>
            <TableCell>
                <span className="capitalize">
                    {notice.destinatario_tipo}
                </span>
            </TableCell>
            <TableCell>
                <div className="flex flex-wrap gap-1">
                    {notice.palabras_clave.length ? (
                        <>
                            {notice.palabras_clave.map((word: string) => (
                                <Badge key={word}>{word}</Badge>
                            ))}
                        </>
                    ) : (
                        <Badge variant="destructive">Sin Palabras</Badge>
                    )}
                </div>
            </TableCell>
            <TableCell>
                {format(notice.aviso_fecha_programacion, 'dd-MM-yyyy HH:mm a')}
            </TableCell>
            <TableCell className="text-center">
                <Badge variant={'outline'} className={NOTICE_STATUS_COLORS[notice.estado_envio as keyof typeof NOTICE_STATUS_COLORS]}>
                    {notice.estado_envio}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="flex justify-center items-center gap-2">
                    <NoticeModalEdit notice={notice} />
                    <NoticeModalView avisoId={notice.aviso_id} />
                    <NoticeModalDelete notice={notice} />
                </div>
            </TableCell>
        </TableRow>
    )
}
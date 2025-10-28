import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { NoticeModalEdit } from "../modals/edit";
import { NoticeModalView } from "../modals/view";

const NOTICE_STATUS_COLORS = {
    completed: 'border-green-500 text-green-500',
    incomplete: 'border-red-500 text-red-500',
    pending: 'border-yellow-500 text-yellow-500',
}

export function NoticeTableItem({ notice }: any) {
    return (
        <TableRow>
            <TableCell>{notice.aviso_id}</TableCell>
            <TableCell>{notice.aviso_titulo}</TableCell>
            <TableCell>{notice.tipo_aviso}</TableCell>
            <TableCell>
                <span className="capitalize">
                    {notice.destinatario_tipo}
                </span>
            </TableCell>
            <TableCell>
                {Boolean(notice.palabras_clave.length) && (
                    <div className="flex flex-wrap gap-1">
                        {notice.palabras_clave.map((word: string) => (
                            <Badge key={word}>{word}</Badge>
                        ))}
                    </div>
                )}
            </TableCell>
            <TableCell>
                {format(notice.aviso_fecha_programacion, 'dd-MM-yyyy HH:mm a')}
            </TableCell>
            <TableCell className="text-center">
                <Badge variant={'outline'} className={NOTICE_STATUS_COLORS[notice.estado_slug as keyof typeof NOTICE_STATUS_COLORS]}>
                    {notice.estado}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="flex justify-center items-center gap-2">
                    <NoticeModalEdit notice={notice} />
                    <NoticeModalView avisoId={notice.aviso_id} />
                </div>
            </TableCell>
        </TableRow>
    )
}
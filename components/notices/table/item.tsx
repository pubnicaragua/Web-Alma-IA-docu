import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
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
            <TableCell>{notice.id}</TableCell>
            <TableCell>{notice.titulo}</TableCell>
            <TableCell>{notice.tipo_id}</TableCell>
            <TableCell>
                <span className="capitalize">
                    {notice.destinatario_tipo}
                </span>
            </TableCell>
            <TableCell>
                {notice.palabras_clave.length && (
                    <div className="flex flex-wrap gap-1">
                        {notice.palabras_clave.map((word: string) => (
                            <Badge key={word}>{word}</Badge>
                        ))}
                    </div>
                )}
            </TableCell>
            <TableCell>{notice.fecha_programacion}</TableCell>
            <TableCell className="text-center">
                <Badge variant={'outline'} className={NOTICE_STATUS_COLORS[notice.estado_slug as keyof typeof NOTICE_STATUS_COLORS]}>
                    {notice.estado}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="flex justify-center items-center gap-2">
                    <NoticeModalEdit notice={notice} />
                    <NoticeModalView notice={notice} />
                </div>
            </TableCell>
        </TableRow>
    )
}
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { NoticeTableItem } from "./item";
import { usePaginationSR } from "@/hooks/use-pagination-sr";

interface PropTypes {
    filters: any;
}

const dummy = [
    {
        id: 1,
        titulo: 'Aviso Prueba',
        tipo_id: 'Colegio',
        destinatario_tipo: 'alumno',
        palabras_clave: ['Seguridad', 'Privacidad'],
        fecha_programacion: '2025-01-01 09:00am',
        estado: 'Envio Completado',
        estado_slug: 'completed'
    },
    {
        id: 2,
        titulo: 'Aviso Prueba',
        tipo_id: 'Colegio',
        destinatario_tipo: 'alumno',
        palabras_clave: ['Seguridad', 'Privacidad'],
        fecha_programacion: '2025-01-01 09:00am',
        estado: 'Envio Incompleto',
        estado_slug: 'incomplete'
    },
    {
        id: 3,
        titulo: 'Aviso Prueba',
        tipo_id: 'Colegio',
        destinatario_tipo: 'alumno',
        palabras_clave: ['Seguridad', 'Privacidad'],
        fecha_programacion: '2025-01-01 09:00am',
        estado: 'Envio Pendiente',
        estado_slug: 'pending'
    },
    {
        id: 4,
        titulo: 'Aviso Prueba',
        tipo_id: 'Colegio',
        destinatario_tipo: 'alumno',
        palabras_clave: ['Seguridad', 'Privacidad'],
        fecha_programacion: '2025-01-01 09:00am',
        estado: 'Envio Completado',
        estado_slug: 'completed'
    }
]

export function NoticeTable({ filters }: Readonly<PropTypes>) {

    const pagination = usePaginationSR({
        route: "/avisosApp/avisos/listar",
        filters: filters,
        perPage: 10
    });

    console.log(pagination);

    return (
        <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#89C2F8]">
                        <TableRow>
                            <TableHead className="text-white">ID</TableHead>
                            <TableHead className="text-white">Título</TableHead>
                            <TableHead className="text-white">Tipo Aviso</TableHead>
                            <TableHead className="text-white">Tipo Persona</TableHead>
                            <TableHead className="text-white">Palabras Clave</TableHead>
                            <TableHead className="text-white">Fecha Programación</TableHead>
                            <TableHead className="text-white text-center">Estado</TableHead>
                            <TableHead className="text-white text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dummy.map((notice) => (
                            <NoticeTableItem key={notice.id} notice={notice} />
                        ))}
                    </TableBody>
                </Table>
            </div>

        </div>
    )
}
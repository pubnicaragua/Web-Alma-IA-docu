import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AlumnoEventoItem } from "@/types/assisted-evaluation";
import { StudentDetailEventTableItem } from "./item";
import { TriangleAlert } from "lucide-react";

interface PropTypes {
    alumnos: AlumnoEventoItem[];
    loading: boolean;
}

export function StudentDetailEventsTable({
    alumnos = [],
    loading
}: Readonly<PropTypes>) {
    return (
        <div className="rounded-lg overflow-hidden">
            <Table>
                <TableHeader className="bg-[#89C2F8]">
                    <TableRow className="h-[60px]">
                        <TableHead className="text-white text-center">Fecha</TableHead>
                        <TableHead className="text-white text-center">Hora</TableHead>
                        <TableHead className="text-white text-center">Usuario Responsable</TableHead>
                        <TableHead className="w-[30%] text-white text-left">Tipo Evento</TableHead>
                        <TableHead className="w-[30%] text-white text-left">Observaciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && (
                        <TableRow>
                            <TableCell colSpan={100}>
                                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Cargando eventos...</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    {!loading && alumnos && alumnos.length > 0 && (
                        <>
                            {alumnos.map((evento, index) => (
                                <StudentDetailEventTableItem
                                    key={index}
                                    evento={evento}
                                />
                            ))}
                        </>
                    )}
                    {!loading && alumnos && alumnos.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={100}>
                                <div className="flex flex-col items-center p-8 text-center">
                                    <TriangleAlert />
                                    <p className="text-gray-600">
                                        No se han encontrado eventos
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

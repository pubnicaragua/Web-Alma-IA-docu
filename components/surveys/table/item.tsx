import { format } from "date-fns";
import Link from 'next/link';
import { ChartNetwork } from 'lucide-react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SurveyModalEdit } from "../modals/edit";
import { SurveyModalView } from "../modals/view";
import { SurveyModalDelete } from "../modals/delete";
import { SurveyModalResponses } from "../modals/responses";

export function SurveyTableItem({ survey }: any) {
    return (
        <TableRow>
            <TableCell>{survey.encuesta_id}</TableCell>
            <TableCell>{survey.encuesta_nombre}</TableCell>
            <TableCell className="capitalize">{survey?.tipo_encuesta_nombre}</TableCell>
            <TableCell className="capitalize">{survey?.encuesta_estado_nombre}</TableCell>
            <TableCell className="capitalize">{survey?.programacion?.frecuencia}</TableCell>
            <TableCell>
                {survey?.programacion && (
                    <>
                        {format(survey?.programacion?.fecha_inicio, 'dd-MM-yyyy')}
                        {" - "}
                        {format(survey?.programacion?.fecha_fin, 'dd-MM-yyyy')}
                    </>
                )}
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center items-center">
                    <SurveyModalView survey={survey} />
                </div>
            </TableCell>
            <TableCell>
                <div className="flex justify-center items-center gap-1">
                    {survey.tipo_encuesta_id == 1 && (
                        <Link href={`/encuestas/${survey.encuesta_id}/sociograma`}>
                            <Button size={'sm'} variant={'link'} title="Ver Sociograma">
                                <ChartNetwork className="text-purple-600 hover:text-purple-800 h-5 w-5 transition-transform duration-200 hover:scale-125" />
                            </Button>
                        </Link>
                    )}
                    <SurveyModalResponses survey={survey} />
                    <SurveyModalEdit survey={survey} />
                    <SurveyModalDelete survey={survey} />
                </div>
            </TableCell>
        </TableRow>
    )
}
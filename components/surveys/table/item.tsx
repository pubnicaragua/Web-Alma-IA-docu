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
            <TableCell>
                <div className="flex content-center">
                    <SurveyModalView survey={survey} />
                    {survey.tipo_encuesta_id == 1 && (
                        <Link href={`/encuestas/${survey.encuesta_id}/sociograma`}>
                            <Button size={'sm'} variant={'link'}>
                                <ChartNetwork />
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
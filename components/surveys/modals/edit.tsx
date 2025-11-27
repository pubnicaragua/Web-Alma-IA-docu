import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/lib/modal-utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { useUser } from "@/middleware/user-context";
import { useRefresh } from "@/hooks/use-refresh";
import { SurveyForm } from "../form";

export function SurveyModalEdit({ survey }: any) {

    const { toggleRefresh } = useRefresh();
    const { isOpen, onOpen, onClose } = useModal();
    const { selectedSchoolId } = useUser();

    return (
        <>
            <Button size={'sm'} variant={'link'} onClick={onOpen}>
                <Pencil />
            </Button>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
                        <div className="w-full flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold">
                                Edición de Encuesto
                            </DialogTitle>
                            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground flex items-center justify-center">
                                <X className="h-6 w-6" />
                                <span className="sr-only">Cerrar</span>
                            </DialogClose>
                        </div>
                    </DialogHeader>
                    <SurveyForm
                        encuestaId={survey.encuesta_id}
                        metaForm={{
                            curso_id: String(survey?.destinatarios[0]?.curso_id) || '',
                            grado_id: String(survey?.destinatarios[0]?.grado_id) || '',
                            colegio_id: (String(survey?.destinatarios[0]?.colegio_id)) || (selectedSchoolId || '')
                        }}
                        initialData={{
                            general: {
                                titulo: survey.encuesta_nombre,
                                descripcion: survey.encuesta_descripcion,
                                concepto_id: survey.concepto_asociado_id,
                                tipo_id: survey.tipo_encuesta_id,
                                obligatoria: survey.encuesta_obligatoria ? 'SI' : 'NO',
                                estado: survey?.encuesta_estado_id,
                                plantilla_id: 0
                            },
                            preguntas: survey.preguntas.map((pregunta: any) => ({
                                pregunta_encuesta_id: pregunta.pregunta_id || null,
                                titulo: pregunta?.titulo,
                                tipo_id: pregunta.tipo_id,
                                posibles_respuestas: pregunta?.posibles_respuestas?.map((respuestas: any) => ({
                                    titulo: respuestas?.titulo ?? '',
                                    peso: respuestas?.peso ?? 0
                                })) ?? []
                            })),
                            destinatarios: {
                                tipo_id: survey?.destinatarios[0]?.tipo_destinatario_id ?? '',
                                destinatario_tipo: String(survey?.destinatarios[0]?.objetivo_envio_id) || '',
                                destinatarios: survey?.destinatarios.map((destinatario: any) => destinatario?.destinatario_id) ?? [],
                            },
                            programacion: {
                                fecha_inicio: survey?.programacion?.fecha_inicio ?? '',
                                fecha_fin: survey?.programacion?.fecha_fin ?? '',
                                hora_ejecucion: survey?.programacion?.hora_ejecucion ?? '',
                                frecuencia: survey?.programacion?.frecuencia ?? '',
                                valores_frecuencia: survey?.programacion?.valores_frecuencia?.map((value: string | number) => typeof value == 'number' ? String(value) : value) ?? []
                            }
                        }}
                        postSubmit={() => {
                            toggleRefresh();
                            setTimeout(() => {
                                onClose();
                            }, 350);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}



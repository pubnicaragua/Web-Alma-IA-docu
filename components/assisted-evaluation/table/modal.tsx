import { useCallback, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useModal } from "@/lib/modal-utils";
import { AssitedEvaluationObservation } from "@/types/assisted-evaluation";
import { AssitedEvaluationObservationSchema } from "@/zod/assisted-evaluation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useAxios } from "@/hooks/use-axios";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface PropTypes {
    respuesta_id: number | null;
    alumno_id: number;
    fecha: string;
    curso_id: number;
    pregunta_id: number;
    observacion: string | null;
    hora: string;
    isDisabled: boolean;
    handleUpdate: (alumnoId: number, observacion: string, hora: string) => void;
}

export function AssitedEvTableModal(
    {
        respuesta_id,
        alumno_id,
        fecha,
        curso_id,
        pregunta_id,
        observacion,
        isDisabled,
        hora,
        handleUpdate
    }: Readonly<PropTypes>
) {
    const { isOpen, onOpen, onClose } = useModal(false);
    const { toast } = useToast();
    const axios = useAxios(null);

    const form = useForm({
        resolver: zodResolver(AssitedEvaluationObservationSchema),
        defaultValues: {
            evento_id: pregunta_id,
            evento_respuesta_posible_id: respuesta_id,
            observacion: observacion ?? '',
            hora: hora ?? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            fecha,
            alumno_id,
            curso_id,
        }
    })

    const onSubmit = useCallback(async (values: AssitedEvaluationObservation) => {
        try {
            await axios.execute(() => window.axios.post(`/evaluacion-asistida/guardarRespuesta`, {
                ...values,
                evento_respuesta_posible_id: values.evento_respuesta_posible_id ?? respuesta_id
            }));
            handleUpdate(alumno_id, values.observacion ?? '', values.hora);
            onClose();
        } catch (error) {
            toast({
                title: "Error al guardar la respuesta",
                description: "Ha ocurrido un error al guardar la respuesta.",
                variant: "destructive",
            });
        }
    }, [alumno_id, respuesta_id]);

    useEffect(() => {
        if (isOpen) {
            form.reset({
                evento_id: pregunta_id,
                evento_respuesta_posible_id: respuesta_id,
                observacion: observacion ?? '',
                hora: hora || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                fecha,
                alumno_id,
                curso_id,
            });
        }
    }, [isOpen, observacion, hora, respuesta_id, alumno_id, curso_id, fecha, pregunta_id]);

    return (
        <>
            <div className="flex justify-center">
                <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={onOpen}
                    disabled={!respuesta_id}
                    aria-label="Agregar alerta manual"
                >
                    {(observacion || isDisabled) ? (
                        <span>Visualizar</span>
                    ) : (
                        <span>Agregar</span>
                    )}
                </Button>
            </div>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
                        <div className="w-full flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold">
                                Agregar nuevo evento o suceso
                            </DialogTitle>
                            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground flex items-center justify-center">
                                <X className="h-6 w-6" />
                                <span className="sr-only">Cerrar</span>
                            </DialogClose>
                        </div>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-4">
                        <div className="flex flex-col md:flex-row pb-4 mb-4">
                            <div className="w-40 h-6 mx-2 mt-3 text-gray-800">
                                Observaciónes
                            </div>
                            <div className="flex-1 flex flex-col md:flex-row">
                                <div className="w-full flex-1 mx-2">
                                    <Controller
                                        name="observacion"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Textarea
                                                className="resize-none w-full border bg-white/90 rounded-md h-9 md:h-10 text-sm md:text-base"
                                                onChange={field.onChange}
                                                disabled={isDisabled}
                                                value={field.value ?? ''}

                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row pb-4 mb-4">
                            <div className="w-40 h-6 mx-2 mt-3 text-gray-800">
                                Hora del evento
                            </div>
                            <div className="flex-1 flex flex-col md:flex-row">
                                <div className="w-full flex-1 mx-2">
                                    <Controller
                                        name="hora"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Input
                                                type="time"
                                                className="w-full border bg-white/90 rounded-md h-9 md:h-10 text-sm md:text-base"
                                                value={field.value}
                                                onChange={field.onChange}
                                                disabled={isDisabled}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end md:flex-row pb-4 mb-4">
                            <Button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600  text-white font-bold py-2 px-4 rounded w-full"
                                disabled={axios.loading || isDisabled}
                            >
                                {(observacion) ? (
                                    <span>Editar Evento</span>
                                ) : (
                                    <span>Agregar evento al registro</span>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

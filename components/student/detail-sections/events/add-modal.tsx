'use client';
import { useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useUser } from "@/middleware/user-context";
import { Dialog, DialogHeader, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModal } from "@/lib/modal-utils";
import { AssitedEvaluationManualSchema } from "@/zod/assisted-evaluation";
import type { AssitedEvaluationManual, CatalogResponse } from "@/types/assisted-evaluation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAxios } from "@/hooks/use-axios";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

interface PropTypes {
    alumno_id: number;
    curso_id: number;
    refetch: () => void;
}

export function StudentDetailAddEventModal(
    {
        alumno_id,
        curso_id,
        refetch
    }: Readonly<PropTypes>
) {
    const { selectedSchoolId, userData } = useUser();
    const { isOpen, onOpen, onClose } = useModal(false);
    const { toast } = useToast();
    const axios = useAxios();

    const fetchCatalogs = useCallback(async () => {
        if (!selectedSchoolId) return;
        return window.axios.get(`/evaluacion-asistida/catalogos`, {
            params: {
                escuela_id: selectedSchoolId
            }
        })
    }, [selectedSchoolId]);

    const {
        data: catalogs,
        loading: CatalogIsLoading
    } = useAxios<CatalogResponse>(fetchCatalogs, [selectedSchoolId]);

    const form = useForm<AssitedEvaluationManual>({
        resolver: zodResolver(AssitedEvaluationManualSchema),
        defaultValues: {
            alumno_id,
            evento_id: 0,
            evento_respuesta_posible_id: 0,
            fecha: new Date(),
            hora: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            observacion: '',
        }
    })

    const onSubmit = useCallback(async (values: AssitedEvaluationManual) => {
        try {
            await axios.execute(() => window.axios.post(`/evaluacion-asistida/guardarRespuesta`, {
                ...values,
                fecha: format(values.fecha, 'yyyy-MM-dd'),
                alumno_id: values.alumno_id ?? alumno_id,
                persona_id: userData?.persona.persona_id,
                curso_id
            }));
            onClose();
            refetch();
        } catch (error) {
            toast({
                title: "Error al guardar la respuesta",
                description: "Ha ocurrido un error al guardar la respuesta.",
                variant: "destructive",
            });
        }
    }, [alumno_id, userData?.usuario.usuario_id]);

    const eventoId = form.watch('evento_id');

    const respuestas = useMemo(() => {
        if (!eventoId) return [];
        if (!catalogs?.data.preguntas.length) return [];
        const pregunta = catalogs?.data?.preguntas.find((item) => item.id === eventoId);
        return pregunta?.evento_respuestas_posibles;
    }, [eventoId, catalogs?.data?.preguntas]);

    useEffect(() => {
        form.reset();
    }, [isOpen]);

    useEffect(() => {
        if (!form.formState.isDirty) return;
        form.setValue('evento_respuesta_posible_id', 0);
    }, [eventoId]);

    return (
        <>
            <Button
                className="bg-blue-500 hover:bg-blue-600"
                onClick={onOpen}
                aria-label="Agregar alerta manual"
            >
                <span>Agregar</span>
            </Button>
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="flex flex-col md:flex-row pb-4 mb-4">
                            <div className="w-40 h-6 mx-2 mt-3 text-gray-800">
                                Tipo de Evento
                            </div>
                            <div className="flex-1 flex flex-col md:flex-row">
                                <div className="w-full flex-1 mx-2">
                                    <Controller
                                        name="evento_id"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                value={field.value ? String(field.value) : ""}
                                                disabled={CatalogIsLoading}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Tipo de Evento" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {catalogs?.data?.preguntas.map((item) => (
                                                        <SelectItem key={item.id} value={String(item.id)}>
                                                            {item.evento}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row pb-4 mb-4">
                            <div className="w-40 h-6 mx-2 mt-3 text-gray-800">
                                Respuesta de Evento
                            </div>
                            <div className="flex-1 flex flex-col md:flex-row">
                                <div className="w-full flex-1 mx-2">
                                    <Controller
                                        name="evento_respuesta_posible_id"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                value={field.value ? String(field.value) : ""}
                                                disabled={!respuestas?.length}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Respuesta al Evento" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {respuestas?.map((item) => (
                                                        <SelectItem key={item.id} value={String(item.id)}>
                                                            {item.respuesta_texto}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row pb-4 mb-4">
                            <div className="w-40 h-6 mx-2 mt-3 text-gray-800">
                                Fecha Evento
                            </div>
                            <div className="flex-1 flex flex-col md:flex-row">
                                <div className="w-full flex-1 mx-2">
                                    <Controller
                                        name="fecha"
                                        control={form.control}
                                        render={({ field }) => (
                                            <DatePicker
                                                selected={field.value ?? null}
                                                onChange={field.onChange}
                                                placeholderText="Seleccione una fecha"
                                                className="w-full"
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
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

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
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
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
                                disabled={axios.loading}
                            >
                                Agregar evento al registro
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

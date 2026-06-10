"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Plus, AlertTriangle, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FormError } from "@/components/form/form-error";
import { useModal } from "@/lib/modal-utils";
import {
    fetchStates,
    fetchPrority,
    fetchSeverity,
    fetchBitacoraUsers,
    createAlert,
} from "@/services/alerts-service";
import type {
    ApiAlertPriority,
    ApiAlertSeverity,
    CreateAlertParams,
    PowerUser,
} from "@/services/alerts-service";
import { invalidateNotificationCache } from "@/services/header-service";
import { useUser } from "@/middleware/user-context";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const generarFechaISOUsuario = (fecha: string, hora: string) => {
    if (!fecha || !hora) return "";
    const horaCompleta = hora.length === 5 ? `${hora}:00` : hora;
    const fechaLocal = new Date(`${fecha}T${horaCompleta}`);
    return fechaLocal.toISOString();
};

function getHoyFechaHora() {
    const now = new Date();
    return {
        fecha: now.toISOString().slice(0, 10),
        hora: now.toTimeString().slice(0, 5),
    };
}

const addAlertSchema = z.object({
    tipo: z.string().min(1, "El estado de alerta es obligatorio"),
    prioridad: z.string().min(1, "La prioridad es obligatoria"),
    severidad: z.string().min(1, "La severidad es obligatoria"),
    responsable: z.string().min(1, "El responsable es obligatorio"),
    descripcion: z.string().min(1, "La descripción es obligatoria"),
    fecha: z.string().min(1, "La fecha es obligatoria"),
    hora: z.string().min(1, "La hora es obligatoria"),
});

type AddAlertFormValues = z.infer<typeof addAlertSchema>;

interface AddAlertModalProps {
    onRefresh: () => void;
}

export function StudentDetailAddAlertModal({ onRefresh }: AddAlertModalProps) {
    const { isOpen, onOpen, onClose } = useModal(false);
    const { isLoading: userLoading, selectedSchoolId } = useUser();
    const isMobile = useIsMobile();
    const params = useParams();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const catalogsLoadedRef = useRef(false);
    const catalogsLoadingRef = useRef(false);

    const [prioridades, setPrioridades] = useState<ApiAlertPriority[]>([]);
    const [alertStates, setAlertStates] = useState<any[]>([]);
    const [severitys, setSeveritys] = useState<ApiAlertSeverity[]>([]);
    const [powerUsers, setPowerUsers] = useState<PowerUser[]>([]);

    const { fecha: hoyFecha, hora: hoyHora } = getHoyFechaHora();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AddAlertFormValues>({
        resolver: zodResolver(addAlertSchema),
        defaultValues: {
            tipo: "",
            prioridad: "",
            severidad: "",
            responsable: "",
            descripcion: "",
            fecha: hoyFecha,
            hora: hoyHora,
        },
    });

    const showCatalogLoading = loading || (isOpen && !catalogsLoadedRef.current);

    const loadCatalogs = useCallback(async () => {
        if (catalogsLoadedRef.current || catalogsLoadingRef.current) return;

        try {
            catalogsLoadingRef.current = true;
            setLoading(true);
            const [prioridadesData, alertStatesData, severidadData, bitacoraUsers] =
                await Promise.all([
                    fetchPrority(),
                    fetchStates(),
                    fetchSeverity(),
                    fetchBitacoraUsers(),
                ]);

            setPrioridades(prioridadesData || []);
            setAlertStates(alertStatesData || []);
            setSeveritys(severidadData || []);
            setPowerUsers(bitacoraUsers || []);

            reset((prev) => ({
                ...prev,
                tipo: alertStatesData?.[0]?.nombre_alerta_estado || "",
                prioridad: prioridadesData?.[0]?.nombre || "",
                severidad: severidadData?.[0]?.nombre || "",
                responsable: bitacoraUsers?.[0]?.personas.persona_id?.toString() || "",
            }));
            catalogsLoadedRef.current = true;
        } finally {
            catalogsLoadingRef.current = false;
            setLoading(false);
        }
    }, [reset]);

    useEffect(() => {
        if (!isOpen) return;
        loadCatalogs();
    }, [isOpen, loadCatalogs]);

    const onSubmit = async (values: AddAlertFormValues) => {
        try {
            const prioridadSeleccionada = prioridades.find(
                (p) => p.nombre === values.prioridad
            );
            const severidadSeleccionada = severitys.find(
                (s) => s.nombre === values.severidad
            );

            if (!prioridadSeleccionada || !severidadSeleccionada) {
                throw new Error("Prioridad o severidad inválidos.");
            }

            const fechaGenerada = generarFechaISOUsuario(
                values.fecha,
                values.hora
            );

            if (!fechaGenerada) throw new Error("Fecha y hora inválidas.");

            const data: CreateAlertParams = {
                alumno_id: params?.id ? Number(params.id) : 0,
                mensaje: values.descripcion,
                fecha_generada: fechaGenerada,
                alerta_origen_id: 1,
                prioridad_id: prioridadSeleccionada.alerta_prioridad_id,
                severidad_id: severidadSeleccionada.alerta_severidad_id,
                responsable_actual_id: Number(values.responsable),
                leida: false,
                estado: values.tipo,
                alertas_tipo_alerta_tipo_id: 1,
            };

            await createAlert(data);
            invalidateNotificationCache(selectedSchoolId!);
            window.dispatchEvent(new CustomEvent("refresh-notifications"));

            toast({
                title: "Éxito",
                description: "Alerta agregada correctamente",
            });
            onRefresh();
            onClose();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Error al agregar la alerta.",
                variant: "destructive",
            });
        }
    };

    return (
        <>
            <Button
                className="bg-blue-500 hover:bg-blue-600"
                onClick={onOpen}
                aria-label="Agregar alerta manual"
                disabled={userLoading}
            >
                <Plus className={isMobile ? "" : "mr-2"} size={16} />
                {!isMobile && <span>Agregar alerta manual</span>}
            </Button>

            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
                        <div className="w-full flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold">
                                Agregar alerta manual
                            </DialogTitle>
                            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground flex items-center justify-center">
                                <X className="h-6 w-6" />
                                <span className="sr-only">Cerrar</span>
                            </DialogClose>
                        </div>
                    </DialogHeader>

                    {showCatalogLoading ? (
                        <div className="py-8 text-center text-gray-500">
                            Cargando datos...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                            {/* Estado */}
                            <div className="space-y-2">
                                <Label htmlFor="tipo" className="flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-2 text-blue-500" />
                                    Estado de alerta
                                </Label>
                                <Controller
                                    name="tipo"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione el estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {alertStates.map((a) => (
                                                    <SelectItem
                                                        key={a.alerta_estado_id}
                                                        value={a.nombre_alerta_estado}
                                                    >
                                                        {a.nombre_alerta_estado}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormError message={errors?.tipo?.message} />
                            </div>

                            {/* Prioridad */}
                            <div className="space-y-2">
                                <Label htmlFor="prioridad" className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                    Nivel de prioridad
                                </Label>
                                <Controller
                                    name="prioridad"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione prioridad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {prioridades.map((p) => (
                                                    <SelectItem key={p.alerta_prioridad_id} value={p.nombre}>
                                                        {p.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormError message={errors?.prioridad?.message} />
                            </div>

                            {/* Severidad */}
                            <div className="space-y-2">
                                <Label htmlFor="severidad" className="flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-2 text-blue-500" />
                                    Severidad
                                </Label>
                                <Controller
                                    name="severidad"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione severidad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {severitys.map((s) => (
                                                    <SelectItem key={s.alerta_severidad_id} value={s.nombre}>
                                                        {s.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormError message={errors?.severidad?.message} />
                            </div>

                            {/* Responsable */}
                            <div className="space-y-2">
                                <Label htmlFor="responsable" className="flex items-center">
                                    Responsable
                                </Label>
                                <Controller
                                    name="responsable"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione responsable" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {powerUsers.map((u) => (
                                                    <SelectItem
                                                        key={u.usuario_id}
                                                        value={u.personas.persona_id.toString()}
                                                    >
                                                        {u.personas.nombres} {u.personas.apellidos}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormError message={errors?.responsable?.message} />
                            </div>

                            {/* Descripción */}
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Controller
                                    name="descripcion"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            placeholder="Describa la situación"
                                            className="min-h-[100px]"
                                        />
                                    )}
                                />
                                <p className="text-xs text-gray-500 my-1">
                                    * Si son más de un involucrado en la alerta, mencionar el RUT
                                    de cada involucrado.
                                </p>
                                <FormError message={errors?.descripcion?.message} />
                            </div>

                            {/* Fecha y hora */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha</Label>
                                    <Controller
                                        name="fecha"
                                        control={control}
                                        render={({ field }) => (
                                            <Input type="date" {...field} />
                                        )}
                                    />
                                    <FormError message={errors?.fecha?.message} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Hora</Label>
                                    <Controller
                                        name="hora"
                                        control={control}
                                        render={({ field }) => (
                                            <Input type="time" {...field} />
                                        )}
                                    />
                                    <FormError message={errors?.hora?.message} />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-600"
                                disabled={isSubmitting || userLoading || loading}
                            >
                                Agregar alerta manual
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

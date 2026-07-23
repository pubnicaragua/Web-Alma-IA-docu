import { useCallback, useRef } from "react"
import { AxiosError } from "axios"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ServerActionResponse } from "@/types/generics"
import { Button } from "@/components/ui/button"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { NoticeFormNotice } from "./notice"
import { NoticeFormDestiny } from "./destiny"
import { useUser } from "@/middleware/user-context"

const NoticeSchema = z.object({
    aviso: z.object({
        titulo: z.string().nonempty("El titulo es requerido"),
        descripcion: z.string().nonempty("La descripcion es requerida"),
        palabras_clave: z.string().nonempty("Las palabras clave son requeridas"),
        archivo: z.any().nullable().optional(),
        tipo_programacion: z.string().nonempty("El tipo de programacion es requerido"),
        fecha_programacion: z.string().optional(),
    }).superRefine((aviso, ctx) => {
        if (aviso.tipo_programacion === "Ahora") return;

        if (!aviso.fecha_programacion) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["fecha_programacion"],
                message: "La fecha de programacion es requerida",
            });
            return;
        }

        const date = new Date(aviso.fecha_programacion);
        if (isNaN(date.getTime()) || date <= new Date()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["fecha_programacion"],
                message: "La fecha programada debe ser mayor a la actual",
            });
        }
    }),
    destinatarios: z.object({
        aviso_tipo_id: z.number().min(1, { message: "El tipo de aviso es requerido" }),
        aviso_destinatario_tipo: z.nativeEnum(
            { alumno: "alumno", apoderado: "apoderado" },
            { message: "El tipo de destinatario es requerido" }
        ),
        destinatarios: z.array(z.number()).min(1, { message: "Debe seleccionar al menos un destinatario" }),
    })
});

type NoticeSchema = z.infer<typeof NoticeSchema>

interface PropTypes {
    initialData?: NoticeSchema;
    avisoId?: number;
    meta?: any;
    postSubmit?: () => void
}

const defaultValues: NoticeSchema = {
    aviso: {
        titulo: "",
        descripcion: "",
        palabras_clave: "",
        archivo: undefined,
        tipo_programacion: "",
        fecha_programacion: "",
    },
    destinatarios: {
        aviso_tipo_id: 0,
        aviso_destinatario_tipo: "",
        destinatarios: [],
    }
}

export function NoticeForm({
    initialData,
    avisoId,
    meta,
    postSubmit
}: Readonly<PropTypes>) {

    const axios = useAxios();
    const { toast } = useToast();
    const { selectedSchoolId } = useUser();
    const submitLockRef = useRef(false);

    const form = useForm<NoticeSchema>({
        defaultValues: initialData ?? defaultValues,
        resolver: zodResolver(NoticeSchema),
        context: { isCreate: !avisoId }
    });

    const onSubmit = useCallback(async (values: NoticeSchema) => {
        if (submitLockRef.current) return;
        submitLockRef.current = true;

        const formData = new FormData();
        formData.append('titulo', values.aviso.titulo);
        formData.append('descripcion', values.aviso.descripcion);
        formData.append('palabras_claves', values.aviso.palabras_clave);

        let fechaProgramacion = values.aviso.fecha_programacion ?? "";
        if (values.aviso.tipo_programacion === "Ahora") {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            fechaProgramacion = now.toISOString().slice(0, 16);
        }

        formData.append("fecha_programacion", fechaProgramacion);
        if (values.aviso.archivo instanceof File) {
            formData.append('archivo', values.aviso.archivo);
        }
        formData.append('aviso_destinatario_tipo', values.destinatarios.aviso_destinatario_tipo);
        formData.append('aviso_tipo_id', values.destinatarios.aviso_tipo_id.toString());
        formData.append("destinario", values.destinatarios.destinatarios.toString());
        formData.append("colegio_id", selectedSchoolId ?? '');

        try {
            const response = await axios.execute<ServerActionResponse>(() =>
                avisoId
                    ? window.axios.patch(`/avisosApp/avisos/actualizar/${avisoId}`, formData)
                    : window.axios.post('/avisosApp/avisos/crear', formData)
            );

            toast({
                title: "Atencion",
                description: response?.data.message
            });

            postSubmit?.()
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: "Atencion",
                    description: error.response?.data.message,
                    variant: 'destructive'
                });
            }
        } finally {
            submitLockRef.current = false;
        }
    }, [avisoId, selectedSchoolId, axios, toast, postSubmit]);

    const isSubmitting = axios.loading || form.formState.isSubmitting;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 mt-2">
                <NoticeFormNotice form={form} programacion={initialData?.aviso.tipo_programacion ?? ''} />
                <NoticeFormDestiny form={form} metaInit={meta} />
            </div>
            <div className="flex justify-end mt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-500 hover:bg-blue-600"
                >
                    {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
            </div>
        </form>
    )
}

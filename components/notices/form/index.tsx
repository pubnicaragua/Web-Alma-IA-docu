import { useCallback } from "react"
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
        titulo: z.string().nonempty("El título es requerido"),
        descripcion: z.string().nonempty("La descripción es requerida"),
        palabras_clave: z.string().nonempty("Las palabras clave son requeridas"),
        archivo: z.instanceof(File).nullable().optional(),
        fecha_programacion: z.string()
            .nonempty("La fecha de programación es requerida")
            .refine((value) => {
                if (value === "now") return true;
                const date = new Date(value);
                if (isNaN(date.getTime())) return false;
                return date > new Date();
            }, {
                message: "¡La fecha programada debe ser mayor a la actual!",
            }),
    }),
    destinatarios: z.object({
        aviso_tipo_id: z.number().min(1, { message: "El tipo de aviso es requerido" }),
        aviso_destinatario_tipo: z.nativeEnum({ alumno: "alumno", apoderado: "apoderado" }, { message: "El tipo de destinatario es requerido" }),
        destinatarios: z.array(z.number()).min(1, { message: "Debe seleccionar al menos un destinatario" }),
    })
})

type NoticeSchema = z.infer<typeof NoticeSchema> & {
    aviso: {
        tipo_programacion: string;
    }
}

interface PropTypes {
    initialData?: NoticeSchema;
    avisoId?: number;
    meta?: any;
    postSubmit: () => void
}

const defaultValues: NoticeSchema = {
    aviso: {
        titulo: "",
        descripcion: "",
        palabras_clave: "",
        archivo: undefined,
        fecha_programacion: "",
        tipo_programacion: ""
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

    const form = useForm({
        defaultValues: initialData ?? defaultValues,
        resolver: zodResolver(NoticeSchema)
    });

    const onSubmit = useCallback(async (values: NoticeSchema) => {
        const formData = new FormData();
        formData.append('titulo', values.aviso.titulo);
        formData.append('descripcion', values.aviso.descripcion);
        formData.append('palabras_claves', values.aviso.palabras_clave);

        if (values.aviso.fecha_programacion != 'now') {
            formData.append('fecha_programacion', `${values.aviso.fecha_programacion}:00`);
        }

        formData.append('archivo', values.aviso.archivo ?? '');
        formData.append('aviso_destinatario_tipo', values.destinatarios.aviso_destinatario_tipo);
        formData.append('aviso_tipo_id', values.destinatarios.aviso_tipo_id.toString());
        formData.append("destinario", values.destinatarios.destinatarios.toString());
        formData.append("colegio_id", selectedSchoolId ?? '');

        try {
            const response = await axios.execute<ServerActionResponse>(() =>
                avisoId
                    ? window.axios.put(`/avisosApp/avisos/actualizar/${avisoId}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    })
                    : window.axios.post('/avisosApp/avisos/crear', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    })
            );

            toast({
                title: "¡Atención",
                description: response?.data.message
            });

            postSubmit()
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: "¡Atención",
                    description: error.response?.data.message,
                    variant: 'destructive'
                });
            }
        }
    }, [avisoId, selectedSchoolId]);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 mt-2">
                <NoticeFormNotice form={form} programacion={initialData?.aviso.tipo_programacion ?? ''} />
                <NoticeFormDestiny form={form} metaInit={meta} />
            </div>
            <div className="flex justify-end mt-4">
                <Button
                    type="submit"
                    disabled={axios.loading}
                    className="bg-blue-500 hover:bg-blue-600"
                >
                    Guardar
                </Button>
            </div>
        </form>
    )
}
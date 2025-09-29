import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { NoticeFormNotice } from "./notice"
import { Button } from "@/components/ui/button"
import { NoticeFormDestiny } from "./destiny"
import { useAxios } from "@/hooks/use-axios"

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

type NoticeSchema = z.infer<typeof NoticeSchema>

interface PropTypes {
    initialData?: NoticeSchema
}

const defaultValues: NoticeSchema = {
    aviso: {
        titulo: "",
        descripcion: "",
        palabras_clave: "",
        archivo: undefined,
        fecha_programacion: "",
    },
    destinatarios: {
        aviso_tipo_id: 0,
        aviso_destinatario_tipo: "",
        destinatarios: [],
    }
}

export function NoticeForm({ initialData }: Readonly<PropTypes>) {

    const form = useForm({
        defaultValues: initialData ?? defaultValues,
        resolver: zodResolver(NoticeSchema)
    });
    const axios = useAxios();

    const onSubmit = useCallback((values: NoticeSchema) => {
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
        axios.execute(() => window.axios.post('/avisosApp/avisos/crear', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }));
    }, []);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 mt-2">
                <NoticeFormNotice form={form} />
                <NoticeFormDestiny form={form} />
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
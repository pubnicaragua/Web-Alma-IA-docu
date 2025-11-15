import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { AxiosError } from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { SURVEY_STATES } from "@/constants/surveys"
import { SurveySchema } from "@/zod/surveys"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { ServerActionResponse } from "@/types/generics"
import { ISurveyCatalogs, ISurveySchema } from "@/types/surveys"
import { useUser } from "@/middleware/user-context"
import { SurveyFormGeneral } from "./general"
import { SurveyFormDestiny } from "./destiny"
import { SurveyFormQuestions } from "./questions"
import { SurveyFormProgramming } from "./programming"

interface PropTypes {
    initialData?: ISurveySchema;
    encuestaId?: number;
    postSubmit: () => void,
    metaForm?: {
        curso_id: string,
        grado_id: string,
        colegio_id: string
    }
}

const defaultValues: any = {
    general: {
        estado: SURVEY_STATES[0],
        titulo: '',
        descripcion: '',
        concepto_id: 0,
        tipo_id: 0,
        plantilla_id: 0,
        obligatoria: ''
    },
    preguntas: [
        {
            titulo: '',
            tipo_id: 0,
            posibles_respuestas: []
        }
    ],
    destinatarios: {
        tipo_id: '',
        destinatario_tipo: '',
        destinatarios: [],
    },
    programacion: {
        fecha_inicio: '',
        fecha_fin: '',
        hora_ejecucion: '',
        frecuencia: '',
        valores_frecuencia: [],
    }
}

export function SurveyForm({
    initialData,
    encuestaId,
    postSubmit,
    metaForm
}: Readonly<PropTypes>) {

    const { selectedSchoolId } = useUser();
    const { toast } = useToast();
    const form = useForm({
        defaultValues: initialData ?? defaultValues,
        resolver: zodResolver(SurveySchema)
    });

    const catalogs = useAxios<ISurveyCatalogs>(() => window.axios.get(`/encuestas/catalogos`), []);
    const axios = useAxios();

    const onSubmit = useCallback(async (values: ISurveySchema) => {
        try {

            const formData = {
                ...values,
                general: {
                    ...values.general,
                    obligatoria: values.general.obligatoria == 'SI',
                    colegio_id: selectedSchoolId
                },
                destinatarios: {
                    ...values.destinatarios,
                    objetivo_envio_id: values.destinatarios.destinatario_tipo
                }
            };

            const response = await axios.execute<{ mensaje: string }>(() =>
                encuestaId
                    ? window.axios.post(`/encuestas/actualizar-encuesta/${encuestaId}`, formData)
                    : window.axios.post('/encuestas/crear-encuesta', formData)
            );

            toast({
                title: "¡Atención",
                description: response?.data.mensaje
            });

            postSubmit()
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: "¡Atención",
                    description: error.response?.data.mensaje ?? 'Error de Servidor',
                    variant: 'destructive'
                });
            }
        }
    }, [encuestaId, selectedSchoolId]);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4">
                <SurveyFormGeneral form={form} catalogs={catalogs?.data || null} />
                <SurveyFormQuestions form={form} catalogs={catalogs?.data || null} />
                <SurveyFormDestiny metaInit={metaForm ?? null} form={form} catalogs={catalogs?.data || null} />
                <SurveyFormProgramming form={form} catalogs={catalogs?.data || null} />
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
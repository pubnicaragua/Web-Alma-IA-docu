import { useState, useEffect, useCallback } from "react";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import { FormError } from "@/components/form/form-error";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SURVEY_QUESTION_TONES } from "@/constants/surveys";
import { ISurveyCatalogs, ISurveySchema } from "@/types/surveys";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Brush, TriangleAlert,
    ChevronLeft, ChevronRight,
    Plus, ArrowUp,
    ArrowDown,
    Trash,
    List,
    ArrowLeft,
} from "lucide-react";
import { useAxios } from "@/hooks/use-axios";

interface PropTypes {
    form: UseFormReturn<ISurveySchema>;
    catalogs: ISurveyCatalogs | null;
}

export function SurveyFormQuestions({ form, catalogs }: Readonly<PropTypes>) {

    const [tick, setTick] = useState(0);
    const [viewType, setViewType] = useState<'form' | 'preview'>('form');
    const { control, watch, setValue, formState, getValues } = form;

    const { fields, append, move } = useFieldArray({
        control,
        name: "preguntas",
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const visible = watch(`preguntas.${currentIndex}`);
    const surveyTypeId = watch('general.tipo_id');
    const templateId = watch('general.plantilla_id');

    const fetchTemplates = useCallback(async () => {
        if (!surveyTypeId) return;
        return window.axios.get(`/encuestas/tipos/${surveyTypeId}/plantillas`)
    }, [surveyTypeId]);

    const fetcherTemplates = useAxios<any>(fetchTemplates, [surveyTypeId])
    const fetcherQuestions = useAxios<any>();

    const handleClickApplyTemplate = useCallback(async () => {
        const response = await fetcherQuestions.execute<any>(() => window.axios.get(`/encuestas/plantillas/${templateId || 0}/preguntas`));
        if (response?.data.preguntas.length) {
            form.setValue('preguntas', response?.data.preguntas);
        } else {
            form.resetField('preguntas')
        }
        setTick((prev) => prev + 1);
    }, [templateId]);

    useEffect(() => {
        if (!visible) return;

        const { tipo_id } = visible;
        if (!tipo_id) return;

        if (Number(tipo_id) == 3) {
            setValue(`preguntas.${currentIndex}.posibles_respuestas`, []);
            return;
        }

        const actuales = getValues(`preguntas.${currentIndex}.posibles_respuestas`);
        if (!actuales || actuales.length === 0) {
            const initial = Array.from({ length: 4 }, () => ({
                titulo: "",
                peso: 0,
            }));
            setValue(`preguntas.${currentIndex}.posibles_respuestas`, initial as any);
        }
    }, [visible?.tipo_id, currentIndex]);

    useEffect(() => {
        setTick((prev) => prev + 1);
    }, [currentIndex])

    const handleAddQuestion = () => {
        append({
            tipo_id: "",
            titulo: "",
            posibles_respuestas: [],
        } as any);
        setCurrentIndex(fields.length);
    };

    const handleRemoveQuestion = () => {
        if (fields.length <= 1) return;
        const updated = fields.filter((_, i) => i !== currentIndex);
        form.setValue("preguntas", updated);
        setCurrentIndex((prev) => prev >= updated.length ? updated.length - 1 : prev);
    };

    const handleMoveQuestion = (from: number, to: number) => {
        if (to < 0 || to >= fields.length) return;
        move(from, to);
        setCurrentIndex(to);
    };

    const handleClickCleanResponse = (idx: number) => {
        setValue(`preguntas.${currentIndex}.posibles_respuestas.${idx}`, {
            titulo: "",
            peso: 0,
        } as any);
    };

    return (
        <fieldset className="border border-gray-300 p-4 rounded-lg">
            <legend className="text-lg font-semibold px-2">Cuestionario</legend>

            <div className="grid grid-cols-4 gap-4 mb-5">
                <div className="lg:col-span-3">
                    <Label className="text-sm text-gray-500">
                        Plantillas
                    </Label>
                    <Controller
                        name={`general.plantilla_id`}
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={field.value ? String(field.value) : ''}
                                onValueChange={(value) => field.onChange(Number(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione el Tipo de Pregunta" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={"0"}>
                                        Limpia / Nueva
                                    </SelectItem>
                                    {fetcherTemplates?.data?.templates.map((item: any) => (
                                        <SelectItem
                                            className="capitalize"
                                            key={item?.id}
                                            value={String(item?.id)}
                                        >
                                            {item.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="lg:col-span-1">
                    <Button
                        type="button"
                        onClick={handleClickApplyTemplate}
                        disabled={fetcherTemplates.loading}
                        className="mt-6 bg-blue-500 hover:bg-blue-600 w-full"
                    >
                        Aplicar
                    </Button>
                </div>

            </div>


            <div className={`flex justify-between items-center mb-4 ${viewType === 'preview' ? 'hidden' : ''}`}>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={currentIndex === 0}
                        onClick={() => handleMoveQuestion(currentIndex, currentIndex - 1)}
                    >
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        type="button"
                        disabled={currentIndex === fields.length - 1}
                        onClick={() => handleMoveQuestion(currentIndex, currentIndex + 1)}
                    >
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                </div>

                <div className="text-blue-600 font-medium select-none">
                    Pregunta {currentIndex + 1} de {fields.length}
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex((i) => i - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        type="button"
                        disabled={currentIndex === fields.length - 1}
                        onClick={() => setCurrentIndex((i) => i + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button type="button" onClick={() => setViewType((prev) => prev === 'form' ? 'preview' : 'form')} variant={'outline'}>
                        <List className="h-4 w-4" />
                    </Button>
                    <Button type="button" onClick={handleAddQuestion}>
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button type="button" onClick={handleRemoveQuestion} variant={'destructive'}>
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className={`flex mb-4 ${viewType === 'form' ? 'hidden' : ''}`}>
                <Button type="button" onClick={() => setViewType((prev) => prev === 'form' ? 'preview' : 'form')} variant={'outline'}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Volver
                </Button>
            </div>

            {viewType === 'form' && (
                <div key={tick} className="grid grid-cols-6 gap-4">
                    <div className="col-span-6">
                        <Label className="text-sm text-gray-500">
                            Tipo de Pregunta
                        </Label>
                        <Controller
                            name={`preguntas.${currentIndex}.tipo_id`}
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={Number(field.value) ? String(field.value) : ''}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccione el Tipo de Pregunta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {catalogs?.tiposPreguntas.map((item) => (
                                            <SelectItem
                                                className="capitalize"
                                                key={item.tipo_pregunta_id}
                                                value={String(item.tipo_pregunta_id)}
                                            >
                                                {item.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <FormError
                            message={formState.errors.preguntas?.[currentIndex]?.tipo_id?.message}
                        />
                    </div>

                    <div className="col-span-6">
                        <Label className="text-sm text-gray-500">Título</Label>
                        <Controller
                            name={`preguntas.${currentIndex}.titulo`}
                            control={control}
                            render={({ field }) => (
                                <Textarea {...field} placeholder="Escriba la descripción de la pregunta" />
                            )}
                        />
                        <FormError
                            message={formState.errors.preguntas?.[currentIndex]?.titulo?.message}
                        />
                    </div>

                    <div className="col-span-6">
                        {(visible?.tipo_id < 3 && Boolean(visible?.tipo_id)) && (
                            <>
                                <Label className="block text-sm text-gray-500 mb-2">
                                    Posibles Respuestas
                                </Label>
                                {visible.posibles_respuestas.map((_item, idx) => (
                                    <div key={idx} className="flex mb-3">
                                        <div className="grow">
                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="col-span-1">
                                                    <Controller
                                                        name={`preguntas.${currentIndex}.posibles_respuestas.${idx}.peso`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select
                                                                value={Number(field.value) ? String(field.value) : '0'}
                                                                onValueChange={(value) => field.onChange(Number(value))}
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Seleccione.." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {SURVEY_QUESTION_TONES.map((item) => (
                                                                        <SelectItem
                                                                            key={item.valor}
                                                                            value={String(item.valor)}
                                                                            className="capitalize"
                                                                        >
                                                                            {item.nombre}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    <FormError
                                                        message={formState.errors.preguntas?.[currentIndex]?.posibles_respuestas?.[idx]?.peso?.message}
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <Controller
                                                        name={`preguntas.${currentIndex}.posibles_respuestas.${idx}.titulo`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input {...field} placeholder="Escriba la respuesta" />
                                                        )}
                                                    />
                                                    <FormError
                                                        message={formState.errors.preguntas?.[currentIndex]?.posibles_respuestas?.[idx]?.titulo?.message}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleClickCleanResponse(idx)}
                                            >
                                                <Brush className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        {visible?.tipo_id == 3 && (
                            <div className="p-4 text-sm text-blue-800 text-center rounded-lg bg-blue-50">
                                <TriangleAlert className="inline mr-2" />
                                <p>Las preguntas abiertas no requieren respuestas</p>
                            </div>
                        )}
                        {visible?.tipo_id > 3 && (
                            <div className="p-4 text-sm text-blue-800 text-center rounded-lg bg-blue-50">
                                <TriangleAlert className="inline mr-2" />
                                <p>Las preguntas tendrán un buscador para relacionar estudiantes entre sí</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {viewType == 'preview' && (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
                    {fields.map((item, idx) => (
                        <li className="py-3 sm:pb-4" key={idx}>
                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                        <span className="text-gray-900"> # {idx + 1}</span> {item.titulo || 'Pregunta sin título'}
                                    </p>
                                </div>
                                <div className="inline-flex items-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setCurrentIndex(idx);
                                            setViewType('form')
                                        }}
                                    >
                                        <ChevronRight />
                                    </Button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

        </fieldset>
    );
}
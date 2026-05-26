import { Controller, UseFormReturn } from "react-hook-form";
import { FormError } from "@/components/form/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SURVEY_MANDATORY, SURVEY_STATES } from "@/constants/surveys";
import { ISurveyCatalogs, ISurveySchema } from "@/types/surveys";

interface PropTypes {
    form: UseFormReturn<ISurveySchema>;
    catalogs: ISurveyCatalogs | null;
}

export function SurveyFormGeneral({ form, catalogs }: Readonly<PropTypes>) {

    return (
        <fieldset className="border border-gray-300 p-4 rounded-lg">
            <legend className="text-lg font-semibold px-2">General</legend>
            <div className="grid grid-cols-6 gap-4">
                <div className="col-span-3">
                    <Label className="text-sm text-gray-500">Estado</Label>
                    <Controller
                        name="general.estado"
                        control={form.control}
                        render={({ field }) => (
                            <Select
                                value={Number(field.value) ? String(field.value) : ''}
                                onValueChange={(value) => field.onChange(Number(value))}
                            >
                                <SelectTrigger value={''} className="w-full">
                                    <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogs?.estados?.map((item) => (
                                        <SelectItem
                                            key={item.encuesta_estado_id}
                                            value={String(item.encuesta_estado_id)}
                                            className="text-capitalize">
                                            {item.encuesta_estado_nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <FormError message={form.formState.errors.general?.estado?.message} />
                </div>
                <div className="col-span-3">
                    <Label className="text-sm text-gray-500">Obligatoria</Label>
                    <Controller
                        name="general.obligatoria"
                        control={form.control}
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger value={''} className="w-full">
                                    <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {SURVEY_MANDATORY.map((item) => (
                                        <SelectItem key={item} value={item} className="text-capitalize">
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <FormError message={form.formState.errors.general?.obligatoria?.message} />
                </div>
                <div className="col-span-6">
                    <Label className="text-sm text-gray-500">Título</Label>
                    <Controller
                        name="general.titulo"
                        control={form.control}
                        render={({ field }) => (
                            <Input {...field} placeholder="Escriba el título de la encuesta" />
                        )}
                    />
                    <FormError message={form.formState.errors.general?.titulo?.message} />
                </div>

                <div className="col-span-3">
                    <Label className="text-sm text-gray-500">Concepto</Label>
                    <Controller
                        name="general.concepto_id"
                        control={form.control}
                        render={({ field }) => (
                            <Select
                                value={Number(field.value) ? String(field.value) : ''}
                                onValueChange={(value) => field.onChange(Number(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione el Tipo de Concepto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogs?.conceptosAsociados.map((item) => (
                                        <SelectItem
                                            className="text-capitalize"
                                            key={item.concepto_asociado_id}
                                            value={String(item.concepto_asociado_id)}
                                        >
                                            {item.concepto_asociado_nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <FormError message={form.formState.errors.general?.concepto_id?.message} />
                </div>

                <div className="col-span-3">
                    <Label className="text-sm text-gray-500">Tipo Encuesta</Label>
                    <Controller
                        name="general.tipo_id"
                        control={form.control}
                        render={({ field }) => (
                            <Select
                                value={Number(field.value) ? String(field.value) : ''}
                                onValueChange={(value) => field.onChange(Number(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione el tipo de Encuesta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogs?.tiposEncuesta.map((tipo) => (
                                        <SelectItem
                                            className="text-capitalize"
                                            key={tipo.tipo_encuesta_id}
                                            value={String(tipo.tipo_encuesta_id)}
                                        >
                                            {tipo.tipo_encuesta_nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <FormError message={form.formState.errors.general?.tipo_id?.message} />
                </div>

                <div className="col-span-6">
                    <Label className="text-sm text-gray-500">Descripción</Label>
                    <Controller
                        name="general.descripcion"
                        control={form.control}
                        render={({ field }) => (
                            <Textarea
                                {...field}
                                placeholder="Escriba la descripción de la encuesta"
                                className="resize-none min-h-[120px]"
                            />
                        )}
                    />
                    <FormError message={form.formState.errors.general?.descripcion?.message} />
                </div>

            </div >
        </fieldset>
    )
}
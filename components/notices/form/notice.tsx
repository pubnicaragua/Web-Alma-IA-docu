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
import { useEffect, useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";

interface PropTypes {
    form: UseFormReturn<any>;
    programacion?: string;
}

const PROGRAMATION_TYPES = ['Ahora', 'Programar']

export function NoticeFormNotice({ form, programacion = '' }: Readonly<PropTypes>) {

    const [programation, setProgramation] = useState(programacion);
    const avisoErrors = form.formState.errors.aviso as any;

    useEffect(() => {
        if (!form.formState.isDirty) return;
        if (!programation) return;
        form.setValue('aviso.tipo_programacion', programation, {
            shouldDirty: true,
            shouldValidate: true,
        });
        if (programation == 'Ahora') {
            form.setValue('aviso.fecha_programacion', '', {
                shouldDirty: true,
                shouldValidate: true,
            });
            return;
        }
        form.setValue('aviso.fecha_programacion', '', {
            shouldDirty: true,
            shouldValidate: true,
        });
    }, [programation])

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3">
                <Label className="text-sm text-gray-500">Título</Label>
                <Controller
                    name="aviso.titulo"
                    control={form.control}
                    render={({ field }) => (
                        <Input {...field} placeholder="Escriba el título del aviso" />
                    )}
                />
                <FormError message={avisoErrors?.titulo?.message} />
            </div>
            <div className="col-span-3">
                <Label className="text-sm text-gray-500">Palabras Clave</Label>
                <Controller
                    name="aviso.palabras_clave"
                    control={form.control}
                    render={({ field }) => (
                        <Input {...field} placeholder="Ejemplo: privacidad, seguridad, etc." />
                    )}
                />
                <p className="text-xs text-gray-400 mt-1">
                    Favor de separar las palabras clave con comas.
                </p>
                <FormError message={avisoErrors?.palabras_clave?.message} />
            </div>
            <div className="col-span-3">
                <Label className="text-sm text-gray-500">Descripción</Label>
                <Controller
                    name="aviso.descripcion"
                    control={form.control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="Escriba la descripción del aviso"
                            className="resize-none min-h-[120px]"
                        />
                    )}
                />
                <FormError message={avisoErrors?.descripcion?.message} />
            </div>
            <div className="col-span-3">
                <Label className="text-sm text-gray-500 mb-1 block">
                    Subir archivo (opcional)
                </Label>
                {typeof form.watch('aviso.archivo') === 'string' && form.watch('aviso.archivo') ? (
                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded flex items-center justify-between text-xs">
                        <span className="text-blue-700 font-medium truncate">
                            📎 Archivo actual adjunto
                        </span>
                        <a
                            href={form.watch('aviso.archivo')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline font-semibold ml-2 hover:text-blue-800"
                        >
                            Ver archivo adjunto
                        </a>
                    </div>
                ) : null}
                {form.watch('aviso.archivo') instanceof File ? (
                    <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700 font-medium truncate">
                        📄 Nuevo archivo seleccionado: {(form.watch('aviso.archivo') as File).name}
                    </div>
                ) : null}
                <Controller
                    name="aviso.archivo"
                    control={form.control}
                    render={({ field }) => (
                        <Input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,application/pdf"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                field.onChange(file);
                            }}
                        />
                    )}
                />
                <p className="text-xs text-gray-400 mt-1">
                    Solo se permiten imágenes JPG, PNG, GIF y archivos PDF. El
                    archivo debe ser menor a 5MB.
                </p>
                <FormError message={avisoErrors?.archivo?.message} />
            </div>

            <div className={`col-span-${programation != 'Programar' && programation != 'Programada' ? 3 : 1}`}>
                <Label className="text-sm text-gray-500">
                    Tipo Programación
                </Label>
                <Select value={programation}
                    onValueChange={(val) => setProgramation(val)}

                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione el Tipo de Destinatario" />
                    </SelectTrigger>
                    <SelectContent>
                        {PROGRAMATION_TYPES.map((tipo) => (
                            <SelectItem key={tipo} value={tipo} className="text-capitalize">
                                {tipo}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {(programation == 'Programar' || programation == 'Programada') && (
                <div className="col-span-2">
                    <Label className="text-sm text-gray-500">
                        Programación
                    </Label>
                    <Controller
                        name="aviso.fecha_programacion"
                        control={form.control}
                        render={({ field }) => {
                            return (
                                <Input
                                    {...field}
                                    type="datetime-local"
                                />
                            )
                        }}
                    />
                    <FormError message={avisoErrors?.fecha_programacion?.message} />
                </div>
            )}
        </div>
    )
}

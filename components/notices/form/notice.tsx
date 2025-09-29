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
    form: UseFormReturn<any>
}

const PROGRAMATION_TYPES = ['Ahora', 'Programada']

export function NoticeFormNotice({ form }: Readonly<PropTypes>) {

    const [programation, setProgramation] = useState('');

    useEffect(() => {
        if (!programation) return;
        if (programation == 'Ahora') {
            form.setValue('aviso.fecha_programacion', 'now');
            return;
        }
        form.setValue('aviso.fecha_programacion', '');
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
                <FormError message={form.formState.errors.aviso?.titulo?.message} />
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
                <FormError message={form.formState.errors.aviso?.palabras_clave?.message} />
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
                <FormError message={form.formState.errors.aviso?.descripcion?.message} />
            </div>
            <div className="col-span-3">
                <Label className="text-sm text-gray-500">
                    Subir archivo (opcional)
                </Label>
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
                <FormError message={form.formState.errors.aviso?.archivo?.message} />
            </div>

            <div className={`col-span-${programation != 'Programada' ? 3 : 1}`}>
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
            {programation == 'Programada' && (
                <div className="col-span-2">
                    <Label className="text-sm text-gray-500">
                        Programación
                    </Label>
                    <Controller
                        name="aviso.fecha_programacion"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                type="datetime-local"
                            />
                        )}
                    />
                    <FormError message={form.formState.errors.aviso?.fecha_programacion?.message} />
                </div>
            )}
        </div>
    )
}
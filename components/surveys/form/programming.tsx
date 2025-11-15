import { Controller, UseFormReturn } from "react-hook-form";
import { FormError } from "@/components/form/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SURVEY_FREQUENCIES } from "@/constants/surveys";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ISurveyCatalogs, ISurveySchema } from "@/types/surveys";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropTypes {
    form: UseFormReturn<ISurveySchema>;
    catalogs: ISurveyCatalogs | null;
}

export function SurveyFormProgramming({ form }: Readonly<PropTypes>) {

    const [specDate, setSpecDate] = useState('');
    const frecuency = form.watch('programacion.frecuencia');
    const frecuencyValue = form.watch('programacion.valores_frecuencia');

    useEffect(() => {
        if (!form.formState.isDirty) return;
        form.setValue('programacion.valores_frecuencia', []);
        setSpecDate('');
    }, [frecuency, form.formState.isDirty]);

    const handleAddSpecDate = useCallback(() => {
        if (!specDate) return;
        if (frecuencyValue.includes(specDate)) return;
        form.setValue('programacion.valores_frecuencia', [...frecuencyValue, specDate])
        setSpecDate('');
    }, [specDate]);

    return (
        <fieldset className="border border-gray-300 p-4 rounded-lg">
            <legend className="text-lg font-semibold px-2">Programación</legend>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <div className="col-span-1">
                    <Label className="text-sm text-gray-500">
                        Fecha Inicio
                    </Label>
                    <Controller
                        name="programacion.fecha_inicio"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                type="date"
                            />
                        )}
                    />
                    <FormError message={form.formState.errors.programacion?.fecha_inicio?.message} />
                </div>

                <div className="col-span-1">
                    <Label className="text-sm text-gray-500">
                        Fecha Fin
                    </Label>
                    <Controller
                        name="programacion.fecha_fin"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                type="date"
                            />
                        )}
                    />
                    <FormError message={form.formState.errors.programacion?.fecha_fin?.message} />
                </div>

                <div className="col-span-1">
                    <Label className="text-sm text-gray-500">
                        Hora de Ejecución
                    </Label>
                    <Controller
                        name="programacion.hora_ejecucion"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                type="time"
                            />
                        )}
                    />
                    <FormError message={form.formState.errors.programacion?.hora_ejecucion?.message} />
                </div>

                <div className="col-span-1">
                    <Label className="text-sm text-gray-500">
                        Frecuencia
                    </Label>
                    <Controller
                        name="programacion.frecuencia"
                        control={form.control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange} >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {SURVEY_FREQUENCIES.map((item) => (
                                        <SelectItem key={item} value={item} className="text-capitalize">
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <FormError message={form.formState.errors.programacion?.frecuencia?.message} />
                </div>

                {frecuency == "semanal" && (
                    <div className="col-span-1">
                        <Label className="text-sm text-gray-500">
                            Días de la Semana
                        </Label>
                        <Controller
                            name="programacion.valores_frecuencia"
                            control={form.control}
                            render={({ field }) => (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between overflow-hidden"
                                        >
                                            <span className="truncate">Seleccionados {frecuencyValue.length} elementos</span>
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="overflow-y-scroll lg:max-h-[320px] w-[250px] p-1">
                                        {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((item, index) => (
                                            <DropdownMenuCheckboxItem key={item} checked={frecuencyValue.includes(String(index + 1))}
                                                onClick={() => {
                                                    const newSelectedAlumnos = frecuencyValue.includes(String(index + 1))
                                                        ? frecuencyValue.filter((id) => id !== String(index + 1))
                                                        : [...frecuencyValue, String(index + 1)];
                                                    field.onChange(newSelectedAlumnos);
                                                }}
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                {item}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        />
                        <FormError message={form.formState.errors.programacion?.valores_frecuencia?.message} />
                    </div>
                )}

                {frecuency == "mensual" && (
                    <div className="col-span-1">
                        <Label className="text-sm text-gray-500">
                            Días del Mes
                        </Label>
                        <Controller
                            name="programacion.valores_frecuencia"
                            control={form.control}
                            render={({ field }) => (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between overflow-hidden"
                                        >
                                            <span className="truncate">Seleccionados {frecuencyValue.length} elementos</span>
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="overflow-y-scroll lg:max-h-[320px] w-[250px] p-1">
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map((item) => (
                                            <DropdownMenuCheckboxItem key={item} checked={frecuencyValue.includes(String(item))}
                                                onClick={() => {
                                                    const newSelectedAlumnos = frecuencyValue.includes(String(item))
                                                        ? frecuencyValue.filter((id) => id !== String(item))
                                                        : [...frecuencyValue, item];
                                                    field.onChange(newSelectedAlumnos);
                                                }}
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                {item}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        />
                        <FormError message={form.formState.errors.programacion?.valores_frecuencia?.message} />
                    </div>
                )}

                {frecuency == "personalizada" && (
                    <>
                        <div className="col-span-1">
                            <Label className="text-sm text-gray-500">
                                Fechas Especificas
                            </Label>
                            <div className="grid grid-cols-4 gap-3">
                                <Input
                                    className="col-span-3"
                                    value={specDate}
                                    onChange={({ target }) => setSpecDate(target?.value)}
                                    type="date"
                                />
                                <Button
                                    onClick={handleAddSpecDate}
                                    className="col-span-1"
                                    type="button"
                                >
                                    <Plus />
                                </Button>
                            </div>
                            <FormError message={form.formState.errors.programacion?.valores_frecuencia?.message} />
                        </div>
                        <div className="col-span-1">
                            <Label className="text-sm text-gray-500">
                                Listado de Fechas
                            </Label>
                            <ul className="max-w-md divide-y divide-default border rounded-sm">
                                {!frecuencyValue.length && (
                                    <li className="py-2 px-2">
                                        No se han ingresado fechas
                                    </li>
                                )}
                                {frecuencyValue.map((date, index) => (
                                    <li key={date} className="py-2">
                                        <div className="flex px-2 items-center justify-between">
                                            <span>{date}</span>
                                            <Button
                                                type="button"
                                                size='sm'
                                                variant={'destructive'}
                                                onClick={() => {
                                                    const temp = [...frecuencyValue];
                                                    temp.splice(index, 1);
                                                    form.setValue('programacion.valores_frecuencia', temp);
                                                }}
                                            >
                                                <Trash />
                                            </Button>
                                        </div>
                                    </li>

                                ))}
                            </ul>
                        </div>

                    </>
                )}


            </div>
        </fieldset>
    )
}


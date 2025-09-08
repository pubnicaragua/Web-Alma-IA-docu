'use client'
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import { Printer, Search } from "lucide-react";
import { AssitedEvaluationFilterSchema } from "@/zod/assisted-evaluation"
import { AssitedEvaluationFilter, Curso, Pregunta } from "@/types/assisted-evaluation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "../ui/date-picker";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEffect } from "react";

interface PropTypes {
    setFilters: (filters: AssitedEvaluationFilter) => void,
    handlePrint: () => void,
    CatalogIsLoading: boolean,
    preguntas: Pregunta[],
    cursos: Curso[],
}

export function AssitedEvaluationFilters({
    setFilters,
    handlePrint,
    CatalogIsLoading,
    preguntas = [],
    cursos = []
}: Readonly<PropTypes>) {

    const form = useForm<AssitedEvaluationFilter>({
        resolver: zodResolver(AssitedEvaluationFilterSchema),
        defaultValues: {
            alumno_nombre: '',
            curso_id: 0,
            pregunta_id: 0,
            fecha: new Date(),
        },
        mode: 'onChange'
    })

    const values = form.watch(['alumno_nombre', 'curso_id', 'pregunta_id', 'fecha']);

    useEffect(() => {
        if (!form.formState.isValid) return;
        setFilters(form.getValues());
    }, [...values, form.formState.isValid])

    return (
        <form onSubmit={form.handleSubmit(setFilters)}>
            <fieldset className="print:hidden grid grid-cols-1 sm:mb-4 lg:mb-6 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                    <div className="w-full relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <Controller
                            name="alumno_nombre"
                            control={form.control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder="Buscar alumno..."
                                    className="w-full pl-10 border bg-white/90 rounded-md h-9 md:h-10 text-sm md:text-base"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                </div>
                <div className="md:col-span-1">
                    <Button
                        type="button"
                        className="w-full px-6 bg-blue-500 hover:bg-blue-600"
                        onClick={handlePrint}
                    >
                        <Printer className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Imprimir comparación</span>
                    </Button>
                </div>
            </fieldset>

            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                    <Controller
                        name="pregunta_id"
                        control={form.control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? String(field.value) : ""}
                                disabled={CatalogIsLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Evento" />
                                </SelectTrigger>
                                <SelectContent>
                                    {preguntas.map((item) => (
                                        <SelectItem key={item.id} value={String(item.id)}>
                                            {item.evento}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="md:col-span-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="md:col-span-1">
                            <Controller
                                name="curso_id"
                                control={form.control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? String(field.value) : ""}
                                        disabled={CatalogIsLoading}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Curso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cursos.map((item) => (
                                                <SelectItem key={item.curso_id} value={String(item.curso_id)}>
                                                    {item.nombre_curso}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <Controller
                                name="fecha"
                                control={form.control}
                                render={({ field }) => (
                                    <DatePicker
                                        selected={field.value ?? null}
                                        onChange={field.onChange}
                                        placeholderText="Seleccione una fecha"
                                        className="w-full"
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </fieldset>
        </form>
    )
}

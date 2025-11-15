import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { FilterDropdown } from "@/components/filter-dropdown";
import { FilterDropdownObject } from "@/components/filter-dropdown-object";
import { DatePicker } from "@/components/ui/date-picker";
import { DESTINY_TYPES, NOTICE_TYPES } from "@/constants/notices";

interface PropTypes {
    setFilters: (values: any) => void;
}

export function NoticeTableFilters({ setFilters }: Readonly<PropTypes>) {

    const form = useForm({
        defaultValues: {
            tipo_id: 0,
            destinatario_tipo: "",
            fecha_programacion: null,
            estado: ""
        }
    });

    useEffect(() => {
        const subscription = form.watch((values: any) => {
            setFilters({
                tipo: values.tipo_id.nombre,
                dirigido: values.destinatario_tipo,
                fecha_programacion: values.fecha_programacion,
                activo: values.estado == 'Inactivo' ? 'false' : 'true'
            });
        });
        return () => subscription.unsubscribe();
    }, [form]);

    return (

        <div>
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => form.reset()}
                    aria-label="Eliminar filtros"
                    className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition text-sm"
                    type="button"
                >
                    Eliminar filtros
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Controller
                    name="destinatario_tipo"
                    control={form.control}
                    render={({ field }) => (
                        <FilterDropdown
                            {...field}
                            label="Tipo Persona"
                            options={DESTINY_TYPES}
                        />
                    )}
                />

                <Controller
                    name="tipo_id"
                    control={form.control}
                    render={({ field }) => (
                        <FilterDropdownObject
                            {...field}
                            label="Tipo de Aviso"
                            labelKey="nombre"
                            idKey="id"
                            options={NOTICE_TYPES}
                        />
                    )}
                />

                <Controller
                    name="fecha_programacion"
                    control={form.control}
                    render={({ field }) => (
                        <DatePicker
                            selected={field.value}
                            onChange={field.onChange}
                            placeholderText="Fecha de Programación"
                        />
                    )}
                />

                <Controller
                    name="estado"
                    control={form.control}
                    render={({ field }) => (
                        <FilterDropdown
                            {...field}
                            label="Estado"
                            options={['Activo', 'Inactivo']}
                        />
                    )}
                />
            </div>
        </div>
    )
}
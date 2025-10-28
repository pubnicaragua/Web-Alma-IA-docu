import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { FilterDropdown } from "@/components/filter-dropdown";
import { FilterDropdownObject } from "@/components/filter-dropdown-object";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
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
            palabras_clave: ""
        }
    });

    useEffect(() => {
        const subscription = form.watch((values) => {
            setFilters(values);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    return (
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
                        options={DESTINY_TYPES}
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
                name="palabras_clave"
                control={form.control}
                render={({ field }) => (
                    <Input {...field} placeholder="Ejemplo: privacidad, seguridad, etc." />
                )}
            />
        </div>
    )
}
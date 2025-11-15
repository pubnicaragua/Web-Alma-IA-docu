import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FilterDropdown } from "@/components/filter-dropdown";
import { ISurveyCatalogs } from "@/types/surveys";
import { SURVEY_FREQUENCIES } from "@/constants/surveys";
import { FilterDropdownObject } from "@/components/filter-dropdown-object";
import { useAxios } from "@/hooks/use-axios";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

interface PropTypes {
    setFilters: (values: any) => void;
}

export function SurveyTableFilters({ setFilters }: Readonly<PropTypes>) {

    const [search, setSearch] = useState('');
    const catalogs = useAxios<ISurveyCatalogs>(() => window.axios.get(`/encuestas/catalogos`), []);

    const form = useForm({
        defaultValues: {
            tipo: null,
            estado: null,
            concepto: null,
            search: '',
            programacion_frecuencia: '',
            estado_activo: '',
            obligatoria: ''
        }
    });

    const searchDebounced = useDebounce(search, 400);

    useEffect(() => {
        form.setValue('search', searchDebounced);
    }, [searchDebounced]);

    useEffect(() => {
        const subscription = form.watch((values: any) => {
            setFilters({
                search: values.search || null,
                estado_id: values.estado?.encuesta_estado_id,
                tipo_id: values.tipo?.tipo_encuesta_id,
                concepto_id: values.concepto?.concepto_asociado_id,
                frecuencia: values.programacion_frecuencia,
                activo: values.estado_activo == 'Inactivo' ? 'false' : 'true',
                obligatoria: values.obligatoria == 'No' ? 'false' : 'true'
            });
        });
        return () => subscription.unsubscribe();
    }, [form]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="lg:col-span-2">
                <Input
                    placeholder="Buscar por nombre de encuesta"
                    value={search}
                    onChange={({target})=> setSearch(target?.value)}
                />

            </div>

            <Controller
                name="obligatoria"
                control={form.control}
                render={({ field }) => (
                    <FilterDropdown
                        {...field}
                        label="Obligatoria"
                        options={['Si', 'No']}
                    />
                )}
            />

            <Controller
                name="estado_activo"
                control={form.control}
                render={({ field }) => (
                    <FilterDropdown
                        {...field}
                        label="Estado Activo"
                        options={['Activo', 'Inactivo']}
                    />
                )}
            />

            <Controller
                name="estado"
                control={form.control}
                render={({ field }) => (
                    <FilterDropdownObject
                        {...field}
                        label="Estado Encuesta"
                        options={catalogs?.data?.estados || []}
                        labelKey="encuesta_estado_nombre"
                        idKey="encuesta_estado_id"
                    />
                )}
            />

            <Controller
                name="tipo"
                control={form.control}
                render={({ field }) => (
                    <FilterDropdownObject
                        {...field}
                        label="Tipo de Objetivo"
                        options={catalogs?.data?.tiposEncuesta || []}
                        labelKey="tipo_encuesta_nombre"
                        idKey="tipo_encuesta_id"
                    />
                )}
            />

            <Controller
                name="concepto"
                control={form.control}
                render={({ field }) => (
                    <FilterDropdownObject
                        {...field}
                        label="Concepto"
                        options={catalogs?.data?.conceptosAsociados || []}
                        labelKey="concepto_asociado_nombre"
                        idKey="concepto_asociado_id"

                    />
                )}
            />

            <Controller
                name="programacion_frecuencia"
                control={form.control}
                render={({ field }) => (
                    <FilterDropdown
                        {...field}
                        label="Frecuencia"
                        options={SURVEY_FREQUENCIES as unknown as string[]}
                    />

                )}
            />

        </div>
    )
}
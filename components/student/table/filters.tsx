import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form"
import { AgeRangeFilter } from "@/components/agerangefilter";
import { FilterDropdown } from "@/components/filter-dropdown";
import { useUser } from "@/middleware/user-context";
import { FilterDropdownObject } from "@/components/filter-dropdown-object";

interface PropTypes {
    setFilters: (filters: any) => void,
    setRefresh: () => void,
}

interface FilterValues {
    levelFilter: any | null;
    courseFilter: any | null;
    statusFilter: string;
    minAge: number | undefined;
    maxAge: number | undefined;
}

const statusOptions = ["Todos", "Activo", "Inactivo"];

export function StudentTableFilters({ setFilters, setRefresh }: Readonly<PropTypes>) {
    const { selectedSchoolId } = useUser();
    const [filtersLoading, setFiltersLoading] = useState(true);

    // Store ALL courses from API so we can filter them by level
    const [allCourses, setAllCourses] = useState<any[]>([]);
    const [levelOptions, setLevelOptions] = useState<{ grado_id: number | null, nombre: string }[]>([]);

    const form = useForm<FilterValues>({
        defaultValues: {
            levelFilter: null,
            courseFilter: null,
            statusFilter: "Activo",
            minAge: undefined,
            maxAge: undefined,
        }
    })

    const selectedLevel = form.watch("levelFilter");

    // Compute course options based on selected level
    const courseOptions = useMemo(() => {
        let filtered = allCourses;
        if (selectedLevel?.grado_id != null) {
            filtered = allCourses.filter(
                (c: any) => c.grados?.grado_id === selectedLevel.grado_id
            );
        }
        return [{ curso_id: null, nombre_curso: 'Todos' }, ...filtered];
    }, [allCourses, selectedLevel]);

    // Load courses and extract levels on mount
    useEffect(() => {
        if (!selectedSchoolId) return;
        (async function () {
            const courses = await window.axios.get(`/colegios/cursos`,
                { params: { colegio_id: selectedSchoolId } })
                .then((res: any) => res.data);
            const levels = [...new Map(courses.map((c: any) => [c.grados.grado_id, c.grados])).values()] as { grado_id: number | null, nombre: string }[];
            setAllCourses(courses);
            setLevelOptions([{ grado_id: null, nombre: 'Todos' }, ...levels]);
            setFiltersLoading(false);
        })();
    }, [selectedSchoolId]);

    // When level changes, reset course selection if it doesn't belong to the new level
    useEffect(() => {
        const currentCourse = form.getValues("courseFilter");
        if (currentCourse?.curso_id != null && selectedLevel?.grado_id != null) {
            const courseStillValid = allCourses.some(
                (c: any) => c.curso_id === currentCourse.curso_id && c.grados?.grado_id === selectedLevel.grado_id
            );
            if (!courseStillValid) {
                form.setValue("courseFilter", null);
            }
        }
    }, [selectedLevel, allCourses, form]);

    // Build and emit filters whenever form values change
    // These filters are applied client-side since the backend doesn't support them as query params
    useEffect(() => {
        const subscription = form.watch((values) => {
            setFilters({
                levelName: values?.levelFilter?.nombre ?? null,
                courseName: values?.courseFilter?.nombre_curso ?? null,
                minAge: values?.minAge ?? null,
                maxAge: values?.maxAge ?? null,
                status: values?.statusFilter ?? "Activo",
            });
        });
        return () => subscription.unsubscribe();
    }, [form, setFilters]);

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => setRefresh()}
                    aria-label="Refrescar datos"
                    className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition text-sm"
                    type="button"
                >
                    Refrescar
                </button>
                <button
                    onClick={() => form.reset()}
                    aria-label="Eliminar filtros"
                    className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition text-sm"
                    type="button"
                >
                    Eliminar filtros
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Controller
                    name="levelFilter"
                    control={form.control}
                    render={({ field }) => (
                        <FilterDropdownObject
                            {...field}
                            label="Nivel"
                            labelKey="nombre"
                            idKey="grado_id"
                            options={levelOptions}
                            disabled={filtersLoading}
                        />
                    )}
                />

                <Controller
                    name="courseFilter"
                    control={form.control}
                    render={({ field }) => (
                        <FilterDropdownObject
                            {...field}
                            label="Curso"
                            labelKey="nombre_curso"
                            idKey="curso_id"
                            options={courseOptions}
                            disabled={filtersLoading}
                        />
                    )}
                />

                <AgeRangeFilter
                    label="Edad"
                    minAge={form.watch("minAge")}
                    maxAge={form.watch("maxAge")}
                    onRangeChange={(min: number | null, max: number | null) => {
                        form.setValue("minAge", min ?? undefined);
                        form.setValue("maxAge", max ?? undefined);
                    }}
                />

                <Controller
                    name="statusFilter"
                    control={form.control}
                    render={({ field }) => (
                        <FilterDropdown
                            {...field}
                            label="Estado"
                            options={statusOptions}
                            disabled={filtersLoading}
                        />
                    )}
                />
            </div>
        </div>
    )
}
import { FormError } from "@/components/form/form-error"
import { Label } from "@/components/ui/label"
import { Controller } from "react-hook-form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/middleware/user-context";
import { usePaginationSR } from "@/hooks/use-pagination-sr";
import { ApiStudent } from "@/services/students-service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { SSRPagination } from "@/components/utils/pagination-sr";
import { Input } from "@/components/ui/input";
import { DESTINY_TYPES, NOTICE_TYPES } from "@/constants/notices";

export function SurveyFormDestiny({ form, metaInit }: any) {

    const { selectedSchoolId } = useUser();
    const [isCatalogLoading, setCatalogLoading] = useState(false);

    const [courses, setCourses] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);

    const [selectAlumnos, setSelectAlumnos] = useState<any[]>([]);
    const [searchAlumno, setSearchAlumno] = useState<string>('');
    const [filters, setFilters] = useState(metaInit ?? {
        colegio_id: '',
        curso_id: '',
        grado_id: '',
        shourh: ''
    });

    const noticeTypeId = form.watch('destinatarios.tipo_id');
    const destinyIds = form.watch('destinatarios.destinatarios');

    const pagination = usePaginationSR<ApiStudent>({
        route: "/alumnos",
        filters: filters,
        perPage: 10,
        enabled: Boolean(filters.curso_id) && noticeTypeId == 4 && Boolean(selectedSchoolId)
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFilters((prev: any) => ({ ...prev, shourh: searchAlumno }));
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchAlumno]);

    useEffect(() => {
        if (!noticeTypeId) return;
        if (!form.formState.isDirty) return;
        setFilters({
            colegio_id: selectedSchoolId ?? '',
            curso_id: '',
            grado_id: '',
            shourh: ''
        });
        setSelectAlumnos([]);
    }, [noticeTypeId]);

    useEffect(() => {
        if (form.formState.isDirty) return;
        if (!destinyIds.length) return;
        setSelectAlumnos(destinyIds);
    }, [])

    useEffect(() => {
        const { colegio_id } = filters;
        setCatalogLoading(true);
        (async function () {
            const response = await window.axios.get(`/colegios/cursos`,
                {
                    params: { colegio_id: colegio_id || selectedSchoolId }
                });
            const { data: courses } = response;
            const grades = [...new Map(courses.map((c: any) => [c.grados.grado_id, c.grados])).values()] as { grado_id: number | null, nombre: string }[];
            setCourses(courses);
            setGrades(grades);
            setCatalogLoading(false);
        })();
    }, [filters.colegio_id, selectedSchoolId]);

    useEffect(() => {
        const fieldName = 'destinatarios.destinatarios'
        let fieldValue: number[] = [];
        switch (noticeTypeId) {
            case 1:
                fieldValue = [Number(filters.colegio_id)];
                break;
            case 2:
                fieldValue = [Number(filters.grado_id)];
                break;
            case 3:
                fieldValue = [Number(filters.curso_id)];
                break;
            case 4:
                fieldValue = selectAlumnos.map((i) => Number(i));
                break;
            default:
                fieldValue = [];
                break;
        }
        form.setValue(fieldName, fieldValue);
    }, [noticeTypeId, filters, selectAlumnos]);

    const alumnos = useMemo(() => {
        let list = pagination.data.map((student) => ({
            alumno_id: student.alumno_id,
            nombre_completo: `${student.personas.nombres} ${student.personas.apellidos}`,
        })) || [];
        
        list.sort((a, b) => {
            const isASelected = selectAlumnos.includes(a.alumno_id);
            const isBSelected = selectAlumnos.includes(b.alumno_id);
            if (isASelected && !isBSelected) return -1;
            if (!isASelected && isBSelected) return 1;
            return a.nombre_completo.localeCompare(b.nombre_completo);
        });
        
        return list;
    }, [pagination.data, selectAlumnos]);

    const filteredCourses = useMemo(() => {
        if (!courses.length) return [];
        return courses.filter((course) => course.grados.grado_id == filters.grado_id);
    }, [courses, filters.grado_id]);

    return (
        <fieldset className="border border-gray-300 p-4 rounded-lg">
            <legend className="text-lg font-semibold px-2">Destinatarios</legend>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm text-gray-500">Tipo Persona</Label>
                    <Controller
                        name="destinatarios.destinatario_tipo"
                        control={form.control}
                        render={({ field }) => (
                            <Select
                                value={field.value ? String(field.value) : ''}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione el Tipo de Destinatario" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DESTINY_TYPES.map((tipo, index) => (
                                        <SelectItem
                                            key={tipo}
                                            value={String(index + 1)}
                                            className="text-capitalize"
                                        >
                                            {tipo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <FormError message={form.formState.errors.destinatarios?.destinatario_tipo?.message} />
                </div>
                <div>
                    <Label className="text-sm text-gray-500">Objetivo</Label>
                    <Controller
                        name="destinatarios.tipo_id"
                        control={form.control}
                        render={({ field }) => (
                            <Select {...field}
                                value={Number(field.value) ? String(field.value) : ''}
                                onValueChange={(value) => field.onChange(Number(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione el Tipo de Objetivo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {NOTICE_TYPES.map((tipo) => (
                                        <SelectItem key={tipo.id} value={String(tipo.id)}>
                                            {tipo.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <FormError message={form.formState.errors.destinatarios?.tipo_id?.message} />
                </div>

                {noticeTypeId >= 2 && (
                    <div className={`col-span-${noticeTypeId > 2 ? 1 : 2}`}>
                        <Label className="text-sm text-gray-500">Grado</Label>
                        <Select
                            onValueChange={(val: string) => setFilters({ ...filters, grado_id: val })}
                            value={filters.grado_id}
                            disabled={isCatalogLoading}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccione el Grado" />
                            </SelectTrigger>
                            <SelectContent>
                                {grades.map((tipo: any) => (
                                    <SelectItem key={tipo.grado_id} value={String(tipo.grado_id)}>
                                        {tipo.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {noticeTypeId >= 3 && (
                    <div className={`col-span-1`}>
                        <Label className="text-sm text-gray-500">Curso</Label>
                        <Select
                            onValueChange={(val: string) => setFilters({ ...filters, curso_id: val })}
                            value={filters.curso_id}
                            disabled={isCatalogLoading || !filters.grado_id}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={`${!filters.grado_id ? 'Seleccione Primero el Grado' : 'Seleccione el Curso'}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredCourses.map((tipo: any) => (
                                    <SelectItem key={tipo.curso_id} value={String(tipo.curso_id)}>
                                        {tipo.nombre_curso}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {noticeTypeId == 4 && (
                    <div className="col-span-2">
                        <div className="w-full">
                            <div className="mb-4">
                                <Input
                                    placeholder="Buscar alumno por nombre..."
                                    value={searchAlumno}
                                    onChange={(e) => setSearchAlumno(e.target.value)}
                                    className="max-w-sm"
                                    disabled={!Boolean(filters.curso_id) || isCatalogLoading}
                                />
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-1/12">Selección</TableHead>
                                        <TableHead>Nombre Alumno</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!Boolean(filters.curso_id) ? (
                                        <TableRow>
                                            <TableCell colSpan={2}>
                                                <div className="text-center">
                                                    Favor Seleccione un Curso
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {pagination.loading && (
                                                <TableRow>
                                                    <TableCell colSpan={2}>
                                                        <div className="flex justify-center">
                                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {!pagination.loading && !alumnos.length && (
                                                <TableRow>
                                                    <TableCell colSpan={2}>
                                                        <div className="flex justify-center">
                                                            No se encontraron alumnos
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {!pagination.loading && alumnos.length > 0 && (
                                                <>
                                                    {alumnos.map((alumno) => (
                                                        <TableRow key={alumno.alumno_id}>
                                                            <TableCell className="flex justify-center">
                                                                <Checkbox
                                                                    checked={selectAlumnos.includes(alumno.alumno_id)}
                                                                    onClick={() => {
                                                                        const newSelectedAlumnos = selectAlumnos.includes(alumno.alumno_id)
                                                                            ? selectAlumnos.filter((id) => id !== alumno.alumno_id)
                                                                            : [...selectAlumnos, alumno.alumno_id];
                                                                        setSelectAlumnos(newSelectedAlumnos);
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {alumno.nombre_completo}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </>
                                            )}
                                        </>
                                    )}

                                </TableBody>
                            </Table>
                            {Boolean(alumnos.length) && (
                                <SSRPagination pagination={pagination} />
                            )}
                        </div>
                    </div>
                )}
            </div>

        </fieldset>


    )
}
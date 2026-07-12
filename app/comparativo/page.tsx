"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { BarChartComparisonCategory } from "@/components/bar-chart-comparison-category";
import { BarChartComparisonPatologie } from "@/components/bar-chart-comparison-patologie";
import { BarChartComparisonNeurodivergenceGrade } from "@/components/bar-chart-comparison-neurodivergence-grade";
import { FilterDropdown } from "@/components/filter-dropdown";
import { FilterDropdownObject } from "@/components/filter-dropdown-object";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Grade } from "@/services/grade-service";
import { fetchCoursesForSchool, type SchoolCourse } from "@/services/course-service";
import { useUser } from "@/middleware/user-context";
import { Download } from "lucide-react";

export default function ComparativePage() {
  const { selectedSchoolId } = useUser();
  // Estados para los filtros
  const [levelAFilter, setLevelAFilter] = useState<Grade>({
    grado_id: 1,
    nombre: "Primero",
    creado_por: 1,
    estado: "activo",
  });
  const [levelBFilter, setLevelBFilter] = useState<Grade>({
    grado_id: 1,
    nombre: "Primero",
    creado_por: 1,
    estado: "activo",
  });
  const [courseAFilter, setCourseAFilter] = useState<SchoolCourse | null>(null);
  const [courseBFilter, setCourseBFilter] = useState<SchoolCourse | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("2025");
  const [monthFilter, setMonthFilter] = useState<string>("Abril");

  // Opciones para los filtros
  const [levelOptions, setLevelOptions] = useState<Grade[]>([]);
  const [allCourses, setAllCourses] = useState<SchoolCourse[]>([]);

  const courseAOptions = useMemo(() =>
    allCourses.filter(
      (course) => course.grados?.grado_id === levelAFilter?.grado_id
    ), [allCourses, levelAFilter]);
  const courseBOptions = useMemo(() =>
    allCourses.filter(
      (course) => course.grados?.grado_id === levelBFilter?.grado_id
    ), [allCourses, levelBFilter]);
  const yearOptions = ["2023", "2024", "2025"];
  const monthOptions = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const loadData = async (schoolId: string) => {
    try {
      const courses = await fetchCoursesForSchool(schoolId);
      const grades = Array.from(
        new Map(
          courses
            .filter((course) => course.grados)
            .map((course) => [course.grados!.grado_id, course.grados!])
        ).values()
      );
      setAllCourses(courses);
      setLevelOptions(grades);
      setLevelAFilter((current) =>
        grades.some((grade) => grade.grado_id === current.grado_id)
          ? current
          : grades[0] ?? current
      );
      setLevelBFilter((current) =>
        grades.some((grade) => grade.grado_id === current.grado_id)
          ? current
          : grades[1] ?? grades[0] ?? current
      );
      setCourseAFilter(null);
      setCourseBFilter(null);
    } catch (err) {
      setAllCourses([]);
      setLevelOptions([]);
      setCourseAFilter(null);
      setCourseBFilter(null);
    }
  };

  useEffect(() => {
    if (!selectedSchoolId) return;
    loadData(selectedSchoolId);
  }, [selectedSchoolId]);

  useEffect(() => {
    setCourseAFilter((current) =>
      current && courseAOptions.some((course) => course.curso_id === current.curso_id)
        ? current
        : courseAOptions[0] ?? null
    );
  }, [courseAOptions]);

  useEffect(() => {
    setCourseBFilter((current) =>
      current && courseBOptions.some((course) => course.curso_id === current.curso_id)
        ? current
        : courseBOptions[0] ?? null
    );
  }, [courseBOptions]);

  useEffect(() => {
    if (courseAFilter?.curso_id && courseAFilter.curso_id === courseBFilter?.curso_id) {
      setCourseBFilter(
        courseBOptions.find((course) => course.curso_id !== courseAFilter.curso_id) ?? null
      );
    }
  }, [courseAFilter, courseBFilter, courseBOptions]);

  // Función para imprimir la sección de comparativos (nativa)
  const comparativoRef = useRef<HTMLDivElement>(null);
  const handlePrintComparison = () => {
    if (!comparativoRef.current) return;

    const printContents = comparativoRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // recarga para restaurar estado React
  };

  const isMobile = useIsMobile();

  return (
    <AppLayout>
      <div className="container mx-auto px-3 sm:px-6 py-8" ref={comparativoRef}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Comparativos</h2>
          <Button
            onClick={handlePrintComparison}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Imprimir comparación</span>
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <FilterDropdownObject
            label="Nivel A"
            options={levelOptions}
            value={levelAFilter}
            onChange={setLevelAFilter}
            labelKey="nombre"
            idKey="grado_id"
          />
          <FilterDropdownObject
            label="Curso A"
            options={courseAOptions}
            value={courseAFilter ?? courseAOptions[0]}
            onChange={setCourseAFilter}
            labelKey="nombre_curso"
            idKey="curso_id"
          />
          <FilterDropdownObject
            label="Nivel B"
            options={levelOptions}
            value={levelBFilter}
            onChange={setLevelBFilter}
            labelKey="nombre"
            idKey="grado_id"
          />
          <FilterDropdownObject
            label="Curso B"
            options={courseBOptions}
            value={courseBFilter ?? courseBOptions[0]}
            onChange={setCourseBFilter}
            labelKey="nombre_curso"
            idKey="curso_id"
          />
          <FilterDropdown
            label="Año"
            options={yearOptions}
            value={yearFilter}
            onChange={setYearFilter}
          />
          <FilterDropdown
            label="Mes"
            options={monthOptions}
            value={monthFilter}
            onChange={setMonthFilter}
          />
        </div>

        {/* Gráficos de barras */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <BarChartComparisonCategory
            title="Emociones"
            gradoA={levelAFilter?.grado_id}
            gradoB={levelBFilter?.grado_id}
            courseAName={courseAFilter?.nombre_curso ?? null}
            courseBName={courseBFilter?.nombre_curso ?? null}
          />
          <BarChartComparisonPatologie
            title="Patologías"
            gradoA={levelAFilter?.grado_id}
            gradoB={levelBFilter?.grado_id}
            courseAName={courseAFilter?.nombre_curso ?? null}
            courseBName={courseBFilter?.nombre_curso ?? null}
          />
          <BarChartComparisonNeurodivergenceGrade
            title="Neurodivergencias"
            gradoA={levelAFilter?.grado_id}
            gradoB={levelBFilter?.grado_id}
            courseAName={courseAFilter?.nombre_curso ?? null}
            courseBName={courseBFilter?.nombre_curso ?? null}
          />
        </div>

        {/* Alertas del período y Gestor Historial ocultos: este módulo compara cursos. */}
      </div>
    </AppLayout>
  );
}

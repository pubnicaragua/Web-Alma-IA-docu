"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { BarChartComparisonCategory } from "@/components/bar-chart-comparison-category";
import { BarChartComparisonPatologie } from "@/components/bar-chart-comparison-patologie";
import { FilterDropdown } from "@/components/filter-dropdown";
import { FilterDropdownObject } from "@/components/filter-dropdown-object";
import { LineChartComparison } from "@/components/line-chart-comparison";
import { LineChartHistory } from "@/components/line-chart-history";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Grade } from "@/services/grade-service";
import { fetchCoursesForSchool, type SchoolCourse } from "@/services/course-service";
import { useUser } from "@/middleware/user-context";
import { Download } from "lucide-react";

export default function ComparativePage() {
  const { selectedSchoolId } = useUser();
  // Estados para los filtros
  const [levelFilter, setLevelFilter] = useState<Grade>({
    grado_id: 1,
    nombre: "Primero",
    creado_por: 1,
    estado: "activo",
  });
  const [courseFilter, setCourseFilter] = useState<SchoolCourse | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("2025");
  const [monthFilter, setMonthFilter] = useState<string>("Abril");

  // Opciones para los filtros
  const [levelOptions, setLevelOptions] = useState<Grade[]>([]);
  const [allCourses, setAllCourses] = useState<SchoolCourse[]>([]);

  const courseOptions = useMemo(() => [
    { curso_id: 0, nombre_curso: "Todos", grados: levelFilter },
    ...allCourses.filter(
      (course) => course.grados?.grado_id === levelFilter?.grado_id
    ),
  ], [allCourses, levelFilter]);
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
      setLevelFilter((current) =>
        grades.some((grade) => grade.grado_id === current.grado_id)
          ? current
          : grades[0] ?? current
      );
      setCourseFilter(null);
    } catch (err) {
      setAllCourses([]);
      setLevelOptions([]);
      setCourseFilter(null);
    }
  };

  useEffect(() => {
    if (!selectedSchoolId) return;
    loadData(selectedSchoolId);
  }, [selectedSchoolId]);

  useEffect(() => {
    if (
      courseFilter?.curso_id &&
      courseFilter.grados?.grado_id !== levelFilter?.grado_id
    ) {
      setCourseFilter(null);
    }
  }, [courseFilter, levelFilter]);

  // ESTADOS INDEPENDIENTES para los cursos seleccionados en cada gráfico de líneas
  const [selectedCoursesComparison, setSelectedCoursesComparison] = useState<
    string[]
  >(["vencidas", "atendidas"]);
  const [selectedCoursesHistory, setSelectedCoursesHistory] = useState<
    string[]
  >(["vencidas", "atendidas"]);

  const handleToggleCourseComparison = (course: string) => {
    if (selectedCoursesComparison.includes(course)) {
      setSelectedCoursesComparison(
        selectedCoursesComparison.filter((c) => c !== course)
      );
    } else {
      setSelectedCoursesComparison([...selectedCoursesComparison, course]);
    }
  };
  const handleToggleCourseHistory = (course: string) => {
    if (selectedCoursesHistory.includes(course)) {
      setSelectedCoursesHistory(
        selectedCoursesHistory.filter((c) => c !== course)
      );
    } else {
      setSelectedCoursesHistory([...selectedCoursesHistory, course]);
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <FilterDropdownObject
            label="Nivel"
            options={levelOptions}
            value={levelFilter}
            onChange={setLevelFilter}
            labelKey="nombre"
            idKey="grado_id"
          />
          <FilterDropdownObject
            label="Curso"
            options={courseOptions}
            value={courseFilter ?? courseOptions[0]}
            onChange={setCourseFilter}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BarChartComparisonCategory
            title="Emociones"
            grado={levelFilter?.grado_id}
            courseName={courseFilter?.curso_id ? courseFilter.nombre_curso : null}
          />
          <BarChartComparisonPatologie
            title="Patologias"
            grado={levelFilter?.grado_id}
            courseName={courseFilter?.curso_id ? courseFilter.nombre_curso : null}
          />
        </div>

        {/* Gráficos de líneas, cada uno con su estado independiente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="mb-6">
            <LineChartComparison
              title="Gestor Alertas Hoy"
              selectedCourses={selectedCoursesComparison}
              onToggleCourse={handleToggleCourseComparison}
            />
          </div>
          <div className="mb-6">
            <LineChartHistory
              title="Gestor Historial"
              selectedCourses={selectedCoursesHistory}
              onToggleCourse={handleToggleCourseHistory}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

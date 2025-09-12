"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchStudents, type Student } from "@/services/students-service";
import { searchStudents } from "@/services/header-service";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table";
import { FilterDropdown } from "@/components/filter-dropdown";
import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AgeRangeFilter } from "../agerangefilter";
import { useUser } from "@/middleware/user-context";

export function StudentsContent() {
  const { selectedSchoolId } = useUser();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [levelFilter, setLevelFilter] = useState<string>("Todos");
  const [courseFilter, setCourseFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");

  const [levelOptions, setLevelOptions] = useState<string[]>(["Todos"]);
  const [courseOptions, setCourseOptions] = useState<string[]>(["Todos"]);
  const [statusOptions, setStatusOptions] = useState<string[]>(["Todos"]);
  const [minAge, setMinAge] = useState<number>();
  const [maxAge, setMaxAge] = useState<number>();

  const [currentPage, setCurrentPage] = useState(1);

  // Control to know if we should load search or normal students
  const [useSearch, setUseSearch] = useState<boolean>(!!searchParam);

  // Updated load function to accept param whether to use search or fetchStudents
  const loadStudents = async (useSearchParam = true) => {
    try {
      setIsLoading(true);
      setError(null);

      let data: Student[];
      if (useSearchParam && searchParam) {
        data = await searchStudents(searchParam, selectedSchoolId!);
      } else {
        data = await fetchStudents(selectedSchoolId!);
      }

      const uniqueLevels = Array.from(new Set(data.map((s) => s.level)));
      const uniqueCourses = Array.from(new Set(data.map((s) => s.course)));
      const uniqueStatuses = Array.from(new Set(data.map((s) => s.status)));

      setLevelOptions(["Todos", ...uniqueLevels]);
      setCourseOptions(["Todos", ...uniqueCourses]);
      setStatusOptions(["Todos", ...uniqueStatuses]);

      setStudents(data);
      setUseSearch(useSearchParam && !!searchParam);
    } catch (err) {
      setError("No se pudieron cargar los datos.");
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron cargar los datos de estudiantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents(!!searchParam);
  }, [searchParam, selectedSchoolId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchParam, levelFilter, courseFilter, minAge, maxAge, statusFilter]);

  const filteredStudents = useMemo(() => {
    if (!students.length) return [];
    return students.filter(
      (s) =>
        (levelFilter === "Todos" || s.level === levelFilter) &&
        (courseFilter === "Todos" || s.course === courseFilter) &&
        (!minAge || s.age >= minAge) &&
        (!maxAge || s.age <= maxAge) &&
        (statusFilter === "Todos" || s.status === statusFilter)
    );
  }, [students, levelFilter, courseFilter, statusFilter, minAge, maxAge]);

  const columns = [
    { key: "name", title: "Alumno" },
    { key: "level", title: "Nivel" },
    { key: "course", title: "Curso" },
    { key: "age", title: "Edad" },
    { key: "status", title: "Estado" },
  ];

  const handleStudentClick = (student: Student) => {
    router.push(`/alumnos/${student.id}`);
  };

  const renderCell = (student: Student, column: { key: string }) => {
    switch (column.key) {
      case "name":
        return (
          <div
            className="flex items-center space-x-3 cursor-pointer hover:text-blue-500"
            onClick={() => handleStudentClick(student)}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={student.image || "/placeholder.svg"}
                alt={student.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <span>{student.name}</span>
          </div>
        );
      case "age":
        return `${student.age} años`;
      default:
        return student[column.key as keyof Student];
    }
  };

  const resetFilters = async () => {
    setLevelFilter("Todos");
    setCourseFilter("Todos");
    setStatusFilter("Todos");
    setMinAge(undefined);
    setMaxAge(undefined);

    // Load unfiltered students ignoring search param
    await loadStudents(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando alumnos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => loadStudents(useSearch)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          <RefreshCw className="w-4 h-4 mr-2 inline" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => loadStudents(useSearch)}
          aria-label="Refrescar datos"
          className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition text-sm"
          type="button"
        >
          Refrescar
        </button>
        <button
          onClick={resetFilters}
          aria-label="Eliminar filtros"
          className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition text-sm"
          type="button"
        >
          Eliminar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <FilterDropdown
          label="Nivel"
          options={levelOptions}
          value={levelFilter}
          onChange={setLevelFilter}
        />
        <FilterDropdown
          label="Curso"
          options={courseOptions}
          value={courseFilter}
          onChange={setCourseFilter}
        />
        <AgeRangeFilter
          label="Edad"
          minAge={minAge}
          maxAge={maxAge}
          onRangeChange={(min, max) => {
            setMinAge(min);
            setMaxAge(max);
          }}
        />
        <FilterDropdown
          label="Estado"
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Mostrando {filteredStudents.length} alumno(s)
      </p>

      <DataTable
        columns={columns}
        data={filteredStudents}
        renderCell={renderCell}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        pageSize={25}
        className="mt-4"
      />
    </>
  );
}

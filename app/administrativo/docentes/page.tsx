"use client";

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { FilterDropdown } from "@/components/filter-dropdown";
import { DataTable } from "@/components/data-table";
import { Pagination } from "@/components/pagination";
import {
  AddTeacherModal,
  AddTeacherModalProps,
} from "@/components/teacher/add-teacher-modal";
import { type Teacher, getAllTeachers } from "@/services/teachers-service";
import { TeachersListSkeleton } from "@/components/teacher/teachers-list-skeleton";
import { equalsIgnoreCase } from "@/lib/utils";

export default function TeachersPage() {
  return (
    <Suspense fallback={null}>
      <TeachersPageContent />
    </Suspense>
  );
}

function TeachersPageContent() {
  const router = useRouter();

  // Estados para los datos y la carga
  const [teachersData, setTeachersData] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para los filtros
  const [nameFilter, setNameFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Cargar datos de docentes
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllTeachers();
        setTeachersData(data || []);
      } catch (err) {
        setError(
          "No se pudieron cargar los datos de docentes. Por favor, intenta de nuevo más tarde."
        );
        setTeachersData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Memoizar las opciones de filtro para mejor rendimiento
  const [subjectOptions, statusOptions] = useMemo(() => {
    const subjects = new Set<string>();
    const statuses = new Set<string>();

    teachersData.forEach((teacher) => {
      if (teacher.subject) subjects.add(teacher.subject);
      if (teacher.status) statuses.add(teacher.status);
    });

    return [
      ["Todos", ...subjects],
      ["Todos", ...statuses],
    ];
  }, [teachersData]);

  // Filtrar los datos según los filtros seleccionados
  const filteredTeachers = useMemo(() => {
    return teachersData.filter((teacher) => {
      const matchesName = teacher.name
        .toLowerCase()
        .includes(nameFilter.toLowerCase());
      const matchesSubject =
        subjectFilter === "Todos" || teacher.subject === subjectFilter;
      const matchesStatus =
        statusFilter === "Todos" || teacher.status === statusFilter;

      return matchesName && matchesSubject && matchesStatus;
    });
  }, [teachersData, nameFilter, subjectFilter, statusFilter]);

  // Calcular el total de páginas
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  // Paginar los datos
  const paginatedTeachers = useMemo(() => {
    return filteredTeachers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredTeachers, currentPage, itemsPerPage]);

  // Columnas para la tabla
  const columns = useMemo(
    () => [
      { key: "name", title: "Docente" },
      { key: "subject", title: "Especialidad" },
      { key: "school", title: "Colegio" },
      { key: "status", title: "Estado" },
    ],
    []
  );

  // Función para navegar a la vista detallada del docente
  const handleTeacherClick = useCallback(
    (teacher: Teacher) => {
      router.push(`/administrativo/docentes/${teacher.id}`);
    },
    [router]
  );

  // Renderizar celdas de la tabla
  const renderCell = useCallback(
    (teacher: Teacher, column: { key: string; title: string }) => {
      switch (column.key) {
        case "name":
          return (
            <div
              className="flex items-center space-x-3 cursor-pointer hover:text-blue-500"
              onClick={() => handleTeacherClick(teacher)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={teacher.image || "https://avatar.iran.liara.run/public"}
                  alt={teacher.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  priority={false}
                />
              </div>
              <span>{teacher.name}</span>
            </div>
          );
        case "status":
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                equalsIgnoreCase(teacher.status, "Activo")
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {teacher.status}
            </span>
          );
        default:
          return teacher[column.key as keyof Teacher] || "-";
      }
    },
    [handleTeacherClick]
  );

  // Función para agregar un nuevo docente
  const handleAddTeacher = useCallback<AddTeacherModalProps["onAddTeacher"]>(
    (teacherInput) => {
      let schoolName = "Colegio";
      if (typeof window !== "undefined") {
        try {
          const schoolData = localStorage.getItem("schoolData");
          if (schoolData) {
            const parsed = JSON.parse(schoolData);
            schoolName = parsed.nombre || "Colegio";
          }
        } catch (e) {
          console.error("Error reading schoolData from localStorage:", e);
        }
      }

      const newTeacher: Teacher = {
        id: Date.now().toString(),
        name: `${teacherInput.nombres} ${teacherInput.apellidos}`,
        subject: teacherInput.especialidad,
        status: teacherInput.estado,
        school: schoolName,
        email: teacherInput.email,
        image: "https://avatar.iran.liara.run/public",
      };

      setTeachersData((prev) => [newTeacher, ...prev]);
    },
    []
  );

  // Mostrar skeleton mientras se cargan los datos
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-3 sm:px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Docentes</h2>
          </div>
          <TeachersListSkeleton />
        </div>
      </AppLayout>
    );
  }

  // Mostrar mensaje de error si hay algún problema
  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-3 sm:px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Docentes</h2>
          </div>
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-3 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Docentes</h2>
          <div className="flex justify-end">
            <AddTeacherModal onAddTeacher={handleAddTeacher} isMobile={true} />
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-1">
            <label
              htmlFor="nameFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Buscar por nombre
            </label>
            <input
              id="nameFilter"
              type="text"
              placeholder="Buscar docente..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidad
            </label>
            <FilterDropdown
              label="Especialidad"
              options={subjectOptions}
              value={subjectFilter}
              onChange={setSubjectFilter}
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <FilterDropdown
              label="Estado"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full"
            />
          </div>
        </div>

        {/* Mensaje si no hay docentes */}
        {filteredTeachers.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
            No se encontraron docentes con los filtros seleccionados.
          </div>
        ) : (
          <>
            {/* Tabla de docentes */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <DataTable
                columns={columns}
                data={paginatedTeachers}
                pageSize={itemsPerPage}
                renderCell={renderCell}
              />
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

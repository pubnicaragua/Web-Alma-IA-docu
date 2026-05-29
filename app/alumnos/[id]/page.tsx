"use client";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Calendar,
  FileText, Smile,
  User,
} from "lucide-react";
import Image from "next/image";
import { AppLayout } from "@/components/layout/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentAlerts } from "@/components/student/student-alerts";
import { StudentReports } from "@/components/student/student-reports";
import { StudentSkeleton } from "@/components/student/student-skeleton";
import { BarChartComparisonAlumno } from "@/components/bar-chart-comparison-alumno";
import { VerifyAccess } from "@/components/authentication/verify-access";
import { ComparisonChart } from "@/components/comparison-chart";
import ErrorBoundary from "@/components/utils/error-bountdry";
import { useAxios } from "@/hooks/use-axios";
import { useUser } from "@/middleware/user-context";
import type { StudentDetailResponse } from "@/services/students-service";
import { StudentDetailEvents } from "@/components/student/detail-sections/events";
import { StudentDetailAlerts } from "@/components/student/detail-sections/alerts";
import { StudentDetailInfo } from "@/components/student/detail-sections/information";

const generateNameFromEmail = (email?: string | null) => {
  if (!email) return "Estudiante";

  const parts = email.split("@")[0].split(".");
  if (parts.length > 1) {
    return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
      }`;
  }
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
};

const getStudentDisplayName = (student?: StudentDetailResponse["alumno"] | null) => {
  const nombres = student?.personas?.nombres?.trim();
  const apellidos = student?.personas?.apellidos?.trim();
  const fullName = [nombres, apellidos].filter(Boolean).join(" ").trim();

  return fullName || generateNameFromEmail(student?.email);
};


export default function StudentDetailPage() {
  const { id } = useParams();
  const { getFuntions, selectedSchoolId } = useUser();
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([
    "Tristeza",
    "Felicidad",
    "Estrés",
    "Ansiedad",
    "Enojo",
    "Otros",
  ]);

  const fetchStudentValue = useCallback(async () => {
    if (!selectedSchoolId) return;
    return window.axios.get(`/alumnos/detalle/${id}`, {
      params: {
        colegio_id: selectedSchoolId
      }
    })
  }, [id, selectedSchoolId]);

  const {
    loading: isLoading,
    data: studentDetails,
    refetch,
    error
  } = useAxios<StudentDetailResponse>(fetchStudentValue, [id, selectedSchoolId])

  const handleToggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter((e) => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };

  const emociones = useMemo(() => {
    if (!studentDetails?.emociones) return []
    return studentDetails.emociones.map((emocion: any) => ({
      name: emocion.nombre,
      value: emocion?.cantidad,
      color: "",
    }));
  }, [studentDetails?.emociones]);


  const comparativa = useMemo(() => {
    if (!studentDetails?.datosComparativa) return [];
    return studentDetails.datosComparativa.map((data:any) => ({
      name: data.nombre,
      alumno: data?.cantidad_alumno,
      promedio: data?.proporcion_alumno,
    }));
  }, [studentDetails?.datosComparativa]);

  const firstCourseId = studentDetails?.alumno?.cursos?.[0]?.curso_id;
  const studentName = getStudentDisplayName(studentDetails?.alumno);
  const studentEmail = studentDetails?.alumno?.email || "No disponible";
  const schoolName = studentDetails?.alumno?.colegios?.nombre || "No disponible";

  return (
    <ErrorBoundary>
      <VerifyAccess permission="Ficha Alumno">
        <AppLayout>
          <>
            {isLoading && <StudentSkeleton />}
            {!studentDetails && !isLoading && !selectedSchoolId && (
              <div className="container mx-auto px-2 sm:px-6 py-4 sm:py-8">
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm p-6 border border-red-200">
                  <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                  <p className="text-xl text-gray-700 mb-2">
                    No se encontró información del alumno
                  </p>
                  <p className="text-sm text-gray-500">
                    {error || "Intente nuevamente más tarde"}
                  </p>
                </div>
              </div>
            )}
            {studentDetails && !isLoading && (
              <div className="container mx-auto px-2 sm:px-6 py-4 sm:py-8">
                {/* Zona 1: Información principal del estudiante */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-blue-200">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-blue-100">
                      <Image
                        src={studentDetails.alumno?.url_foto_perfil || "/placeholder.svg"}
                        alt={studentName}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <h1 className="text-3xl font-bold text-gray-800">{studentName}</h1>
                      <div className="flex flex-wrap gap-4">
                        <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          Colegio:{" "}
                          <span className="font-bold">{schoolName}</span>
                        </div>
                        <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Email: {studentEmail}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zona 2: Pestañas de navegación */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-blue-200">
                  <Tabs defaultValue="ficha" className="w-full">
                    <TabsList className="bg-blue-100 w-full justify-start overflow-x-auto flex-nowrap whitespace-nowrap">
                      <TabsTrigger
                        value="ficha"
                        className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center text-xs sm:text-sm px-2 sm:px-4"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Ficha
                      </TabsTrigger>
                      {getFuntions("Ficha Alumno->Alertas") &&
                        getFuntions("Alertas") ? (
                        <TabsTrigger
                          value="alertas"
                          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center text-xs sm:text-sm px-2 sm:px-4"
                        >
                          <Bell className="h-4 w-4 mr-2" />
                          Alertas
                        </TabsTrigger>
                      ) : null}

                      {getFuntions("Ficha Alumno->Informes") ? (
                        <TabsTrigger
                          value="informes"
                          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center text-xs sm:text-sm px-2 sm:px-4"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Informes
                        </TabsTrigger>
                      ) : null}

                      {getFuntions("Ficha Alumno->Emociones") ? (
                        <TabsTrigger
                          value="emociones"
                          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center text-xs sm:text-sm px-2 sm:px-4"
                        >
                          <Smile className="h-4 w-4 mr-2" />
                          Emociones
                        </TabsTrigger>
                      ) : null}

                      {getFuntions("Ficha Alumno->Eventos") && firstCourseId ? (
                        <TabsTrigger
                          value="eventos"
                          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center text-xs sm:text-sm px-2 sm:px-4"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Eventos
                        </TabsTrigger>
                      ) : null}

                    </TabsList>

                    {/* Zona 3: Contenido de las pestañas */}
                    <div className="mt-6 bg-white rounded-lg p-4 border border-blue-100">
                      <TabsContent value="ficha">
                        <StudentDetailInfo
                          alumno={studentDetails?.alumno}
                          ficha={studentDetails?.ficha?.[0] ?? null}
                          apoderados={studentDetails.apoderados ?? []}
                        />
                      </TabsContent>

                      <TabsContent value="alertas">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-200">
                          <StudentDetailAlerts
                            alerts={studentDetails.alertas}
                            setRefresh={() => refetch()}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="informes">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-200">
                          <StudentReports reports={studentDetails.informes ?? []} />
                        </div>
                      </TabsContent>

                      <TabsContent value="emociones">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-200">
                          <h3 className="text-xl font-semibold text-gray-800 mb-6">
                            Registro emocional del alumno
                          </h3>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <BarChartComparisonAlumno
                              title="Emociones"
                              selectedEmotions={selectedEmotions}
                              onToggleEmotion={handleToggleEmotion}
                              apiEmotions={emociones}
                              setSelectedEmotions={setSelectedEmotions}
                            />

                            <ComparisonChart comparisonData={comparativa} />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="eventos">
                        {firstCourseId ? (
                          <StudentDetailEvents
                            alumno_id={studentDetails.alumno.alumno_id}
                            curso_id={firstCourseId}
                          />
                        ) : (
                          <p className="text-sm text-gray-500">
                            No hay curso asociado para mostrar eventos.
                          </p>
                        )}
                      </TabsContent>

                    </div>
                  </Tabs>
                </div>
              </div>
            )}
          </>
        </AppLayout>
      </VerifyAccess>
    </ErrorBoundary>
  );
}

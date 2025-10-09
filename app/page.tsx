"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { StatCardSkeleton } from "@/components/stat-card-skeleton";
import { BarChartComparison } from "@/components/bar-chart-comparison";
import { BarChartSkeleton } from "@/components/bar-chart-skeleton";
import { DonutChart } from "@/components/donut-chart";
import { DonutChartSkeleton } from "@/components/donut-chart-skeleton";
import { ImportantDates } from "@/components/important-dates";
import { ImportantDatesSkeleton } from "@/components/important-dates-skeleton";
import { RecentAlerts } from "@/components/recent-alerts";
import { RecentAlertsSkeleton } from "@/components/recent-alerts-skeleton";
import { isAuthenticated, removeAuthToken } from "@/lib/api-config";
import { useToast } from "@/hooks/use-toast";
import { getSchoolById } from "@/services/school-service";
import { BarChartComparisonPatologieGeneral } from "@/components/bar-chart-comparison-patologie-general";
import { BarChartComparisonNeurodivergences } from "@/components/bar-chart-comparison-neurodivergences";
import { useUser } from "@/middleware/user-context";
import { DashboardInfoCards } from "@/components/dashboard/info-cards";
import ErrorBoundary from "@/components/utils/error-bountdry";
import { BarNegativeEmotionsChart } from "@/components/dashboard/emotions/negative-chart";
import { BarPositiveEmotionsChart } from "@/components/dashboard/emotions/positive-chart";

const EMOTIONS = ["Tristeza", "Felicidad", "Estrés", "Ansiedad", "Enojo", "Otros"];

export default function Home() {
  const { getFuntions, isLoading: userLoading, userData } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [haveAccess, setHaveAccess] = useState(false);

  const [selectedEmotionsGeneral, setSelectedEmotionsGeneral] = useState<string[]>(EMOTIONS);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(EMOTIONS);
  const [selectedEmotionsneuro, setSelectedEmotionsneuro] = useState<string[]>(EMOTIONS);

  const toggleEmotion = (
    emotion: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selected.includes(emotion)) {
      setSelected(selected.filter((e) => e !== emotion));
    } else {
      setSelected([...selected, emotion]);
    }
  };

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Verificar si hay un colegio seleccionado
    const loadSchool = async () => {
      const selectedSchool = localStorage.getItem("selectedSchool");
      if (!selectedSchool) {
        router.push("/select-school");
        return;
      }

      // cargar colegio seleccionado
      const school = await getSchoolById(selectedSchool);
      if (school) {
        localStorage.setItem("schoolData", JSON.stringify(school));
      } else {
        router.push("/select-school");
        return;
      }
    };

    loadSchool();
    if (!userLoading && userData) {
      getFuntions("Alertas") ? setHaveAccess(true) : setHaveAccess(false);
    }
    setIsLoading(false)
  }, [router, toast, userLoading, userData, getFuntions]);

  // Renderizar skeletons durante la carga
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-2 sm:px-6 py-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          {/* Skeleton para tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          {/* Skeleton para Media emocional General */}
          {getFuntions("Grafico Emociones") ? (
            <div className="mb-8">
              <BarChartSkeleton />
            </div>
          ) : null}

          {/* Skeletons para gráficos y datos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChartSkeleton />
            <DonutChartSkeleton />
          </div>

          {/* Skeletons para fechas importantes y alertas recientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ImportantDatesSkeleton />
            <RecentAlertsSkeleton />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <ErrorBoundary>
      <AppLayout>
        <div className="container mx-auto px-2 sm:px-6 py-8">
          {/* <h2 className="text-2xl font-bold text-gray-800 mb-6">{schoolName}</h2> */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Gráficos generales
          </h2>
          {/* Tarjetas de estadísticas */}
          <DashboardInfoCards />
          {/* Media emocional General */}
          {getFuntions("Grafico Emociones") ? (
            <>
              <div className="mb-8"> 
                <BarNegativeEmotionsChart />
              </div>
              <div className="mb-8">
                <BarPositiveEmotionsChart />
              </div>
            </>
          ) : null}
          {/* Gráficos y datos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {getFuntions("Grafico Patologias") ? (
              <BarChartComparisonPatologieGeneral
                title="Patologias"
                selectedEmotions={selectedEmotions}
                onToggleEmotion={(emotion: string) => toggleEmotion(emotion, selectedEmotions, setSelectedEmotions)}
                setSelectedEmotions={setSelectedEmotions}
              />
            ) : null}

            {getFuntions("Grafico Neurodivergencias") ? (
              <BarChartComparisonNeurodivergences
                title="Neurodivergencias"
                initialSelectedEmotions={selectedEmotionsneuro}
                onEmotionsChange={(emotion: string) => toggleEmotion(emotion, selectedEmotionsneuro, setSelectedEmotionsneuro)}
                setSelectedEmotions={setSelectedEmotions}
              />
            ) : null}
          </div>
          <DonutChart />
          {/* Fechas importantes y alertas recientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <ImportantDates title="Fechas importantes" />
            {haveAccess ? <RecentAlerts /> : null}
          </div>
        </div>
      </AppLayout>
    </ErrorBoundary>
  );
}

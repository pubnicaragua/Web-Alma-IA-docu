"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AlertDetailSkeleton } from "@/components/alerts/alert-detail-skeleton";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { changeLeida } from "@/services/alerts-service";
import { EditAlertModal } from "@/components/edit-alert-modal";
import { hasSearchParam } from "@/lib/search-params";
import { AlertPagev1 } from "@/services/alerts-service";
import { AlertBinnacleSection } from "@/components/alerts/detail-sections/binnacle";
import { AlertInfoSection } from "@/components/alerts/detail-sections/info";
import ErrorBoundary from "@/components/utils/error-bountdry"
import { AlertStudentSection } from "@/components/alerts/detail-sections/student";
import { useAxios } from "@/hooks/use-axios";
import { useUser } from "@/middleware/user-context";

export default function AlertDetailPage() {

  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, selectedSchoolId } = useUser();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const axios = useAxios<AlertPagev1 | AlertPagev1[]>(() => window.axios.get(`/alumnos/alertas/${id}`));
  const alert = useMemo(() => Array.isArray(axios.data) ? axios.data[0] : axios.data, [axios.data]);

  useEffect(() => {
    (async function () {
      if (hasSearchParam(searchParams, "notifications")) {
        try {
          const id = Number(searchParams.get("notifications"));
          await changeLeida(id);
        } catch (error) { }
      }
    })();
  }, []);

  useEffect(() => {
    axios.refetch();
  }, [refresh])

  const handleSaveChanges = async (data: any) => {
    if (!alert) return;
    try {
      axios.refetch()
      setIsEditModalOpen(false);
    } catch { }
  };

  const handleGoBack = () => {
    router.back();
  };

    return (
    <ErrorBoundary>
      <AppLayout>
        {axios.loading && <AlertDetailSkeleton />}
        {alert && (
          <>
            <div className="container mx-auto px-3 sm:px-6 py-8">
              <div className="mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoBack}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
              </div>

              <AlertStudentSection alert={alert} />
              <AlertInfoSection
                alert={alert}
                usuarioId={userData?.usuario?.usuario_id}
                colegioId={selectedSchoolId ? Number(selectedSchoolId) : undefined}
              />
              <AlertBinnacleSection
                alertData={alert}
                setRefresh={() => setRefresh(prev => !prev)}
                refresh={refresh}
              />
            </div>

            <EditAlertModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              alert={alert}
              onSave={handleSaveChanges}
            />
          </>
        )}
      </AppLayout>
    </ErrorBoundary>
  );
}

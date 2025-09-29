'use client'
import { useCallback, useState } from "react"
import { AssitedEvaluationFilter, CatalogResponse } from "@/types/assisted-evaluation"
import { AppLayout } from "@/components/layout/app-layout"
import ErrorBoundary from "@/components/utils/error-bountdry"
import { AssitedEvaluationFilters } from "@/components/assisted-evaluation/filters"
import { AssitedEvaluationTable } from "@/components/assisted-evaluation/table"
import { VerifyAccess } from "@/components/authentication/verify-access"
import { useAxios } from "@/hooks/use-axios"
import { useUser } from "@/middleware/user-context"

export default function EvaluacionAsistidaPage() {

    const { selectedSchoolId } = useUser();
    const [filters, setFilters] = useState<AssitedEvaluationFilter | null>(null)

    const fetchCatalogs = useCallback(async () => {
        if (!selectedSchoolId) return;
        return window.axios.get(`/evaluacion-asistida/catalogos`, {
            params: {
                escuela_id: selectedSchoolId
            }
        })
    }, [selectedSchoolId]);

    const {
        data: catalogs,
        loading: CatalogIsLoading
    } = useAxios<CatalogResponse>(fetchCatalogs, [selectedSchoolId]);

    return (
        <ErrorBoundary>
            <VerifyAccess permission="Evaluacion Asistida">
                <AppLayout>
                    <div className="container print:mx-0 print:px-0 print:py-0 mx-auto px-3 sm:px-28 py-8">
                        <h2 className="text-2xl font-bold mb-6">Evaluación Asistida</h2>
                        <div>
                            <AssitedEvaluationFilters
                                setFilters={(filters) => setFilters(filters)}
                                preguntas={catalogs?.data?.preguntas ?? []}
                                cursos={catalogs?.data?.cursos ?? []}
                                CatalogIsLoading={CatalogIsLoading}
                                handlePrint={() => window.print()}
                            />
                            <AssitedEvaluationTable
                                filters={filters}
                                preguntas={catalogs?.data.preguntas ?? []}
                            />
                        </div>
                    </div>
                </AppLayout>
            </VerifyAccess>
        </ErrorBoundary>
    )

}
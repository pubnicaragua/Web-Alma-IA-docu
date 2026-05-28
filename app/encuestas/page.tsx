'use client';
import { useState } from "react";
import ErrorBoundary from "@/components/utils/error-bountdry";
import { AppLayout } from "@/components/layout/app-layout";
import { VerifyAccess } from "@/components/authentication/verify-access";
import { SurveyTable } from "@/components/surveys/table";
import { SurveyTableFilters } from "@/components/surveys/table/filters";
import { SurveyModalNew } from "@/components/surveys/modals/new";
import { RefreshProvider } from "@/stores/refresh";

export default function NoticePage() {

    const [filters, setFilters] = useState({})

    return (
        <ErrorBoundary>
            <VerifyAccess permission="Avisos">
                <AppLayout>
                    <div className="container mx-auto px-2 sm:px-6 py-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Encuestas</h2>
                        <RefreshProvider>
                            <div className="flex flex-col gap-6">
                                <div className="flex justify-between items-center gap-4 ">
                                    <SurveyModalNew />
                                </div>
                                <SurveyTableFilters setFilters={(values) => setFilters(values)} />
                                <SurveyTable filters={filters} />
                            </div>
                        </RefreshProvider>
                    </div>
                </AppLayout>
            </VerifyAccess>
        </ErrorBoundary>
    )
}
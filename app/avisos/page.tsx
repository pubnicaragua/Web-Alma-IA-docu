'use client';
import { useState } from "react";
import ErrorBoundary from "@/components/utils/error-bountdry";
import { AppLayout } from "@/components/layout/app-layout";
import { NoticeTable } from "@/components/notices/table";
import { NoticeTableFilters } from "@/components/notices/table/filters";
import { NoticeModalNew } from "@/components/notices/modals/new";
import { VerifyAccess } from "@/components/authentication/verify-access";
import { NoticeModalView } from "@/components/notices/modals/view";

export default function NoticePage() {

    const [filters, setFilters] = useState({})

    return (
        <ErrorBoundary>
            <VerifyAccess permission="Avisos">
                <AppLayout>
                    <div className="container mx-auto px-2 sm:px-6 py-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Avisos</h2>
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center gap-4 ">
                                <NoticeModalNew />
                                <NoticeModalView avisoId={null} table={false} />
                            </div>
                            <NoticeTableFilters setFilters={(values) => setFilters(values)} />
                            <NoticeTable filters={filters} />
                        </div>
                    </div>
                </AppLayout>
            </VerifyAccess>
        </ErrorBoundary>
    )
}
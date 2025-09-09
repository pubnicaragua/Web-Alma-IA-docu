"use client";
import { AppLayout } from "@/components/layout/app-layout";
import { useState } from "react";
import ErrorBoundary from "@/components/utils/error-bountdry";
import { AlertTableFilters } from "@/components/alerts/filters";
import { AlertsTable } from "@/components/alerts/table";

export default function AlertsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {

  const [filters, setFilters] = useState(null);

  return (
    <ErrorBoundary>
      <AppLayout>
        <div className="container mx-auto px-2 sm:px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Alertas</h2>
          <AlertTableFilters setFilters={(values: any) => setFilters(values)} />
          <AlertsTable filters={filters} />
        </div>
      </AppLayout>
    </ErrorBoundary>
  );
}

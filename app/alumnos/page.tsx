"use client";
import { Suspense, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import ErrorBoundary from "@/components/utils/error-bountdry";
import { StudentTable } from "@/components/student/table";
import { StudentTableFilters } from "@/components/student/table/filters";

export default function StudentsPage() {

  const [filters, setFilters] = useState({
    activo: 1
  });
  const [refresh, setRerefresh] = useState(false);

  return (
    <ErrorBoundary>
      <AppLayout>
        <div className="container mx-auto px-2 sm:px-6 py-8">
          <h2 className="text-2xl font-bold mb-6">Alumnos</h2>
          <StudentTableFilters
            setFilters={(values: any) => setFilters(values)}
            setRefresh={() => setRerefresh((prev) => !prev)}
          />
          <Suspense>
            <StudentTable refresh={refresh} filters={filters} />
          </Suspense>
        </div>
      </AppLayout>
    </ErrorBoundary>
  );
}

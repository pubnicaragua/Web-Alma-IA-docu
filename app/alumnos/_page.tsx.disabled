"use client";
import { Suspense } from "react";

import { StudentsContent } from "@/components/students/student-component";
import { AppLayout } from "@/components/layout/app-layout";

export default function StudentsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-2 sm:px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">Alumnos</h2>
        <Suspense fallback={<div>Cargando búsqueda...</div>}>
          <StudentsContent />
        </Suspense>
      </div>
    </AppLayout>
  );
}

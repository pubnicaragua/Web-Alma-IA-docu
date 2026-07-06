"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { APIReportGeneral } from "@/services/reports-service";
import { ArrowDown, Filter } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DataTable } from "../data-table";

interface ReportsListProps {
  reports: APIReportGeneral[];
}

const columns = [
  { key: "informe_id", title: "Informe ID" },
  { key: "fecha_generacion", title: "Fecha de generacion" },
  { key: "periodo", title: "Periodo" },
  { key: "tipo", title: "Tipo" },
  { key: "creado_por_nombre", title: "Generado por" },
  { key: "url_reporte", title: "Informe", className: "text-left" },
];

export function ReportsList({ reports = [] }: ReportsListProps) {
  const safeReports = Array.isArray(reports) ? reports : [];

  const [filteredReports, setFilteredReports] = useState<APIReportGeneral[]>([]);
  const [uniqueTypes, setUniqueTypes] = useState<string[]>([]);
  const [uniqueNiveles, setUniqueNiveles] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterNivel, setFilterNivel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  interface Column {
    key: string;
    title: string;
    className?: string;
  }

  const renderCell = (report: APIReportGeneral, column: Column) => {
    switch (column.key) {
      case "fecha_generacion": {
        const date = new Date(report.fecha_generacion);
        return (
          <span>
            {new Intl.DateTimeFormat("es-ES", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(date)}
          </span>
        );
      }
      case "tipo": {
        const tipoText = report.tipo ? report.tipo.charAt(0).toUpperCase() + report.tipo.slice(1).toLowerCase() : "";
        return <span>{tipoText}</span>;
      }
      case "creado_por_nombre":
        return <span>{report.creado_por_nombre || "Sin nombre"}</span>;
      case "url_reporte":
        return (
          <Link
            href={report.url_reporte}
            target="_blank"
            className="inline-flex items-center gap-1 px-2 py-1 text-sm text-white bg-blue-500 rounded-md"
          >
            <ArrowDown className="h-3 w-3" />
            <span>Descargar</span>
          </Link>
        );
      default:
        return (
          <span>{String(report[column.key as keyof APIReportGeneral] ?? "")}</span>
        );
    }
  };

  const applyFilters = useCallback(
    (
      reports: APIReportGeneral[],
      type: string,
      nivel: string,
      sort: string
    ) => {
      let result = [...reports];

      if (type !== "all") {
        result = result.filter((report) => report.tipo === type);
      }
      if (nivel !== "all") {
        result = result.filter((report) => report.nivel === nivel);
      }

      result.sort((a, b) => {
        const dateA = new Date(a.fecha_generacion).getTime();
        const dateB = new Date(b.fecha_generacion).getTime();

        if (dateA === dateB) {
          return (a.nivel || "").localeCompare(b.nivel || "");
        }

        return sort === "date-asc" ? dateA - dateB : dateB - dateA;
      });

      setFilteredReports(result);
      setCurrentPage(1);
    },
    []
  );

  useEffect(() => {
    const tiposUnicos = Array.from(
      new Set(safeReports.map((r) => r.tipo))
    ).filter(Boolean) as string[];
    const nivelesUnicos = Array.from(
      new Set(safeReports.map((r) => r.nivel))
    ).filter(Boolean) as string[];

    setUniqueTypes(tiposUnicos);
    setUniqueNiveles(nivelesUnicos);

    applyFilters(safeReports, filterType, filterNivel, sortBy);
  }, [safeReports, applyFilters, filterType, filterNivel, sortBy]);

  const handleFilterType = (type: string) => {
    setFilterType(type);
    applyFilters(safeReports, type, filterNivel, sortBy);
  };

  const handleFilterNivel = (nivel: string) => {
    setFilterNivel(nivel);
    applyFilters(safeReports, filterType, nivel, sortBy);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    applyFilters(safeReports, filterType, filterNivel, sort);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter className="h-4 w-4" />
            <span>Filtrar por:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel
              </label>
              <Select value={filterNivel} onValueChange={handleFilterNivel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueNiveles.map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <Select value={filterType} onValueChange={handleFilterType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueTypes.map((tipo, index) => (
                    <SelectItem key={`tipo-${index}`} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por fecha
              </label>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar orden" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Mas recientes primero</SelectItem>
                  <SelectItem value="date-asc">Mas antiguos primero</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <DataTable
          columns={columns}
          data={currentItems}
          renderCell={renderCell}
        />
        {filteredReports.length > itemsPerPage && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {Math.min(indexOfFirstItem + 1, filteredReports.length)}
              -{Math.min(indexOfLastItem, filteredReports.length)} de{" "}
              {filteredReports.length} informes
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="px-3 py-1 text-sm font-medium">
                Pagina {currentPage} de{" "}
                {Math.ceil(filteredReports.length / itemsPerPage)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(
                      p + 1,
                      Math.ceil(filteredReports.length / itemsPerPage)
                    )
                  )
                }
                disabled={indexOfLastItem >= filteredReports.length}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

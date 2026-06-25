"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"

interface DataTableProps<T> {
  columns: Array<{
    key: string
    title: string
    className?: string
  }>
  data: T[]
  renderCell: (item: T, column: { key: string; title: string }) => React.ReactNode
  className?: string
  pageSize?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  loading?: boolean
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  renderCell,
  className = "",
  pageSize = 10,
  currentPage: externalCurrentPage,
  onPageChange: externalOnPageChange,
  loading = false,
  emptyMessage = "No hay datos disponibles",
}: DataTableProps<T>) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1)
  
  const isControlled = externalCurrentPage !== undefined
  const currentPage = isControlled ? externalCurrentPage || 1 : internalCurrentPage
  const totalPages = Math.ceil(data.length / pageSize)
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      if (!isControlled) {
        setInternalCurrentPage(newPage)
      }
      if (externalOnPageChange) {
        externalOnPageChange(newPage)
      }
    }
  }
  
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, data.length)
  const paginatedData = data.slice(startIndex, endIndex)
  
  const renderPagination = () => {
    if (data.length <= pageSize) return null
    
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
            <span className="font-medium">{endIndex}</span> de{' '}
            <span className="font-medium">{data.length}</span> resultados
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full">
        <thead>
          <tr className="bg-blue-300">
            {columns.map((column) => (
              <th 
                key={column.key} 
                className={cn("px-4 py-3 text-left font-medium text-white", column.className)}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
                  <span>Cargando datos...</span>
                </div>
              </td>
            </tr>
          ) : paginatedData.length > 0 ? (
            paginatedData.map((item, index) => (
              <tr
                key={index}
                className="border-b-2 border-gray-200 hover:bg-gray-50"
              >
                {columns.map((column) => (
                  <td key={`${column.key}-${index}`} className="px-4 py-3">
                    {renderCell(item, column)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-4 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {renderPagination()}
    </div>
  )
}
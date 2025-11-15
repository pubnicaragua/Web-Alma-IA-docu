'use client';
import React, { useCallback, useRef, useState } from "react";
import dynamic from 'next/dynamic';
import { GraphCanvasRef, lightTheme } from "reagraph";
import { ChevronDown, Crosshair, Download, RefreshCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"
import ErrorBoundary from "@/components/utils/error-bountdry";
import { AppLayout } from "@/components/layout/app-layout";
import { VerifyAccess } from "@/components/authentication/verify-access";
import { useAxios } from "@/hooks/use-axios";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormError } from "@/components/form/form-error";

const GraphCanvas = dynamic(
    () => import('reagraph').then((mod) => mod.GraphCanvas),
    { ssr: false }
);

export default function SociogramPage() {

    const { id } = useParams();

    const submitFetcher = useAxios<{ nodes: any[], edges: any[] }>();
    const { data: questions } = useAxios<any[]>(() => window.axios.get(`/encuestas/${id}/preguntas`));

    const form = useForm({
        defaultValues: {
            encuesta_id: Number(id),
            pregunta_id: []
        },
        resolver: zodResolver(z.object({
            encuesta_id: z.number().min(0, "La encuesta es necesaria"),
            pregunta_id: z.array(z.string()).min(1, "La pregunta es requerida"),
        }))
    });

    const preguntas: string[] = form.watch('pregunta_id');

    const onSubmit = useCallback(async (values: any) => {
        await submitFetcher.execute(() => window.axios.get(`/encuestas/${id}/sociograma`, {
            params: values
        }))
    }, [])

    const graphRef = useRef<GraphCanvasRef>(null);
    const handleZoomIn = () => graphRef.current?.zoomIn();
    const handleZoomOut = () => graphRef.current?.zoomOut();
    const handleFitView = () => graphRef.current?.fitNodesInView();
    const handleRelayout = () => graphRef.current?.resetControls();

    const handleExport = () => {
        const data = graphRef.current?.exportCanvas();
        if (!data) return;
        const link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('target', '_blank');
        link.setAttribute('download', 'graph.png');
        link.click();
    }

    return (
        <ErrorBoundary>
            <VerifyAccess permission="Avisos">
                <AppLayout>
                    <div className="container mx-auto px-2 sm:px-6 py-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Sociograma</h2>
                        <hr className="mb-3" />

                        <form onSubmit={form.handleSubmit(onSubmit)} className="mb-6">
                            <div className="grid grid-cols-6 gap-4">
                                <div className="col-span-6 lg:col-span-3">
                                    <Controller
                                        name="pregunta_id"
                                        control={form.control}
                                        render={({ field }) => (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-between overflow-hidden"
                                                    >
                                                        <span className="truncate">Seleccionados {preguntas.length} elementos</span>
                                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="overflow-y-scroll lg:max-h-[320px] w-[250px] p-1">
                                                    {questions?.map((item: any, index) => (
                                                        <DropdownMenuCheckboxItem
                                                            key={item?.pregunta_encuesta_id}
                                                            checked={preguntas.includes(String(item?.pregunta_encuesta_id))}
                                                            onClick={() => {
                                                                const items = preguntas.includes(String(item?.pregunta_encuesta_id))
                                                                    ? preguntas?.filter((id) => id !== String(item?.pregunta_encuesta_id))
                                                                    : [...preguntas, String(item?.pregunta_encuesta_id)];
                                                                field.onChange(items);
                                                            }}
                                                            onSelect={(e) => e.preventDefault()}
                                                        >
                                                            {item?.pregunta_texto}
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    />
                                    <FormError message={form.formState.errors.pregunta_id?.message} />
                                </div>
                                <div className="col-span-6 lg:col-span-3">
                                    <Button type="submit">
                                        Mostrar
                                    </Button>
                                </div>
                            </div>
                        </form>
                        {Boolean(submitFetcher.loading) && (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-600">Cargando Sociograma...</p>
                            </div>
                        )}
                        {!submitFetcher.loading
                            && !submitFetcher.data?.nodes?.length
                            && Boolean(form.formState.submitCount)
                            && (
                                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                    <p className="text-gray-600">No se han encontrado respuestas de alumnos</p>
                                </div>
                            )}
                        {(!submitFetcher.loading && Boolean(submitFetcher.data?.nodes.length)) && (
                            <div
                                className="border-solid border-2 border-gray-300 rounded relative"
                                style={{ width: "100%", height: "70vh" }}
                            >
                                <GraphCanvas
                                    labelType='all'
                                    layoutOverrides={{
                                        linkDistance: 150,
                                        nodeStrength: -300
                                    }}
                                    ref={graphRef}
                                    nodes={submitFetcher.data?.nodes ?? []}
                                    edges={submitFetcher.data?.edges ?? []}
                                    theme={lightTheme}
                                    draggable
                                />
                                <div className="absolute z-10 top-3 left-3 flex flex-col max-w-12 items-center gap-1 mb-4 p-1 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                                    <button
                                        onClick={handleZoomIn}
                                        className="flex items-center justify-center p-2 rounded hover:bg-gray-200 transition"
                                        title="Acercar"
                                    >
                                        <ZoomIn className="w-4 h-4 text-gray-700" />
                                    </button>
                                    <button
                                        onClick={handleZoomOut}
                                        className="flex items-center justify-center p-2 rounded hover:bg-gray-200 transition"
                                        title="Alejar"
                                    >
                                        <ZoomOut className="w-4 h-4 text-gray-700" />
                                    </button>
                                    <div className="h-px w-5 bg-gray-300 mx-1" />
                                    <button
                                        onClick={handleFitView}
                                        className="flex items-center justify-center p-2 rounded hover:bg-gray-200 transition"
                                        title="Centrar vista"
                                    >
                                        <Crosshair className="w-4 h-4 text-gray-700" />
                                    </button>
                                    <button
                                        onClick={handleRelayout}
                                        className="flex items-center justify-center p-2 rounded hover:bg-gray-200 transition"
                                        title="Reacomodar nodos"
                                    >
                                        <RefreshCcw className="w-4 h-4 text-gray-700" />
                                    </button>
                                    <div className="h-px w-5 bg-gray-300 mx-1" />
                                    <button
                                        onClick={handleExport}
                                        className="flex items-center justify-center p-2 rounded hover:bg-gray-200 transition"
                                        title="Descargar"
                                    >
                                        <Download className="w-4 h-4 text-gray-700" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </AppLayout>
            </VerifyAccess>
        </ErrorBoundary>
    );
}

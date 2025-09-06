"use client";
import React, { ReactNode } from "react";

const mode = process.env.NODE_ENV;

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

export default class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ error, errorInfo });
        // TODO:: Enviar el error a un servicio de monitoreo (Sentry, LogRocket, etc.)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen items-center justify-center px-4">
                    <div className="w-full max-w-xl rounded-md border border-gray-200 bg-white p-6 shadow-md overflow-auto max-h-[90vh]">
                        <div className="text-center space-y-3">
                            <h1 className="text-2xl font-bold text-red-600">
                                Ha ocurrido un error inesperado.
                            </h1>
                            <h3 className="text-lg">Refresque la página e intente nuevamente</h3>
                            <h4 className="text-sm text-gray-500">
                                Para recargar presione <kbd className="px-1 py-0.5 border rounded">Ctrl</kbd> +{" "}
                                <kbd className="px-1 py-0.5 border rounded">Shift</kbd> +{" "}
                                <kbd className="px-1 py-0.5 border rounded">R</kbd>
                            </h4>
                            <h5 className="text-sm text-gray-500">
                                Si el error persiste, favor de notificar al correo.
                            </h5>
                        </div>

                        {mode !== "production" && (
                            <div className="mt-6 border-t pt-4">
                                <div className="rounded-md border border-red-300 bg-red-50 p-3">
                                    <h4 className="font-semibold text-red-700">
                                        {this.state.error?.toString()}
                                    </h4>
                                    <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-700">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

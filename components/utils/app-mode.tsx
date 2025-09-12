"use client"
const mode = process.env.NEXT_PUBLIC_ENVIROMENT

export function DevelopmentMode() {
    if (mode === "production" || !mode) return null
    return (
        <div className="fixed bottom-0 right-0 z-50 print:hidden">
            <h4 className="mb-0 shadow-lg">
                <span className="bg-red-600 text-white rounded-t p-3 uppercase flex items-center gap-2">
                    <i className="fa fa-laptop-code"></i>
                    {mode}
                </span>
            </h4>
        </div>
    )
}

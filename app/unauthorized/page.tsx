import { AppLayout } from "@/components/layout/app-layout";
import { UnauthorizedMessage } from "@/components/unauthorized-message";

export default function UnauthorizedPage() {
    return (
        <AppLayout>
            <div className="flex w-full h-full justify-center items-center">
                <UnauthorizedMessage />
            </div>
        </AppLayout>
    )
}
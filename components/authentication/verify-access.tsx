'use client'
import { useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/middleware/user-context";

interface PropTypes {
    permission: string;
    children: ReactNode;
}

export function VerifyAccess({ permission = "", children }: Readonly<PropTypes>) {

    const { getFuntions, isLoading, userData } = useUser();
    const router = useRouter();

    const haveAccess = useMemo(
        () => {
            if (!userData) return true;
            if (isLoading) return true;
            return getFuntions(permission);
        },
        [permission, userData]
    );

    useEffect(() => {
        if (isLoading) return;
        if (haveAccess) return;
        router.push("/unauthorized");
    }, [haveAccess, isLoading]);

    return (
        <>
            {(haveAccess) && children}
        </>
    )
}

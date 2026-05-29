"use client";
import { useUser } from "@/middleware/user-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ALERTS_VIEW_PERMISSION } from "@/lib/alert-identity";

export default function AlertasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getFuntions, isLoading, userData } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !userData) return;

    const canOpenAlerts = getFuntions(ALERTS_VIEW_PERMISSION);

    if (!canOpenAlerts) {
      router.replace("/");
    }
  }, [getFuntions, isLoading, router, userData]);

  return <>{children}</>;
}

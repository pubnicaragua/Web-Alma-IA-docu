"use client";
import { useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { type Alert } from "@/services/alerts-service";

interface StudentCellProps {
  alert: Alert;
  onClick: () => void;
}

export const StudentCell = ({ alert, onClick }: StudentCellProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const avatar = alert.student?.avatar ?? "";
  const showDefaultIcon = !avatar || imageFailed;

  return (
    <div
      className="flex items-center space-x-3 cursor-pointer text-center hover:text-blue-500"
      onClick={onClick}
    >
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
        {showDefaultIcon ? (
          <div
            className={`flex h-full w-full items-center justify-center bg-gray-100 text-gray-500 ${
              alert.isAnonymous ? "blur-lg" : ""
            }`}
            aria-label="Imagen de estudiante no disponible"
          >
            <UserRound className="h-5 w-5" />
          </div>
        ) : (
          <Image
            src={avatar}
            alt={alert.student?.name || "image"}
            width={32}
            height={32}
            className={`w-full h-full object-cover ${
              alert.isAnonymous ? "blur-lg" : ""
            }`}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
      <span className="text-center">
        {alert.isAnonymous ? "Anonimo" : alert?.student?.name}
      </span>
    </div>
  );
};

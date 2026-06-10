"use client";
import { useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { type Alert } from "@/services/alerts-service";
import {
  ANONYMOUS_STUDENT_IMAGE,
  canRevealStudentIdentity,
  getStudentIdentityLabel,
  shouldUseDefaultStudentImage,
} from "@/lib/alert-identity";

interface StudentCellProps {
  alert: Alert;
  onClick: () => void;
}

export const StudentCell = ({ alert, onClick }: StudentCellProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const canRevealIdentity = canRevealStudentIdentity(alert.isAnonymous);
  const useDefaultImage = shouldUseDefaultStudentImage(alert.isAnonymous);
  const avatar = alert.student?.avatar ?? "";
  const showDefaultIcon = !avatar || imageFailed;

  return (
    <div
      className={`flex items-center space-x-3 text-center ${
        canRevealIdentity ? "cursor-pointer hover:text-blue-500" : "cursor-default"
      }`}
      onClick={canRevealIdentity ? onClick : undefined}
    >
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
        {useDefaultImage ? (
          <Image
            src={ANONYMOUS_STUDENT_IMAGE}
            alt="Alumno anonimo"
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        ) : showDefaultIcon ? (
          <div
            className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500"
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
            className="w-full h-full object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
      <span className="text-center">
        {getStudentIdentityLabel(alert?.student?.name, alert.isAnonymous)}
      </span>
    </div>
  );
};

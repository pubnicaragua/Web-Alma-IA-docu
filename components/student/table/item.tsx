import { Student } from "@/services/students-service";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useState } from "react";

function StudentAvatarCell({ student, handleStudentClick }: { student: Student; handleStudentClick: (student: Student) => void }) {
    const [imageError, setImageError] = useState(false);
    const hasImage = student.image && student.image !== "" && !student.image.includes("placeholder.svg") && !imageError;

    return (
        <div
            className="flex items-center space-x-3 cursor-pointer hover:text-blue-500"
            onClick={() => handleStudentClick(student)}
        >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center border border-gray-200">
                {hasImage ? (
                    <img
                        src={student.image}
                        alt={student.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <User className="w-5 h-5 text-gray-400" />
                )}
            </div>
            <span>{student.name}</span>
        </div>
    );
}

export function StudentTableItem(student: Student, column: { key: string }) 
{
    const router = useRouter();

    const handleStudentClick = (student: Student) => {
        router.push(`/alumnos/${student.id}`);
    };

    switch (column.key) {
        case "name":
            return <StudentAvatarCell student={student} handleStudentClick={handleStudentClick} />;
        case "age":
            return `${student.age} años`;
        default:
            return student[column.key as keyof Student];
    }
};

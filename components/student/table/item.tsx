import { Student } from "@/services/students-service";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function StudentTableItem(student: Student, column: { key: string }) 
{
    const router = useRouter();

    const handleStudentClick = (student: Student) => {
        router.push(`/alumnos/${student.id}`);
    };

    switch (column.key) {
        case "name":
            return (
                <div
                    className="flex items-center space-x-3 cursor-pointer hover:text-blue-500"
                    onClick={() => handleStudentClick(student)}
                >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                            src={student.image || "/placeholder.svg"}
                            alt={student.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span>{student.name}</span>
                </div>
            );
        case "age":
            return `${student.age} años`;
        default:
            return student[column.key as keyof Student];
    }
};

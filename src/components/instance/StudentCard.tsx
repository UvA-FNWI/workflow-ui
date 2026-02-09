import {useTranslation} from "react-i18next";

import {Card, Heading, Link, Skeleton, Text} from "@datanose/ui";

interface StudentCardProps {
    isLoading: boolean;
    student?: {
        name: string;
        email?: string;
    };
}

const getInitials = (name: string): string => {
    return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + ".")
        .join(" ");
};

export function StudentCard({isLoading, student}: StudentCardProps) {
    const {t} = useTranslation("workflow");

    return (
        <Card>
            {isLoading && (
                <div className="flex flex-col items-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="mt-4 h-5 w-32" />
                </div>
            )}
            {!isLoading && student && (
                <div className="flex flex-col items-center">
                    {student?.name && (
                        <>
                            <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 align-middle font-medium text-gray-600">
                                {getInitials(student.name)}
                            </div>
                            <Heading as="h3" size="sm">
                                {student.name}
                            </Heading>
                        </>
                    )}
                    {student?.email && (
                        <Link intent="destructive" href={`mailto:${student.email}`}>
                            {student.email}
                        </Link>
                    )}
                </div>
            )}
            {!isLoading && !student && (
                <>
                    <Heading as="h3" size="sm" className="mb-2">
                        {t("studentCard.student")}
                    </Heading>
                    <Text>{t("studentCard.noStudentInfo")}</Text>
                </>
            )}
        </Card>
    );
}

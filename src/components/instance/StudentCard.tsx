import {Card, Heading, Icon, Link, Skeleton, Text} from "@datanose/ui";

import {useTranslate} from "~/hooks/useTranslate.ts";

interface StudentCardProps {
    isLoading: boolean;
    studentName?: string;
    studentEmail?: string;
}

const getInitials = (name: string): string => {
    return name
        .split(" ")
        .filter((word) => word.length > 0 && /^[a-zA-Z]/.test(word))
        .map((word) => word.charAt(0).toUpperCase() + ".")
        .join(" ");
};

export function StudentCard({isLoading, studentName, studentEmail}: StudentCardProps) {
    const {t} = useTranslate("workflow");

    return (
        <Card>
            {isLoading && (
                <>
                    <div className="flex flex-col items-center">
                        <Skeleton className="h-16 w-16 rounded-full" />
                    </div>
                    <Skeleton className="mt-4 h-5 w-32" />
                </>
            )}
            {!isLoading && (studentName || studentEmail) && (
                <>
                    <div className="mb-2 flex flex-col items-center">
                        {studentName && (
                            <>
                                <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 align-middle font-medium text-gray-600">
                                    {getInitials(studentName)}
                                </div>
                                <Heading as="h3" size="sm">
                                    {studentName}
                                </Heading>
                            </>
                        )}
                    </div>
                    {studentEmail && (
                        <div className="flex items-center gap-2">
                            <Icon name="email-line" />
                            <Link href={`mailto:${studentEmail}`} underline>
                                {studentEmail}
                            </Link>
                        </div>
                    )}
                </>
            )}
            {!isLoading && !studentName && !studentEmail && (
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

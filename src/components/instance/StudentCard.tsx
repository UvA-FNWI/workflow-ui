import {Card, Heading, Icon, Link, Skeleton, Text} from "@uva-fnwi/datanose-ui";

import {UserAvatar} from "~/components/instance/UserAvatar.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";

interface StudentCardProps {
    isLoading: boolean;
    studentName?: string;
    studentEmail?: string;
    studentPicture?: string;
}

export function StudentCard({
    isLoading,
    studentName,
    studentEmail,
    studentPicture,
}: StudentCardProps) {
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
                                <UserAvatar userName={studentName} picture={studentPicture} />
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

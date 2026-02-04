import {Card, Heading, Skeleton} from "@datanose/ui";

interface StudentCardProps {
    isLoading: boolean;
}

export function StudentCard({isLoading}: StudentCardProps) {
    return (
        <Card className="flex flex-col items-center">
            {isLoading ? (
                <>
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="mt-4 h-5 w-32" />
                </>
            ) : (
                <>
                    <div className="inline-block h-16 w-16 rounded-full bg-gray-200 align-middle" />
                    <Heading as="h3" size="sm">
                        Naam student
                    </Heading>
                </>
            )}
        </Card>
    );
}

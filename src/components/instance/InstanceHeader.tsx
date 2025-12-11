import {Link} from "react-router";

import {Skeleton, Text} from "@datanose/ui";

interface InstanceHeaderProps {
    id?: string;
    isLoading: boolean;
}

export function InstanceHeader({id, isLoading}: InstanceHeaderProps) {
    if (isLoading) {
        return <Skeleton className="mb-8 h-8 w-48" />;
    }

    return (
        <>
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                Go back
            </Link>
            <Text size="2xl" className="mb-8">
                Instance {id}
            </Text>
        </>
    );
}

import {useParams} from "react-router";

import {AdminCard} from "~/components/instance/AdminCard";
import {ContentCard} from "~/components/instance/ContentCard";
import {InfoCards} from "~/components/instance/InfoCards";
import {InstanceHeader} from "~/components/instance/InstanceHeader";
import {ProgressCard} from "~/components/instance/ProgressCard";
import {StudentCard} from "~/components/instance/StudentCard";
import {instancesEndpoints} from "~/store/api/instancesApi";
import {getLocalStringField, getStringField} from "~/utils/fieldUtils";

function Instance() {
    const {id} = useParams<{id: string}>();

    const {data: instance, isLoading} = instancesEndpoints.getInstance.useQuery(id ?? "", {
        skip: !id,
    });

    // Error state: early return when not loading and no instance
    if (!isLoading && !instance) {
        return <div>Error loading instance</div>;
    }

    const studentEmail = getStringField(instance?.fields, "Student.Email");
    const studentName = getStringField(instance?.fields, "Student.DisplayName");
    const courseName = getLocalStringField(instance?.fields, "Course.Name");

    return (
        <div className="">
            <InstanceHeader courseName={courseName} isLoading={isLoading} />
            <div className="flex flex-col gap-6 sm:grid sm:grid-cols-6">
                <div className="col-span-4 flex flex-col gap-8">
                    <ProgressCard isLoading={isLoading} />
                    <ContentCard instance={instance} isLoading={isLoading} />
                </div>
                <div className="col-span-2 flex flex-col gap-6">
                    <StudentCard
                        studentEmail={studentEmail}
                        studentName={studentName}
                        isLoading={isLoading}
                    />
                    <InfoCards isLoading={isLoading} />
                    {instance?.canUseAdminTools && <AdminCard />}
                </div>
            </div>
        </div>
    );
}

export default Instance;

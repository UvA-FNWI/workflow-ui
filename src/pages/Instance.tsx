import {Link, useParams} from "react-router";

import {Card, Heading, Separator, Text} from "@datanose/ui";

import {WorkflowProgressBar} from "~/components/WorkflowProgressBar";
import {useTranslate} from "~/hooks/useTranslate";
import {instancesEndpoints} from "~/store/api/instancesApi";

function Instance() {
    const {id} = useParams<{id: string}>();
    const {t, l} = useTranslate("workflow");

    const {data: instance} = instancesEndpoints.getInstance.useQuery(id ?? "", {skip: !id});

    return (
        <div className="">
            {/* Back button temp */}
            <div className="flex flex-col">
                <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                    Go back
                </Link>
                <Text size="2xl" className="mb-8">
                    Instance {id}
                </Text>
            </div>
            {/* Progress */}
            <div className="flex flex-col gap-6 sm:grid sm:grid-cols-6">
                <div className="col-span-4 flex flex-col gap-8">
                    <Card>
                        <div className="flex flex-col gap-4">
                            <Heading>{t("progress.title")}</Heading>
                            <Separator />
                            <div className="flex items-center gap-8">
                                <Text size="md" className="whitespace-nowrap">
                                    {t("progress.label")}
                                </Text>
                                <WorkflowProgressBar />
                            </div>
                        </div>
                    </Card>
                    {/* Content */}
                    <Card>
                        {instance?.steps.map((step) => (
                            <div key={step.id}>
                                <Text size="lg">{l(step.title)}</Text>
                            </div>
                        ))}
                    </Card>
                </div>
                <div className="col-span-2 flex flex-col gap-6">
                    <Card className="flex flex-col items-center">
                        <div className="inline-block h-16 w-16 rounded-full bg-gray-200 align-middle" />
                        <Heading size="sm">Naam student</Heading>
                    </Card>
                    {/* Content */}
                    <Card>
                        <Heading size="sm">{t("good_to_know.title")}</Heading>
                    </Card>
                    <Card>
                        <Heading size="sm">{t("first_help.title")}</Heading>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Instance;

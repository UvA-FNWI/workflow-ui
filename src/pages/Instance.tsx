import {useTranslation} from "react-i18next";
import {useParams} from "react-router";

import {Card, Separator, Text} from "@datanose/ui";

import {WorkflowProgressBar} from "../components/WorkflowProgressBar";
import {instancesEndpoints} from "../store/api/instancesApi";

function Instance() {
    const {id} = useParams<{id: string}>();
    const {t} = useTranslation("workflow");

    const {data: instance} = instancesEndpoints.getInstance.useQuery(id ?? "", {skip: !id});

    return (
        <div className="">
            {/* Back button */}
            <Text size="2xl" className="mb-8">
                Instance {id}
            </Text>
            {/* Progress */}
            <div className="flex flex-col gap-6 sm:grid sm:grid-cols-6">
                <div className="col-span-4 flex flex-col gap-8">
                    <Card>
                        <div className="flex flex-col gap-4">
                            <Text size="lg" className="whitespace-nowrap">
                                {t("progress.title")}
                            </Text>
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
                                <Text size="lg">{step.title.en}</Text>
                            </div>
                        ))}
                    </Card>
                </div>
                <div className="col-span-2 flex flex-col gap-6">
                    <Card className="flex flex-col items-center">
                        <div className="inline-block h-16 w-16 rounded-full bg-gray-200 align-middle" />
                        Naam student
                    </Card>
                    {/* Content */}
                    <Card>Handig tijdens je scriptie</Card>
                    <Card>
                        Zo kies je een goed scriptieonderwerp 1.Kies iets dat jij écht interessant
                        vindt Welk onderwerp of vak vond jij echt interessant? 2. Kies een
                        afgebakend onderwerp Kies een onderwerp dat niet te breed is. Anders maak je
                        het jezelf onnodig moeilijk. Veel studenten lopen hier tegenaan, dus trap
                        niet in die valkuil!
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Instance;

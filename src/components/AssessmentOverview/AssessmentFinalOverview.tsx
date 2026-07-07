import {Separator, Text, Tooltip} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import {assessmentsApi} from "~/store/api/assessmentsApi.ts";

type Props = {
    instanceId: string;
    combine: boolean;
};

export const AssessmentFinalOverview = ({instanceId, combine}: Props) => {
    const {t, l} = useTranslate("workflow");

    const {data: assessmentResults} = assessmentsApi.endpoints.getAssessmentResults.useQuery({
        instanceId,
        combine,
    });

    if (!assessmentResults || !assessmentResults?.parts || assessmentResults?.parts?.length == 0) {
        return (
            <div className="my-4">
                <Text className="italic">{t("instance.empty_step")}</Text>
            </div>
        );
    }

    if (!assessmentResults.finalGrade) return null;
    return (
        <div className="mt-4 flex flex-col gap-2">
            {assessmentResults.parts.map((part) => (
                <div className="grid grid-cols-2 gap-4">
                    <Text size="md" fontWeight="semibold" className="py-1">
                        {`${l(part.title)} (${part.percentage}%):`}
                    </Text>
                    <Text size="md" className="py-1" fontWeight="semibold">
                        {part.combined?.weightedAverage}
                    </Text>
                </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
                <Text size="lg" fontWeight="semibold" className="py-1">
                    {t("instance.calculations.final_grade")}:
                </Text>
                <Text size="lg" fontWeight="semibold" className="py-1">
                    {assessmentResults.finalGrade?.calculated ? (
                        <Tooltip
                            content={
                                t("instance.calculations.calculated_grade") +
                                assessmentResults.finalGrade.calculated.toFixed(5)
                            }
                        >
                            <span>
                                {l(assessmentResults?.finalGrade?.text) ??
                                    assessmentResults?.finalGrade.rounded ??
                                    "-"}
                            </span>
                        </Tooltip>
                    ) : (
                        (l(assessmentResults?.finalGrade?.text) ??
                        assessmentResults?.finalGrade.rounded ??
                        "-")
                    )}
                </Text>
            </div>
            <Separator weight="bold" className="my-4" />
        </div>
    );
};

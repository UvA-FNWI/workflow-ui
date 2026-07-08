import {Separator, Text, Tooltip} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import type {Assessment} from "~/store/api/types/assessments.ts";

type Props = {
    assessmentResults: Assessment;
};

export const AssessmentGradeSummary = ({assessmentResults}: Props) => {
    const {t, l} = useTranslate("workflow");

    if (!assessmentResults.finalGrade) return null;

    return (
        <div className="mt-4 flex flex-col gap-4">
            {assessmentResults.parts.map((part) => (
                <div key={part.id} className="grid grid-cols-2 gap-4">
                    <Text
                        fontWeight="semibold"
                        className="min-w-0 wrap-break-word"
                        color="text-grey-900"
                    >
                        {`${l(part.title)} (${part.percentage}%):`}
                    </Text>
                    <Text as="span" display="inline">
                        {part.combined?.weightedAverage}
                    </Text>
                </div>
            ))}

            <Separator weight="bold" />

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
        </div>
    );
};

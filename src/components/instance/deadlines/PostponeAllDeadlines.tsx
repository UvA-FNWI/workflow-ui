import {Input, Select, SelectItem, Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";

type Props = {
    amount: string;
    unit: string;
    maximumDays?: number;
    onAmountChange: (amount: string) => void;
    onUnitChange: (unit: string) => void;
};

export function PostponeAllDeadlines({
    amount,
    unit,
    maximumDays,
    onAmountChange,
    onUnitChange,
}: Props) {
    const {t} = useTranslate("workflow");
    const maximum =
        maximumDays == null ? undefined : Math.floor(maximumDays / (unit === "weeks" ? 7 : 1));
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-end gap-3">
                <Input
                    type="number"
                    min="1"
                    max={maximum}
                    isDisabled={maximum === 0}
                    step="1"
                    label={t("postponement.amount")}
                    value={amount}
                    onChange={onAmountChange}
                />
                <Select
                    aria-label={t("postponement.unit")}
                    value={unit}
                    onChange={(value) => {
                        if (value !== "days" && value !== "weeks") return;
                        onUnitChange(value);
                    }}
                >
                    <SelectItem key="days">{t("postponement.days")}</SelectItem>
                    <SelectItem key="weeks">{t("postponement.weeks")}</SelectItem>
                </Select>
            </div>
            {maximumDays != null && (
                <Text>
                    {t(
                        maximumDays === 0
                            ? "postponement.all_limit_reached"
                            : "postponement.remaining_days",
                        {count: maximumDays},
                    )}
                </Text>
            )}
        </div>
    );
}

import {Input, Select, SelectItem} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";

type Props = {
    amount: string;
    unit: string;
    onAmountChange: (amount: string) => void;
    onUnitChange: (unit: string) => void;
};

export function PostponeAllDeadlines({amount, unit, onAmountChange, onUnitChange}: Props) {
    const {t} = useTranslate("workflow");
    return (
        <div className="flex items-end gap-3">
            <Input
                type="number"
                min="1"
                step="1"
                label={t("postponement.amount")}
                value={amount}
                onChange={onAmountChange}
            />
            <Select
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
    );
}

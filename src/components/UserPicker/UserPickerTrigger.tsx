import {Icon} from "@datanose/ui";

export interface UserPickerTriggerProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onClick: () => void;
    isDisabled?: boolean;
}

export const UserPickerTrigger: React.FC<UserPickerTriggerProps> = ({
    label,
    placeholder,
    value,
    onClick,
    isDisabled = false,
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    value={value || ""}
                    placeholder={placeholder}
                    readOnly
                    onClick={onClick}
                    disabled={isDisabled}
                    className="dark:bg-grey-900 border-grey-300 dark:border-grey-600 hover:border-navy-600 focus:ring-navy-600 dark:ring-offset-grey-900 disabled:bg-grey-100 dark:disabled:bg-grey-800 w-full cursor-pointer rounded-md border bg-white px-3 py-1.5 pr-12 text-base transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:border-sky-500 dark:focus:ring-orange-500"
                />
                <div className="pointer-events-none absolute top-0 right-0 flex h-full items-center">
                    <div className="bg-grey-300 dark:bg-grey-600 h-full w-px" />
                    <div className="px-3">
                        <Icon name="search-line" size="md" color="secondary" />
                    </div>
                </div>
            </div>
        </div>
    );
};

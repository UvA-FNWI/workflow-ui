import {Button, Icon} from "@uva-fnwi/datanose-ui";

type CardAddButtonProps = {
    label: string;
    expanded?: boolean;
    onClick: () => void;
};

export function CardAddButton({label, expanded, onClick}: CardAddButtonProps) {
    return (
        <div className="pr-6">
            <Button
                intent="secondary"
                variant="destructive"
                size="square"
                width="none"
                className="flex items-center justify-center leading-0"
                aria-label={label}
                aria-expanded={expanded}
                onClick={onClick}
            >
                <Icon name="plus-solid" color="current" decorative />
            </Button>
        </div>
    );
}

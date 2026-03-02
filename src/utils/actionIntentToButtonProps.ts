import type {ActionIntent} from "~/store/api/types/instances";

type ButtonIntentProps = {
    intent: "primary" | "secondary" | "ghost";
    variant: "default" | "destructive";
};

export function actionIntentToButtonProps(actionIntent: ActionIntent): ButtonIntentProps {
    switch (actionIntent) {
        case "Primary":
            return {intent: "primary", variant: "default"};
        case "Secondary":
            return {intent: "secondary", variant: "default"};
        case "Destructive":
            return {intent: "primary", variant: "destructive"};
    }
}

import {forwardRef} from "react";

import {Button as UIButton} from "@datanose/ui";
import type {ButtonProps as UIButtonProps} from "@datanose/ui";

export interface ButtonProps extends Omit<UIButtonProps, "intent"> {
    intent: "primary" | "secondary" | "destructivePrimary" | "destructiveSecondary" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({intent, ...props}, ref) => {
    // Map intents: swap primary <-> destructivePrimary
    const mappedIntent =
        intent === "primary"
            ? "destructivePrimary"
            : intent === "destructivePrimary"
              ? "primary"
              : intent;

    return <UIButton {...props} intent={mappedIntent} ref={ref} />;
});

Button.displayName = "Button";

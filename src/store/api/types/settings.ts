import type {LocalString} from "~/hooks/useTranslate";

export type Settings = {
    institution?: InstitutionSettings | null;
    ui?: UiSettings | null;
};

export type InstitutionSettings = {
    name?: string | null;
    logoMapping?: Record<string, string> | null;
};

export type UiSettings = {
    appName?: LocalString | null;
    overview?: OverviewUiSettings | null;
    personalPage?: PersonalPageUiSettings | null;
};

export type OverviewUiSettings = {
    pageTitle?: LocalString | null;
    title?: LocalString | null;
    subtitle?: LocalString | null;
    noAccess?: LocalString | null;
};

export type PersonalPageUiSettings = {
    title?: LocalString | null;
    primaryColumn?: LocalString | null;
};

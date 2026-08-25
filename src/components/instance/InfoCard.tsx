import {useState} from "react";

import {Card, Heading, Icon, Link, Skeleton, Text} from "@uva-fnwi/datanose-ui";

import {UserAvatar} from "~/components/instance/UserAvatar.tsx";
import {MarkdownRenderer} from "~/components/MarkdownRenderer.tsx";
import {RelatedUsersCard} from "~/components/StaffCard/RelatedUsersCard.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import type {LocalString} from "~/hooks/useTranslate.ts";
import type {InfoCard as InfoCardData, InfoCardField} from "~/store/api/types/instances.ts";

interface InfoCardsProps {
    cards: InfoCardData[];
    instanceId: string;
    isLoading?: boolean;
}

export function InfoCards({cards, instanceId, isLoading}: InfoCardsProps) {
    if (isLoading)
        return (
            <Card>
                <div className="flex flex-col items-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                </div>
                <Skeleton className="mt-4 h-5 w-32" />
            </Card>
        );

    return cards.map((card) => <InfoCard key={card.name} card={card} instanceId={instanceId} />);
}

function InfoCard({card, instanceId}: {card: InfoCardData; instanceId: string}) {
    const {l} = useTranslate("workflow");
    if (card.type === "User") return <UserCard card={card} />;
    if (card.type === "RelatedUsers")
        return (
            <RelatedUsersCard
                instanceId={instanceId}
                title={card.title}
                relatedUserGroups={card.groups ?? []}
                items={card.items}
            />
        );
    if (card.type === "Links") return <LinksCard card={card} />;

    return (
        <Card className="flex flex-col gap-4">
            <Heading as="h3" size="sm">
                {l(card.title)}
            </Heading>
            <MarkdownRenderer>{l(card.content) ?? ""}</MarkdownRenderer>
        </Card>
    );
}

function UserCard({card}: {card: Extract<InfoCardData, {type: "User"}>}) {
    const {t, l} = useTranslate("workflow");
    const [isOpen, setIsOpen] = useState(false);
    const fields = card.fields ?? [];
    const visibleFields = isOpen ? fields : fields.slice(0, 3);

    if (!card.user)
        return (
            <Card className="flex flex-col gap-4">
                <Heading as="h3" size="sm">
                    {l(card.title)}
                </Heading>
                {card.emptyText && <Text>{l(card.emptyText)}</Text>}
            </Card>
        );

    return (
        <Card>
            <div className="mb-2 flex flex-col items-center">
                <UserAvatar
                    userName={card.user.displayName}
                    picture={card.user.picture ?? undefined}
                />
                <Heading as="h3" size="sm">
                    {card.user.displayName}
                </Heading>
            </div>
            <div className="flex flex-col gap-2">
                {visibleFields.map((field) => (
                    <Field key={`${l(field.title)}-${String(field.value)}`} field={field} />
                ))}
                {fields.length > 3 && (
                    <Link intent="destructive" onClick={() => setIsOpen((open) => !open)} underline>
                        {isOpen ? t("show_less") : t("show_all")}
                    </Link>
                )}
            </div>
        </Card>
    );
}

function Field({field}: {field: InfoCardField}) {
    const {l} = useTranslate("workflow");
    const value = displayValue(field.value, l);
    return (
        <div className="flex items-center gap-2">
            {field.icon && <Icon name={field.icon} />}
            {field.href ? (
                <Link href={field.href} underline>
                    {value}
                </Link>
            ) : (
                <Text>{value}</Text>
            )}
        </div>
    );
}

function LinksCard({card}: {card: Extract<InfoCardData, {type: "Links"}>}) {
    const {t, l} = useTranslate("workflow");
    const [isOpen, setIsOpen] = useState(false);
    const items = (card.items ?? []).filter((item) => {
        const url = l(item.url);
        return url != null && url.trim() !== "";
    });
    const links = isOpen ? items : items.slice(0, 3);

    return (
        <Card className="flex flex-col gap-4">
            <Heading as="h3" size="sm">
                {l(card.title)}
            </Heading>
            {links.map((link) => (
                <div key={link.name} className="flex items-center gap-1">
                    <Icon
                        name={link.type === "Download" ? "download-line" : "link-line"}
                        className="min-w-5"
                    />
                    <Link
                        href={l(link.url)}
                        underline
                        target="_blank"
                        {...(link.type === "Download" && {download: true})}
                    >
                        {l(link.text)}
                    </Link>
                </div>
            ))}
            {items.length > 3 && (
                <Link
                    intent="destructive"
                    onClick={() => setIsOpen((open) => !open)}
                    className="underline"
                >
                    {isOpen ? t("show_less") : t("show_all")}
                </Link>
            )}
        </Card>
    );
}

function displayValue(
    value: unknown,
    localize: (value?: LocalString | null) => string | undefined,
) {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object" && value && "en" in value && "nl" in value)
        return localize(value as LocalString) ?? "";
    return String(value);
}

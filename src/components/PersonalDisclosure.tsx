import {type ReactNode, useState} from "react";

import type {ColumnDef} from "@tanstack/react-table";
import {Disclosure, Heading, SearchInput, Text} from "@uva-fnwi/datanose-ui";

import {DataTable} from "~/components/Table";
import {useTranslate} from "~/hooks/useTranslate";
import type {PersonalInstance} from "~/store/api/types/personal";
import type {PersonalRoleGroup} from "~/utils/personalInstances";

type PersonalDisclosureProps = {
    title: ReactNode;
    roleGroups: PersonalRoleGroup[];
    columns: ColumnDef<PersonalInstance>[];
    defaultExpanded?: boolean;
    isExpanded?: boolean;
};

export function PersonalDisclosure({
    title,
    roleGroups,
    columns,
    defaultExpanded,
    isExpanded,
}: PersonalDisclosureProps) {
    const {l, t} = useTranslate("personal");
    const [search, setSearch] = useState("");

    // Always show Supervisor roles first, everything after that in alphabetical order
    const sortedRoleGroups = roleGroups.toSorted((first, second) =>
        first.role.name === "Supervisor"
            ? -1
            : second.role.name === "Supervisor"
              ? 1
              : first.role.name.localeCompare(second.role.name),
    );

    return (
        <Disclosure defaultExpanded={defaultExpanded} isExpanded={isExpanded}>
            <Disclosure.Header>
                <Heading>{title}</Heading>
            </Disclosure.Header>
            <Disclosure.Content>
                {roleGroups.length === 0 ? (
                    <Text className="pt-4">{t("empty_title")}</Text>
                ) : (
                    <>
                        <div className="mb-6 flex justify-end pt-4">
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                placeholder={t("search_placeholder")}
                            />
                        </div>
                        <div className="flex flex-col gap-6">
                            {sortedRoleGroups.map(({role, instances}) => (
                                <section key={role.name} className="overflow-hidden">
                                    <Heading as="h3" size="sm" className="pb-4">
                                        {t("role_title", {
                                            role: (
                                                l(role.title) || formatIdentifier(role.name)
                                            ).toLocaleLowerCase(),
                                        })}
                                    </Heading>
                                    <DataTable
                                        data={instances}
                                        columns={columns}
                                        getRowId={(instance) => instance.id}
                                        globalFilter={search}
                                        emptyNode={
                                            <Text className="txt-center px-4 pb-4">
                                                {t("no_instances_found", {
                                                    search: search,
                                                })}
                                            </Text>
                                        }
                                    />
                                </section>
                            ))}
                        </div>
                    </>
                )}
            </Disclosure.Content>
        </Disclosure>
    );
}

function formatIdentifier(value: string | null): string {
    if (!value) {
        return "";
    }

    return value
        .replace(/[-_]+/g, " ")
        .replace(/([a-z\d])([A-Z])/g, "$1 $2")
        .replace(/^./, (character) => character.toUpperCase());
}

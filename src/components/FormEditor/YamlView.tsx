import {useState} from "react";

import {yaml} from "@codemirror/lang-yaml";
import CodeMirror from "@uiw/react-codemirror";
import {Callout, Tab, TabList, TabPanel, TabPanels, Tabs} from "@uva-fnwi/datanose-ui";

import type {ConfigDocs} from "~/components/FormEditor/model";
import {useTranslate} from "~/hooks/useTranslate";

type Props = {
    docs: ConfigDocs;
    paths: string[];
    onEdit: (path: string, text: string) => string | null;
    onValidityChange: (path: string, valid: boolean) => void;
};

export function YamlView({docs, paths, onEdit, onValidityChange}: Props) {
    const {t} = useTranslate("workflow");
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string | null>>({});

    if (paths.length === 0) {
        return <p className="py-4 text-sm text-grey-700">{t("form_editor.no_changes")}</p>;
    }

    return (
        <Tabs>
            <TabList>
                {paths.map((path) => (
                    <Tab key={path}>{path.split("/").at(-1)}</Tab>
                ))}
            </TabList>
            <TabPanels>
                {paths.map((path) => (
                    <TabPanel key={path}>
                        {errors[path] && (
                            <Callout type="error" className="mb-2" role="alert">
                                {errors[path]}
                            </Callout>
                        )}
                        <CodeMirror
                            value={drafts[path] ?? docs.get(path)?.toString() ?? ""}
                            extensions={[yaml()]}
                            onChange={(text) => {
                                const error = onEdit(path, text);
                                setDrafts((previous) => {
                                    if (error !== null) return {...previous, [path]: text};
                                    if (!(path in previous)) return previous;
                                    const next = {...previous};
                                    delete next[path];
                                    return next;
                                });
                                setErrors((previous) => ({...previous, [path]: error}));
                                onValidityChange(path, error === null);
                            }}
                        />
                    </TabPanel>
                ))}
            </TabPanels>
        </Tabs>
    );
}

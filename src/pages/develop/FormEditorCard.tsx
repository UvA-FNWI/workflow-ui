import {Card, Heading} from "@uva-fnwi/datanose-ui";

import {listDefinitionFolders, listFormPaths} from "~/components/FormEditor/model";
import {useConfigFiles} from "~/components/FormEditor/useConfigFiles";
import {VersionedLink} from "~/components/VersionedLink";
import {useTranslate} from "~/hooks/useTranslate";

const formNameOf = (path: string) =>
    path
        .split("/")
        .at(-1)
        ?.replace(/\.yaml$/i, "") ?? "";

export function FormEditorCard() {
    const {t} = useTranslate("form_editor");
    const {docs} = useConfigFiles();

    if (!docs) {
        return null;
    }

    return (
        <Card className="mb-4">
            <Heading as="h2" className="mb-2">
                {t("card_title")}
            </Heading>
            {listDefinitionFolders(docs).map((folder) => {
                const forms = listFormPaths(docs, folder);
                if (forms.length === 0) {
                    return null;
                }
                return (
                    <div key={folder} className="mb-3">
                        <p className="text-sm font-medium text-grey-700">{folder}</p>
                        <ul className="flex flex-wrap gap-3">
                            {forms.map((formPath) => (
                                <li key={formPath}>
                                    <VersionedLink
                                        to={`/develop/forms/${encodeURIComponent(folder)}/${encodeURIComponent(formNameOf(formPath))}`}
                                    >
                                        {formNameOf(formPath)}
                                    </VersionedLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </Card>
    );
}

export default FormEditorCard;

import {type ReactNode, useState} from "react";

import {Button, Icon} from "@uva-fnwi/datanose-ui";

import {FormEditorLayout, FormEditorPageButton} from "~/components/FormEditor/FormEditorLayout";
import {
    addPage,
    type ApplyFormEdit,
    type ConfigDocs,
    deletePage,
    readPages,
} from "~/components/FormEditor/model";
import {PageSection} from "~/components/FormEditor/PageSection";
import {useTranslate} from "~/hooks/useTranslate";

export function FormEditorWorkspace({
    docs,
    formPath,
    apply,
    pageTools,
    localPreview,
}: {
    docs: ConfigDocs;
    formPath: string;
    apply: ApplyFormEdit;
    pageTools?: ReactNode;
    localPreview?: boolean;
}) {
    const {t, l} = useTranslate("form_editor");
    const [activePage, setActivePage] = useState(0);
    const pages = readPages(docs, formPath);
    const page = pages[Math.min(activePage, pages.length - 1)];

    return (
        <FormEditorLayout
            sidebar={
                <>
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-medium tracking-wide text-grey-500 uppercase">
                            {t("pages")}
                        </p>
                        {pageTools}
                    </div>
                    <ul className="flex flex-row gap-1 overflow-x-auto md:flex-col">
                        {pages.map((item, index) => (
                            <li key={item.name} className="flex items-center gap-1">
                                <FormEditorPageButton
                                    active={index === activePage}
                                    onClick={() => setActivePage(index)}
                                >
                                    {l(item.title) || item.name}
                                </FormEditorPageButton>
                                <Button
                                    intent="ghost"
                                    size="square"
                                    disabled={localPreview && pages.length === 1}
                                    aria-label={t("delete_page", {
                                        title: l(item.title) || item.name,
                                    })}
                                    onClick={() => {
                                        apply(() => deletePage(docs, formPath, item.name));
                                        setActivePage((current) =>
                                            Math.max(0, Math.min(current, pages.length - 2)),
                                        );
                                    }}
                                >
                                    <Icon name="trash-line" size="sm" decorative />
                                </Button>
                            </li>
                        ))}
                    </ul>
                    <Button
                        intent="secondary"
                        size="small"
                        className="mt-2 w-full"
                        leftIcon={<Icon name="plus-line" size="sm" color="current" decorative />}
                        onClick={() =>
                            apply(() => {
                                const added = addPage(docs, formPath, t("new_page"));
                                setActivePage(pages.length);
                                return added.touched;
                            })
                        }
                    >
                        {t("add_page")}
                    </Button>
                </>
            }
        >
            {page ? (
                <PageSection
                    key={page.name}
                    docs={docs}
                    formPath={formPath}
                    pageName={page.name}
                    pageTitle={page.title}
                    apply={apply}
                    localPreview={localPreview}
                />
            ) : (
                <p className="text-sm text-grey-600">{t("no_pages")}</p>
            )}
        </FormEditorLayout>
    );
}

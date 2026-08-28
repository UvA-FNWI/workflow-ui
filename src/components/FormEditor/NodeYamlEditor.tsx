import {useEffect, useMemo, useState} from "react";

import {autocompletion} from "@codemirror/autocomplete";
import {yaml} from "@codemirror/lang-yaml";
import CodeMirror from "@uiw/react-codemirror";
import {Callout} from "@uva-fnwi/datanose-ui";

import {
    flatten,
    type JsonSchema,
    loadSchema,
    resolvePointer,
    type SchemaName,
} from "~/components/FormEditor/model/schema";
import {schemaCompletion, type SchemaTarget} from "~/components/FormEditor/yamlCompletion";

type Props = {
    /** Seeded once. The editor owns the text from then on, so re-renders never move the cursor. */
    initialText: string;
    /** Applies the edit and returns a message when the text is not usable yet. */
    onChange: (text: string) => string | null;
    minHeight?: string;
    /** Inherited properties are shown, not edited: the file belongs to the parent definition. */
    isReadOnly?: boolean;
    /**
     * Which generated schema drives completion, and where in it this text starts. A whole file starts
     * at the root; a single question is a "#/definitions/PropertyDefinition" fragment of one.
     */
    schema?: {name: SchemaName; pointer?: string};
};

function useSchemaTarget(schema: Props["schema"]): SchemaTarget | null {
    const [root, setRoot] = useState<JsonSchema | null>(null);
    const name = schema?.name;
    const pointer = schema?.pointer;

    useEffect(() => {
        if (!name) {
            return;
        }
        let active = true;
        void loadSchema(name).then((loaded) => active && setRoot(loaded));
        return () => {
            active = false;
        };
    }, [name]);

    return useMemo(() => {
        if (!root) {
            return null;
        }
        return {root, start: pointer ? flatten(resolvePointer(root, pointer), root) : root};
    }, [root, pointer]);
}

export function NodeYamlEditor({
    initialText,
    onChange,
    minHeight = "9rem",
    isReadOnly = false,
    schema,
}: Props) {
    const [draft, setDraft] = useState(initialText);
    const [error, setError] = useState<string | null>(null);
    const target = useSchemaTarget(schema);

    // Rebuilt only when the schema finishes downloading, and react-codemirror applies that as a
    // reconfigure rather than a fresh editor, so the text and cursor survive.
    const extensions = useMemo(
        () => [yaml(), autocompletion({override: [schemaCompletion(() => target)]})],
        [target],
    );

    return (
        <div>
            <CodeMirror
                value={draft}
                extensions={extensions}
                minHeight={minHeight}
                editable={!isReadOnly}
                basicSetup={{
                    foldGutter: false,
                    highlightActiveLine: false,
                    autocompletion: false,
                }}
                className="overflow-hidden rounded-xs border border-grey-300 text-sm"
                onChange={(text) => {
                    setDraft(text);
                    setError(onChange(text));
                }}
            />
            {error && (
                <Callout type="error" className="mt-2" role="alert">
                    {error}
                </Callout>
            )}
        </div>
    );
}

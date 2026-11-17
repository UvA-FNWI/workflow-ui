import type {FormPreview} from "../../src/store/api/types/formPreviews";
import type {Question} from "../../src/store/api/types/submissions";

export const previewableForms = [
    {name: "Review", title: {en: "Review form", nl: "Controleformulier"}},
    {name: "Other", title: {en: "Other form", nl: "Ander formulier"}},
];

export function formPreview(formName: string, values: Record<string, unknown>): FormPreview {
    const question = (name: string, type: "String" | "Check" | "File" | "Choice"): Question =>
        ({
            name,
            type,
            text: {en: name, nl: name},
            isRequired: true,
            isArray: false,
            hideInResults: false,
            ...(type === "File" ? {allowedFileTypes: ["pdf"], allowedFileSize: 1000} : {}),
            ...(type === "Choice"
                ? {
                      control: "Rubric",
                      weight: 1,
                      percentage: 100,
                      choices: [{name: "8", text: {en: "8", nl: "8"}, value: 8}],
                      rubric: [
                          {
                              name: "Strong",
                              description: {
                                  en: "Clearly explains the research question.",
                                  nl: "Duidelijke onderzoeksvraag.",
                              },
                              grades: [{name: "8", text: {en: "8", nl: "8"}}],
                          },
                      ],
                  }
                : {}),
        }) as Question;
    return {
        formName,
        form: {
            name: formName,
            title: previewableForms.find((form) => form.name === formName)!.title,
            layout: "Normal",
            pages: ["Questions", "Extra", "Last"].map((name, index) => ({
                name,
                index,
                title: {en: name, nl: name},
                layout: "Normal",
                hasResults: index === 0,
                isInCurrentForm: true,
                isActive: index !== 1 || values.ShowExtra === true,
                elements:
                    index === 0
                        ? [
                              question("Answer", "String"),
                              question("ShowExtra", "Check"),
                              question("Document", "File"),
                              question("Score", "Choice"),
                          ].map((question) => ({kind: "Question", question}))
                        : [],
            })),
        },
        answers: ["Answer", "ShowExtra", "Document", "Score"].map((name) => ({
            id: name,
            questionName: name,
            isVisible: true,
            value: values[name] ?? (name === "ShowExtra" ? false : null),
            files: [],
        })),
        referenceChoices: {},
        pageResults: [
            {
                name: "Questions",
                weight: 1,
                sum: 0,
                questionResults: [],
                weightedAverage: values.Score == null ? null : Number(values.Score),
                answeredCount: values.Score == null ? 0 : 1,
                questionCount: 1,
            },
        ],
    };
}

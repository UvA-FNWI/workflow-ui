import {useMemo} from "react";

import {type Control, type FieldValues, useWatch} from "react-hook-form";

import type {Question} from "~/store/api/types/submissions";

interface UseFileQuestionsOptions {
    questions: Question[];
    control: Control<FieldValues>;
}

interface UseFileQuestionsReturn {
    fileQuestions: Question[];
    regularQuestions: Question[];
    fileValuesMap: Record<string, File | null>;
}

/**
 * Hook to separate file questions from regular questions and track file values
 */
export const useFileQuestions = ({
    questions,
    control,
}: UseFileQuestionsOptions): UseFileQuestionsReturn => {
    // Split questions into file questions and regular questions
    const {fileQuestions, regularQuestions} = useMemo(() => {
        const fileQuestions = questions.filter((q) => q.type === "File");
        const regularQuestions = questions.filter((q) => q.type !== "File");
        return {fileQuestions, regularQuestions};
    }, [questions]);

    // Get file question names for watching
    const fileQuestionNames = useMemo(() => fileQuestions.map((q) => q.name), [fileQuestions]);

    // Watch file question values for reactivity
    const fileValues = useWatch({
        control,
        name: fileQuestionNames,
    });

    // Build values object for FileUploadTable
    const fileValuesMap = useMemo(() => {
        return fileQuestions.reduce(
            (acc, q, index) => ({
                ...acc,
                [q.name]: (fileValues[index] as File | null) || null,
            }),
            {},
        );
    }, [fileQuestions, fileValues]);

    return {
        fileQuestions,
        regularQuestions,
        fileValuesMap,
    };
};

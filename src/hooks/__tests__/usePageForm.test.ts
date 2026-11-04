import {useController} from "react-hook-form";

import {act, cleanup, renderHook} from "@testing-library/react";
import {afterEach, expect, it} from "vitest";

import {useFileQuestions} from "../useFileQuestions";
import {usePageForm} from "../usePageForm";
import type {Answer, Question} from "~/store/api/types/submissions";

afterEach(cleanup);

it.each([
    {local: "2026-01-19T23:00:00.000Z", server: "2026-01-20T00:00:00+01:00"},
    {local: "2026-07-19T22:00:00.000Z", server: "2026-07-20T00:00:00+02:00"},
])("acknowledges a saved date with a timezone offset ($server)", async ({local, server}) => {
    const answer: Answer = {
        id: "date",
        questionName: "Date",
        isVisible: true,
        value: "2026-01-01T00:00:00+01:00",
        files: [],
    };
    const {result, rerender} = renderHook(
        ({answers}) => {
            const form = usePageForm(answers);
            return useController({control: form.control, name: answer.questionName}).field;
        },
        {initialProps: {answers: [answer]}},
    );
    const selectedDate = new Date(local);
    await act(() => result.current.onChange(selectedDate));

    // An older response must leave the pending date edit alone.
    rerender({answers: [{...answer}]});
    expect(result.current.value).toEqual(selectedDate);

    rerender({answers: [{...answer, value: server}]});
    expect(result.current.value).toEqual(selectedDate);

    // Once acknowledged, the field must accept subsequent server changes again.
    rerender({answers: [{...answer, value: null}]});
    expect(result.current.value).toBeNull();
});

it.each([
    {name: "number", original: 12, edited: 123},
    {name: "checkbox", original: false, edited: true},
    {name: "multiple selection", original: ["A"], edited: ["A", "B"]},
])("protects a reverted $name value from a delayed response", async ({original, edited}) => {
    const answer: Answer = {
        id: "answer",
        questionName: "Question",
        isVisible: true,
        value: original,
        files: [],
    };
    const {result, rerender} = renderHook(
        ({answers}) => {
            const form = usePageForm(answers);
            return useController({control: form.control, name: answer.questionName}).field;
        },
        {initialProps: {answers: [answer]}},
    );

    await act(() => result.current.onChange(edited));
    await act(() => result.current.onChange(original));
    rerender({answers: [{...answer, value: edited}]});

    expect(result.current.value).toEqual(original);
});

it.each([false, true])("syncs file answers after upload and deletion (array: %s)", (isArray) => {
    const question = {name: "Attachment", type: "File", isArray} as Question;
    const answer: Answer = {
        id: "attachment",
        questionName: question.name,
        isVisible: true,
        value: null,
        files: [],
    };
    const {result, rerender} = renderHook(
        ({answers}) => {
            const form = usePageForm(answers);
            const {fileValuesMap} = useFileQuestions({
                questions: [question],
                control: form.control,
            });
            return {form, fileValuesMap};
        },
        {initialProps: {answers: [answer]}},
    );
    const file = new File(["contents"], "report.pdf", {type: "application/pdf"});

    // PageControl stores the local File this way before uploading it.
    act(() => result.current.form.setValue(question.name, file));
    expect(result.current.fileValuesMap.Attachment).toBe(file);

    const savedValue = isArray ? [file.name] : file.name;
    rerender({answers: [{...answer, value: savedValue}]});
    expect(result.current.form.getValues(question.name)).toEqual(savedValue);
    expect(result.current.fileValuesMap.Attachment).toEqual(savedValue);

    rerender({answers: [{...answer}]});
    expect(result.current.form.getValues(question.name)).toEqual(answer.value);
    expect(result.current.fileValuesMap.Attachment).toBeNull();
});

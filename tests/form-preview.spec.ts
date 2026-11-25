import {expect, test} from "@playwright/test";

import {formPreview, previewableForms} from "./data/formPreview";
import {propertiesInstance, propertiesInstanceNonAdmin} from "./data/instanceProperties";

const assessmentStep = {
    id: "Assessment",
    title: {en: "Assessment", nl: "Beoordeling"},
    isAvailable: false,
    resultsType: "Normal",
    expectsSubmission: false,
    hasSubmission: false,
    submissions: [],
};

test("keeps a coordinator's step preview on the card and unassigned previews in Admin", async ({
    page,
}) => {
    await page.route(/\/WorkflowInstances\/form-preview(?:\?.*)?$/, (route) =>
        route.fulfill({
            json: {
                ...propertiesInstance,
                id: "form-preview",
                previewableForms: [
                    {...previewableForms[0], step: assessmentStep.id},
                    previewableForms[1],
                ],
                steps: [assessmentStep],
                workflowDefinition: {
                    ...propertiesInstance.workflowDefinition,
                    isPropertyOnly: false,
                },
            },
        }),
    );
    await page.route(/\/FormPreviews\/form-preview\/(Review|Other)$/, (route) =>
        route.fulfill({json: formPreview(route.request().url().split("/").pop()!, {})}),
    );

    await page.goto("instance/form-preview");
    const stepCard = page.getByRole("group", {name: "Assessment", exact: true});
    const stepPreview = stepCard.getByRole("button", {name: "Preview form", exact: true});
    await expect(stepPreview).toHaveCount(0);
    await stepCard.getByRole("button", {name: "Assessment", expanded: false}).click();
    await expect(stepPreview).toBeVisible();
    await expect(stepCard.getByRole("separator")).toHaveCount(1);
    await stepPreview.hover();
    await expect(stepPreview.locator("svg")).toHaveCSS("color", "rgb(255, 255, 255)");
    await stepPreview.click();
    await expect(page.getByRole("dialog", {name: "Preview: Review form"})).toBeVisible();
    await page.getByRole("button", {name: "Close modal", exact: true}).click();

    const adminCard = page.getByRole("heading", {name: "Admin", exact: true}).locator("..");
    await adminCard.getByRole("button", {name: "Preview form", exact: true}).click();
    await expect(page.getByRole("dialog", {name: "Preview: Other form"})).toBeVisible();
});

test("preview interacts, navigates and resets without any mutation requests", async ({page}) => {
    const writes: string[] = [];
    const submissionChoiceRequests: string[] = [];
    const previews: Record<string, unknown>[] = [];
    page.on("request", (request) => {
        if (/\/Answers\/.+\/Choices$/.test(request.url())) {
            submissionChoiceRequests.push(request.url());
        }
        if (
            ["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) &&
            !request.url().includes("/FormPreviews/")
        )
            writes.push(request.url());
    });
    await page.route(/\/WorkflowInstances\/form-preview(?:\?.*)?$/, (route) =>
        route.fulfill({
            json: {
                ...propertiesInstanceNonAdmin,
                id: "form-preview",
                previewableForms: previewableForms.map((form) => ({...form, step: "Assessment"})),
                steps: [{...assessmentStep, isAvailable: true, expectsSubmission: true}],
                workflowDefinition: {
                    ...propertiesInstanceNonAdmin.workflowDefinition,
                    isPropertyOnly: false,
                },
            },
        }),
    );
    await page.route(/\/FormPreviews\/form-preview\/(Review|Other)$/, (route) => {
        const {answers} = route.request().postDataJSON();
        previews.push(answers);
        if (answers.Answer === "rejected")
            return route.fulfill({status: 400, json: {error: "Invalid reference"}});
        return route.fulfill({json: formPreview(route.request().url().split("/").pop()!, answers)});
    });

    await page.goto("instance/form-preview");
    const stepCard = page.getByRole("group", {name: "Assessment", exact: true});
    await stepCard.getByRole("button", {name: "Assessment", expanded: false}).click();
    const entry = stepCard.getByRole("button", {name: "Preview forms", exact: true});
    await expect(stepCard.getByRole("separator")).toHaveCount(2);
    await entry.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Choose a form to preview.")).toBeVisible();
    const chooserPanel = dialog.locator("header").locator("..").locator("..");
    expect((await chooserPanel.boundingBox())!.width).toBeLessThanOrEqual(512);
    const choices = dialog.getByRole("list").getByRole("button");
    const choiceBounds = await choices.evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().toJSON()),
    );
    expect(choiceBounds).toHaveLength(previewableForms.length);
    expect(new Set(choiceBounds.map((bounds) => bounds.width)).size).toBe(1);
    await page.screenshot({path: test.info().outputPath("form-chooser.png")});
    await dialog.getByRole("button", {name: "Review form", exact: true}).focus();
    await page.keyboard.press("Enter");
    await expect(dialog.getByRole("textbox", {name: "Answer"})).toBeVisible();
    await expect(dialog.locator('input[type="file"]')).toHaveCount(0);
    await expect(dialog.getByRole("table")).toContainText("PDF");
    await expect(dialog.getByText("File uploads are unavailable in preview.")).toBeVisible();
    await dialog.getByRole("button", {name: "Upload file"}).click();
    await expect(dialog.getByRole("alert")).toHaveText("File uploads are unavailable in preview.");
    await expect(dialog.getByRole("tab", {name: "Extra", exact: true})).toBeDisabled();
    await expect(dialog.getByText("1 of 2 values entered")).toBeVisible();
    await expect(dialog.getByText("Enter the remaining values to see the result.")).toBeVisible();
    const progressBounds = (await dialog.getByText("1 of 2 values entered").boundingBox())!;
    const hintBounds = (await dialog
        .getByText("Enter the remaining values to see the result.")
        .boundingBox())!;
    expect(hintBounds.y).toBeGreaterThanOrEqual(progressBounds.y + progressBounds.height);
    await expect(dialog.getByText("Answers aren't saved.")).toBeVisible();
    await expect(dialog.getByText("View rubric", {exact: true})).toHaveCount(0);
    const header = dialog.locator("header");
    const headerTop = (await header.boundingBox())!.y;
    const panel = header.locator("..").locator("..");
    await panel.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
    });
    const scrollPosition = await panel.evaluate((element) => ({
        actual: element.scrollTop,
        maximum: Math.max(0, element.scrollHeight - element.clientHeight),
    }));
    expect(Math.abs(scrollPosition.actual - scrollPosition.maximum)).toBeLessThanOrEqual(1);
    expect(Math.abs((await header.boundingBox())!.y - headerTop)).toBeLessThan(1);
    await expect(dialog.getByRole("button", {name: "Reset answers"})).toBeInViewport({ratio: 1});
    const footer = dialog.locator("footer");
    await expect(footer.getByRole("button", {name: /close/i})).toHaveCount(0);
    const resetBounds = (await footer.getByRole("button", {name: "Reset answers"}).boundingBox())!;
    const nextBounds = (await footer
        .getByRole("button", {name: "Next", exact: true})
        .boundingBox())!;
    expect(nextBounds.x).toBeGreaterThan(resetBounds.x + resetBounds.width + 20);
    const scrolledHint = (await dialog
        .getByText("Enter the remaining values to see the result.")
        .boundingBox())!;
    expect(scrolledHint.y + scrolledHint.height).toBeLessThanOrEqual(
        (await dialog.locator("footer").boundingBox())!.y,
    );
    await panel.evaluate((element) => {
        element.scrollTop = 0;
    });
    await dialog.getByRole("button", {name: "Select Score", exact: true}).click();
    await page.getByRole("option", {name: "8", exact: true}).click();
    await expect(dialog.getByText("2 of 2 values entered")).toBeVisible();
    await expect(dialog.getByText("Average: 8")).toBeVisible();

    await dialog.getByRole("combobox", {name: "Select a demo project"}).press("ArrowDown");
    await page.getByRole("option", {name: "Demo project B", exact: true}).click();
    await expect.poll(() => previews.at(-1)?.PreviewDemoProject).toBe("demo-project-b");

    await dialog.getByRole("textbox", {name: "Answer"}).fill("rejected");
    const evaluationError = dialog
        .getByRole("alert")
        .filter({hasText: "Couldn't update the preview"});
    await expect(evaluationError).toHaveText(
        "Couldn't update the preview. Adjust your answers or try again.",
    );
    await expect(dialog.getByRole("textbox", {name: "Answer"})).toHaveValue("rejected");
    await expect(dialog.getByText("Average: 8")).toHaveCount(0);
    await page.screenshot({path: test.info().outputPath("preview-error.png")});
    await dialog.getByRole("textbox", {name: "Answer"}).fill("");
    await expect(evaluationError).toHaveCount(0);
    await expect(dialog.getByText("Average: 8")).toBeVisible();

    await dialog.getByRole("button", {name: "Next", exact: true}).click();
    await expect(dialog.getByRole("tab", {name: "Last", exact: true})).toHaveAttribute(
        "aria-selected",
        "true",
    );
    await dialog.getByRole("button", {name: "Previous", exact: true}).click();
    await dialog.getByText("ShowExtra", {exact: true}).click();
    await expect(dialog.getByRole("tab", {name: "Extra", exact: true})).toBeEnabled();
    await dialog.getByRole("textbox", {name: "Answer"}).fill("temporary answer");
    await expect.poll(() => previews.at(-1)?.Answer).toBe("temporary answer");
    await expect(dialog.getByRole("button", {name: /submit/i})).toHaveCount(0);

    await dialog.getByRole("button", {name: "Reset answers"}).click();
    await expect(dialog.getByRole("textbox", {name: "Answer"})).toHaveValue("");
    await expect(dialog.getByRole("tab", {name: "Extra", exact: true})).toBeDisabled();
    await expect(dialog.getByText("1 of 2 values entered")).toBeVisible();
    expect(previews.at(-1)).toEqual({});
    await dialog.getByRole("textbox", {name: "Answer"}).fill("another temporary answer");
    await expect.poll(() => previews.at(-1)?.Answer).toBe("another temporary answer");
    await dialog.getByRole("button", {name: /Review form.*Form/}).click();
    await page.getByRole("option", {name: "Other form"}).click();
    await expect(dialog.getByRole("textbox", {name: "Answer"})).toHaveValue("");
    expect(previews.at(-1)).toEqual({});
    await dialog.getByRole("button", {name: "Close modal", exact: true}).click();
    await expect(dialog).toHaveCount(0);
    await expect(entry).toBeFocused();
    await entry.click();
    await dialog.getByRole("button", {name: "Review form", exact: true}).click();
    await expect(page.getByRole("textbox", {name: "Answer"})).toHaveValue("");
    expect(previews.at(-1)).toEqual({});
    expect(writes).toEqual([]);
    expect(submissionChoiceRequests).toEqual([]);
});

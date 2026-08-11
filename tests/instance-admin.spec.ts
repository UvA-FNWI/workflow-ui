import {expect, test} from "@playwright/test";

import {propertiesInstance} from "./data/instanceProperties";

test.describe("instance admin data page", () => {
    const openDataView = async (page: import("@playwright/test").Page) => {
        await page.goto("instance/context-admin/admin");
        await page.waitForSelector("h1");
    };

    test("lists every property, including ones nested in an object", async ({page}) => {
        await openDataView(page);

        // Choices use localized labels.
        await expect(page.getByText("Decimal", {exact: true})).toBeVisible();

        // User arrays list each display name.
        await expect(page.getByText("Ada Lovelace, Grace Hopper")).toBeVisible();

        await page.getByText("Assessment", {exact: true}).click();

        // Nested properties show their full path.
        await expect(page.getByText("Assessment.Consent", {exact: true})).toBeVisible();
        await expect(page.getByText("Assessment.Grade", {exact: true})).toBeVisible();
    });

    test("offers an editor for supported types but not for files", async ({page}) => {
        await openDataView(page);

        await expect(page.getByRole("button", {name: "Edit Name", exact: true})).toBeVisible();
        await page.getByText("Assessment", {exact: true}).click();
        await expect(page.getByRole("button", {name: "Edit Grade", exact: true})).toBeVisible();
        // File editing is not supported.
        await expect(page.getByRole("button", {name: "Edit Study manual"})).toHaveCount(0);
    });

    test("saves a single property to its own path", async ({page}) => {
        await openDataView(page);

        const save = page.waitForRequest(
            (request) =>
                request.method() === "POST" &&
                request
                    .url()
                    .endsWith("/WorkflowInstances/context-admin/Properties/Assessment.Grade"),
        );

        await page.getByText("Assessment", {exact: true}).click();
        await page.getByRole("button", {name: "Edit Grade", exact: true}).click();

        // Keep the stored decimal exact; a large negative minimum previously changed it.
        const input = page.getByRole("textbox").first();
        await expect(input).toHaveValue("8.5");

        await input.click();
        await page.keyboard.press("ControlOrMeta+a");
        await page.keyboard.type("9.5");
        await page.getByRole("button", {name: "Save"}).click();

        const request = await save;
        expect(request.postDataJSON()).toEqual({value: 9.5});
    });

    test("refreshes the heading after saving a title property", async ({page}) => {
        await page.goto("instance/context-admin/admin");

        await page.getByRole("button", {name: "Edit Name", exact: true}).click();
        const input = page.getByRole("textbox").first();
        await input.fill("Updated context");
        await page.getByRole("button", {name: "Save"}).click();

        await expect(page.getByRole("heading", {level: 1})).toContainText("Updated context");
    });

    test("shows Data once when the instance has no title", async ({page}) => {
        await page.route(/\/WorkflowInstances\/context-admin(?:\?.*)?$/, (route) =>
            route.fulfill({json: {...propertiesInstance, title: null}}),
        );

        await openDataView(page);

        await expect(page.getByRole("heading", {level: 1})).toHaveText("Data");
    });

    test("sends an instance without steps straight to the data view", async ({page}) => {
        await page.goto("instance/context-admin");

        await expect(page).toHaveURL(/\/instance\/context-admin\/admin$/);
        await expect(page.getByRole("link", {name: "Back to overview"})).toBeVisible();
    });

    test("bounces a viewer the endpoint refuses back to the instance page", async ({page}) => {
        await page.goto("instance/context-plain/admin");

        await expect(page).toHaveURL(/\/instance\/context-plain$/);
    });
});

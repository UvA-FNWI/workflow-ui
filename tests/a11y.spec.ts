import AxeBuilder from "@axe-core/playwright";
import {expect, test} from "@playwright/test";

test.describe("screen", () => {
    test("should not have accessibility issues", async ({page}) => {
        await page.goto("screens/Project/Projects");

        await page.waitForSelector("h1");

        const accessibilityScanResults = await new AxeBuilder({page}).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});

test.describe("instance page", () => {
    test("should not have accessibility issues", async ({page}) => {
        await page.goto("instance/form-submitted");

        await page.waitForSelector("h1");

        const accessibilityScanResults = await new AxeBuilder({page}).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});

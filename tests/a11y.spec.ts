import AxeBuilder from "@axe-core/playwright";
import {test as base, expect} from "@playwright/test";

const test = base.extend({
    page: async ({page}, use) => {
        const logs: string[] = [];

        page.on("console", (msg) => {
            const type = msg.type();
            const text = msg.text();
            if (type === "error" || type === "warning") {
                const truncated = text.split("\n").slice(0, 4).join("\n");
                const entry = `BROWSER ${type.toUpperCase()}\n${truncated}`;
                logs.push(entry);
                process.stdout.write(`\n${entry}\n`);
            }
        });
        // ESLint gives a false positive here so we disable it
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(page);

        if (logs.length) {
            test.info().annotations.push({
                type: "Browser Console Warnings/Errors",
                description: logs.join("\n\n"),
            });
        }
    },
});
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

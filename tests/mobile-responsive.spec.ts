import {expect, test} from "@playwright/test";

// DN-3903: pages must not scroll horizontally at 320px. Tabs scroll within
// their own area and wide tables scroll within their card, so neither leaks
// page-level horizontal scroll.
const MOBILE = {width: 320, height: 800};

async function assertNoHorizontalPageScroll(page: import("@playwright/test").Page) {
    const {scrollWidth, clientWidth, scrollX} = await page.evaluate(() => {
        window.scrollTo(9999, 0);
        const x = window.scrollX;
        window.scrollTo(0, 0);
        return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            scrollX: x,
        };
    });
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    expect(scrollX).toBe(0);
}

test.describe("mobile responsiveness at 320px", () => {
    test.use({viewport: MOBILE});

    test("screen page does not scroll horizontally", async ({page}) => {
        await page.goto("screens/Project/Projects");
        await page.waitForSelector("h1");
        await assertNoHorizontalPageScroll(page);
    });

    test("instance page does not scroll horizontally", async ({page}) => {
        await page.goto("instance/form-submitted");
        await page.waitForSelector("h1");
        await assertNoHorizontalPageScroll(page);
    });
});

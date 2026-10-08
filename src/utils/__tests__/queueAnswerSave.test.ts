import {describe, expect, it, vi} from "vitest";

import {queueAnswerSave} from "../queueAnswerSave";

describe("queueAnswerSave", () => {
    it("waits for the previous answer before saving another answer on the same instance", async () => {
        const first = Promise.withResolvers<string>();
        const secondSave = vi.fn().mockResolvedValue("latest");
        const firstResult = queueAnswerSave("instance", () => first.promise);
        const secondResult = queueAnswerSave("instance", secondSave);
        await Promise.resolve();
        expect(secondSave).not.toHaveBeenCalled();

        first.resolve("first");
        expect(await firstResult).toBe("first");
        expect(await secondResult).toBe("latest");
        expect(secondSave).toHaveBeenCalledOnce();
    });

    it("does not delay saves to another instance", async () => {
        const first = Promise.withResolvers<void>();
        const firstResult = queueAnswerSave("first", () => first.promise);
        expect(await queueAnswerSave("second", async () => "saved")).toBe("saved");
        first.resolve();
        await firstResult;
    });

    it("continues saving after a failed request", async () => {
        const first = Promise.withResolvers<void>();
        const firstResult = queueAnswerSave("instance", () => first.promise);
        const rejection = expect(firstResult).rejects.toThrow("offline");
        const secondResult = queueAnswerSave("instance", async () => "saved");
        first.reject(new Error("offline"));
        await rejection;
        expect(await secondResult).toBe("saved");
    });
});

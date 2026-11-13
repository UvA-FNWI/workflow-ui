import {describe, expect, it} from "vitest";

import {canRemoveRelatedUser} from "./canRemoveRelatedUser.ts";

const user = {
    id: "1",
    userName: "ada",
    displayName: "Ada",
    email: "ada@example.com",
    picture: null,
    isExternal: false,
    isPending: false,
    isEmailEditable: false,
};

describe("canRemoveRelatedUser", () => {
    it("returns false when the user cannot edit", () => {
        expect(
            canRemoveRelatedUser({
                canEdit: false,
                allowsAssignment: true,
                users: [user],
            }),
        ).toBe(false);
    });

    it("allows remove when the role is optional and has one user", () => {
        expect(
            canRemoveRelatedUser({
                canEdit: true,
                allowsAssignment: true,
                users: [user],
            }),
        ).toBe(true);
    });

    it("allows remove when multiple users are assigned", () => {
        expect(
            canRemoveRelatedUser({
                canEdit: true,
                allowsAssignment: false,
                users: [user, {...user, id: "2", userName: "bob"}],
            }),
        ).toBe(true);
    });

    it("disallows remove for a required role with a single user", () => {
        expect(
            canRemoveRelatedUser({
                canEdit: true,
                allowsAssignment: false,
                users: [user],
            }),
        ).toBe(false);
    });
});

import type {Organization} from "./organizations";

export interface UserSearchResult {
    userName: string;
    displayName: string;
    email: string;
    organization?: Organization;
    isExternal: boolean;
}

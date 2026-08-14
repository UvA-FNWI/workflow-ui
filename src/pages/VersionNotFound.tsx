import {useTranslate} from "~/hooks/useTranslate";

/**
 * Where a link with a ?version= the backend cannot load ends up. Deliberately outside AuthGuard and the
 * app shell: it makes no API calls, so nothing on it can trigger the redirect that got us here.
 */
export default function VersionNotFound() {
    const {t} = useTranslate("common");
    const ref = new URLSearchParams(window.location.search).get("ref") ?? "";

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
            <h1 className="text-xl font-semibold">{t("version_not_found_title")}</h1>
            <p>{t("version_not_found_body", {ref})}</p>
            <a className="underline" href="/">
                {t("version_not_found_back")}
            </a>
        </main>
    );
}

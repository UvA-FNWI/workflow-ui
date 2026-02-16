import type {LocalString} from "~/hooks/useTranslate";

// TODO DN-3595: replace with real data when available
export const mockHelpfulLinks: {title: LocalString; url: string; type: "link" | "download"}[] = [
    {
        title: {en: "Help with methods and statistics", nl: "Hulp bij methoden en statistiek"},
        url: "https://student.uva.nl/en/information/help-with-methods-and-statistics",
        type: "link",
    },
    {
        title: {
            en: "Key competences of academic writing",
            nl: "Waar een academische tekst aan moet voldoen ",
        },
        url: "https://student.uva.nl/en/information/key-competences-of-academic-writing",
        type: "link",
    },
    {
        title: {en: "Creating a study plan", nl: "Een planning maken"},
        url: "https://student.uva.nl/informatie/een-planning-maken",
        type: "link",
    },
    {
        title: {en: "Plagiarism and fraud", nl: "Plagiaat en fraude"},
        url: "https://student.uva.nl/informatie/plagiaat-en-fraude",
        type: "link",
    },
    {
        title: {en: "Example download file", nl: "Voorbeeld download bestand"},
        url: "#",
        type: "download",
    },
];

export const mockSubjectTips: {title: LocalString; text: LocalString}[] = [
    {
        title: {en: "Choose something interesting", nl: "Kies iets interessants"},
        text: {
            en: "Pick a topic that genuinely interests you.",
            nl: "Kies een onderwerp dat je oprecht interesseert.",
        },
    },
    {
        title: {en: "Choose a defined topic", nl: "Kies een afgebakend onderwerp"},
        text: {
            en: "Make sure your topic is well-defined and specific.",
            nl: "Zorg ervoor dat je onderwerp goed afgebakend en specifiek is.",
        },
    },
    {
        title: {en: "Pay attention to feasibility", nl: "Let op haalbaarheid"},
        text: {
            en: "Consider whether your research is feasible within the given time.",
            nl: "Overweeg of je onderzoek haalbaar is binnen de gegeven tijd.",
        },
    },
];

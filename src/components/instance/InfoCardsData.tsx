import type {LocalString} from "~/hooks/useTranslate";

export type InfoCardData = {
    title: LocalString;
    url: LocalString;
    type: "link" | "download";
};

export const usefulLinksData: InfoCardData[] = [
    {
        title: {en: "AI tools and your study", nl: "AI en je studie"},
        url: {
            en: "https://student.uva.nl/en/information/ai-tools-and-your-studies",
            nl: "https://student.uva.nl/informatie/ai-en-je-studie",
        },
        type: "link",
    },
    {
        title: {
            en: "Help if you run into problems with your thesis",
            nl: "Hulp als je vastloopt met je scriptie",
        },
        url: {
            en: "https://student.uva.nl/en/information/help-if-you-run-into-problems-with-your-thesis",
            nl: "https://student.uva.nl/informatie/hulp-als-je-vastloopt-met-je-scriptie",
        },
        type: "link",
    },
    {
        title: {en: "Training, workshops and groups", nl: "Trainingen, workshops en groepen"},
        url: {
            en: "https://student.uva.nl/en/information/training-workshops-information-sessions-and-groups",
            nl: "https://student.uva.nl/informatie/trainingen-workshops-voorlichtingen-en-groepen",
        },
        type: "link",
    },
    {
        title: {en: "Help with academic writing", nl: "Hulp bij academisch schrijven"},
        url: {
            en: "https://student.uva.nl/en/information/help-with-academic-writing",
            nl: "https://student.uva.nl/informatie/hulp-bij-academisch-schrijven",
        },
        type: "link",
    },
    {
        title: {en: "Help with methods and statistics", nl: "Hulp bij methoden en statistiek"},
        url: {
            en: "https://student.uva.nl/en/information/help-with-methods-and-statistics",
            nl: "https://student.uva.nl/informatie/hulp-bij-methoden-en-statistiek",
        },
        type: "link",
    },
    {
        title: {en: "Citing and Acknowledging Resources", nl: "Citeren en bronvermelding"},
        url: {
            en: "https://uba.uva.nl/en/support/education/citing-and-acknowledging-sources/citing-and-acknowledging-sources.html",
            nl: "https://uba.uva.nl/ondersteuning/onderwijs/citeren-en-bronvermelden/citeren-en-bronvermelden.html",
        },
        type: "link",
    },
    {
        title: {en: "Help with undesirable behaviour", nl: "Hulp bij ongewenst gedrag"},
        url: {
            en: "https://student.uva.nl/en/categories/help-with-undesirable-behaviour",
            nl: "https://student.uva.nl/categorieen/hulp-bij-ongewenst-gedrag",
        },
        type: "link",
    },
    {
        title: {en: "Plagiarism and fraud", nl: "Plagiaat en fraude"},
        url: {
            en: "https://student.uva.nl/en/information/plagiarism-and-fraud",
            nl: "https://student.uva.nl/informatie/plagiaat-en-fraude",
        },
        type: "link",
    },
    {
        title: {en: "Graduating and degree certificate", nl: "Afstuderen en diploma"},
        url: {
            en: "https://student.uva.nl/en/categories/graduating-and-degree-certificate",
            nl: "https://student.uva.nl/categorieen/afstuderen-en-diploma",
        },
        type: "link",
    },
    // {
    //     title: {en: "Example download file", nl: "Voorbeeld download bestand"},
    //     url: {en: "#", nl: "#"},
    //     type: "download",
    // },
];

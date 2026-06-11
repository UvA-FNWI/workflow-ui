export const projectsScreen = {
    name: "Projects",
    workflowDefinition: "Project",
    entityType: "Project",
    columns: [
        {
            id: 0,
            title: {
                en: "Summary",
                nl: "Samenvatting",
            },
            property: null,
            filterType: "None",
            displayType: "Normal",
            defaultSort: "Descending",
            link: false,
            isCurrentStep: false,
            dataType: "String",
        },
        {
            id: 1,
            title: {
                en: "Working title",
                nl: "Werktitel",
            },
            property: "Title",
            filterType: "None",
            displayType: "Normal",
            defaultSort: null,
            link: true,
            isCurrentStep: false,
            dataType: "String",
        },
        {
            id: 2,
            title: {
                en: "Course",
                nl: "Vak",
            },
            property: "Course.Name",
            filterType: "None",
            displayType: "Normal",
            defaultSort: null,
            link: false,
            isCurrentStep: false,
            dataType: "Reference",
        },
        {
            id: 3,
            title: {
                en: "Start",
                nl: "Start",
            },
            property: "StartEvent",
            filterType: "None",
            displayType: "Normal",
            defaultSort: null,
            link: false,
            isCurrentStep: false,
            dataType: "DateTime",
        },
        {
            id: 4,
            title: {
                en: "Step",
                nl: "Step",
            },
            property: null,
            filterType: "Pick",
            displayType: "Normal",
            defaultSort: null,
            link: false,
            isCurrentStep: true,
            dataType: "LocalString",
        },
    ],
    groups: [
        {
            name: "assign-subject",
            title: {
                en: "Assign Subject",
                nl: "Onderwerp toewijzen",
            },
            rows: [
                {
                    id: "68f3745e1931cb9f06e3c5d8",
                    values: {
                        "0": "Oink - EC: 6 - Examiner: User 1",
                        "1": "Oink",
                        "2": null,
                        "3": "2025-10-18T11:05:17.233Z",
                        "4": "SubjectFeedback",
                    },
                },
                {
                    id: "68f50af7c73cb921de6df8fe",
                    values: {
                        "0": "hahaa - EC: 3 - Examiner: User 2",
                        "1": "hahaa",
                        "2": null,
                        "3": "2025-10-19T16:01:48.159Z",
                        "4": "Subject",
                    },
                },
                {
                    id: "692c9b4fe81ba30fbbcda005",
                    values: {
                        "0": " - EC: 18 - Examiner: ",
                        "1": "No title",
                        "2": "Gecombineerd bachelorproject wis- en natuurkunde",
                        "3": null,
                        "4": "Start",
                    },
                },
                {
                    id: "692c9b4fe81ba30fbbcda009",
                    values: {
                        "0": " - EC: 18 - Examiner: ",
                        "1": "No title",
                        "2": "Gecombineerd bachelorproject wis- en natuurkunde",
                        "3": null,
                        "4": "Start",
                    },
                },
                {
                    id: "693a52b5b868eeb2a501413d",
                    values: {
                        "0": " - EC: 12 - Examiner: ",
                        "1": "No title",
                        "2": "Bachelorproject wiskunde",
                        "3": null,
                        "4": "Start",
                    },
                },
                {
                    id: "693a52b6b868eeb2a5014167",
                    values: {
                        "0": " - EC: 12 - Examiner: ",
                        "1": "No title",
                        "2": "Bachelorproject wiskunde",
                        "3": null,
                        "4": "Start",
                    },
                },
                {
                    id: "693a530d7a64117fdc3e6f9e",
                    values: {
                        "0": " - EC: 12 - Examiner: ",
                        "1": "No title",
                        "2": "Bachelorproject wiskunde",
                        "3": null,
                        "4": "Start",
                    },
                },
                {
                    id: "693a533b906d2d83ff946d44",
                    values: {
                        "0": " - EC: 12 - Examiner: ",
                        "1": "No title",
                        "2": "Bachelorproject wiskunde",
                        "3": null,
                        "4": "Start",
                    },
                },
                {
                    id: "693b0ce2e3365f34bfd5c0f9",
                    values: {
                        "0": " - EC:  - Examiner: ",
                        "1": "No title",
                        "2": null,
                        "3": null,
                        "4": "Start",
                    },
                },
                {
                    id: "694a3063437eb5dcfd44d0c9",
                    values: {
                        "0": "testenoppelaazaaaahhaheba - EC: 55 - Examiner: User 1",
                        "1": "testenoppelaazaaaahhaheba",
                        "2": null,
                        "3": "2025-12-29T15:22:51.923Z",
                        "4": "SubjectFeedback",
                    },
                },
            ],
        },
        {
            name: "thesis-in-progress",
            title: {
                en: "Thesis in Progress",
                nl: "Scriptie in behandeling",
            },
            rows: [
                {
                    id: "68f50c205111fde2a9f14678",
                    values: {
                        "0": "hahaaeaabaaa - EC: 34 - Examiner: User 1",
                        "1": "hahaaeaabaaa",
                        "2": null,
                        "3": "2025-10-19T16:05:02.082Z",
                        "4": "Upload",
                    },
                },
                {
                    id: "68fe0d126342161311b63d9a",
                    values: {
                        "0": "ha - EC: 61 - Examiner: User 1",
                        "1": "ha",
                        "2": null,
                        "3": "2025-10-26T12:17:55.973Z",
                        "4": "Upload",
                    },
                },
                {
                    id: "691d6d069b752fc875ed11bb",
                    values: {
                        "0": "Hoi - EC: 3 - Examiner: User 1",
                        "1": "Hoi",
                        "2": null,
                        "3": null,
                        "4": "Assessment",
                    },
                },
                {
                    id: "692c9b4fe81ba30fbbcda007",
                    values: {
                        "0": " - EC: 18 - Examiner: ",
                        "1": "No title",
                        "2": "Gecombineerd bachelorproject wis- en natuurkunde",
                        "3": null,
                        "4": "Upload",
                    },
                },
                {
                    id: "693b101950150ef74440ee60",
                    values: {
                        "0": "Blaap - EC: 3 - Examiner: User 1",
                        "1": "Blaap",
                        "2": null,
                        "3": "2025-12-14T09:59:46.5Z",
                        "4": "Upload",
                    },
                },
            ],
        },
        {
            name: "completed",
            title: {
                en: "Completed",
                nl: "Voltooid",
            },
            rows: [],
        },
    ],
};

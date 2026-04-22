import {useCallback, useState} from "react";

import type {SearchListBoxValue} from "~/components/instance/SearchListBox.tsx";

const mockOrganizations: SearchListBoxValue[] = [
    {
        key: "amsterdam-center-applied-data-research",
        primaryValue: "Amsterdam Center for Applied Data Research",
    },
    {
        key: "european-institute-cognitive-systems",
        primaryValue: "European Institute for Cognitive Systems",
    },
    {
        key: "netherlands-urban-innovation-lab",
        primaryValue: "Netherlands Urban Innovation Lab",
    },
    {
        key: "global-institute-sustainable-technologies",
        primaryValue: "Global Institute for Sustainable Technologies",
    },
    {
        key: "benelux-cybersecurity-research-alliance",
        primaryValue: "Benelux Cybersecurity Research Alliance",
    },
    {
        key: "institute-advanced-behavioral-analytics",
        primaryValue: "Institute for Advanced Behavioral Analytics",
    },
    {
        key: "northern-europe-quantum-computing-consortium",
        primaryValue: "Northern Europe Quantum Computing Consortium",
    },
    {
        key: "international-center-marine-climate-studies",
        primaryValue: "International Center for Marine & Climate Studies",
    },
    {
        key: "amsterdam-rotterdam-bioinformatics-network",
        primaryValue: "Amsterdam–Rotterdam Bioinformatics Network",
    },
    {
        key: "digital-humanities-collaboration-hub",
        primaryValue: "Digital Humanities Collaboration Hub",
    },
    {
        key: "european-robotics-automation-partnership",
        primaryValue: "European Robotics & Automation Partnership",
    },
    {
        key: "center-ethical-ai-society",
        primaryValue: "Center for Ethical AI and Society",
    },
    {
        key: "lowlands-institute-public-policy-research",
        primaryValue: "Lowlands Institute for Public Policy Research",
    },
    {
        key: "global-health-epidemiology-exchange",
        primaryValue: "Global Health & Epidemiology Exchange",
    },
    {
        key: "amsterdam-corporate-innovation-forum",
        primaryValue: "Amsterdam Corporate Innovation Forum",
    },
];

const initialState = {
    data: [] as SearchListBoxValue[],
    isLoading: false,
    isFetching: false,
};
export function useMockLazyFindOrganizationsQuery() {
    const [state, setState] = useState(initialState);

    const trigger = useCallback(async (query: string) => {
        setState((s) => ({...s, isLoading: true, isFetching: true}));

        // Simulate network delay
        await new Promise((res) => setTimeout(res, 200));

        const filtered = mockOrganizations.filter((inst) =>
            inst.primaryValue.toLowerCase().includes(query.toLowerCase()),
        );

        setState({
            data: filtered,
            isLoading: false,
            isFetching: false,
        });
    }, []);

    const reset = useCallback(() => {
        setState(initialState);
    }, []);

    return [trigger, state, reset] as const;
}

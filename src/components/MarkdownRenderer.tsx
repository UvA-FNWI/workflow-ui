import type {ReactNode} from "react";

import Markdown from "react-markdown";

import {Heading, Text} from "@uva-fnwi/datanose-ui";

interface MarkdownRendererProps {
    children?: string;
}

export function MarkdownRenderer({children}: MarkdownRendererProps) {
    if (!children) return null;

    const renderAsText = ({children}: {children?: ReactNode}) => (
        <Text as="p" className="my-1 block">
            {children}
        </Text>
    );

    return (
        <Markdown
            components={{
                h1: ({children: nodeChildren}) => (
                    <Heading as="h4" size="sm" fontType="body">
                        {nodeChildren}
                    </Heading>
                ),
                h2: ({children: nodeChildren}) => (
                    <Heading as="h5" size="xs">
                        {nodeChildren}
                    </Heading>
                ),
                h3: renderAsText,
                h4: renderAsText,
                h5: renderAsText,
                h6: renderAsText,
                p: renderAsText,
                ul: ({children: nodeChildren}) => (
                    <ul className="my-1 list-disc pl-5">{nodeChildren}</ul>
                ),
                ol: ({children: nodeChildren}) => (
                    <ol className="my-1 list-decimal pl-5">{nodeChildren}</ol>
                ),
                li: ({children: nodeChildren}) => (
                    <li>
                        <Text as="span">{nodeChildren}</Text>
                    </li>
                ),
                a: ({children: nodeChildren, href}) => (
                    <Text as="span" display="inline" className="text-red-500 hover:underline">
                        <a href={href} target="_blank" rel="noreferrer">
                            {nodeChildren}
                            <span className="sr-only"> (opens in new tab)</span>
                        </a>
                    </Text>
                ),
            }}
        >
            {children}
        </Markdown>
    );
}

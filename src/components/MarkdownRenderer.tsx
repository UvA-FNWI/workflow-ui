import type {ReactNode} from "react";

import Markdown from "react-markdown";

import {cn, Heading, Text} from "@uva-fnwi/datanose-ui";

interface MarkdownRendererProps {
    children?: string;
    className?: string;
}

export function MarkdownRenderer({children, className}: MarkdownRendererProps) {
    if (!children) return null;

    const renderAsText = ({children}: {children?: ReactNode}) => (
        <Text as="p" className={cn("wrap-break-word", className)} display="block">
            {children}
        </Text>
    );

    return (
        <Markdown
            components={{
                h1: ({children: nodeChildren}) => (
                    <Heading as="h4" size="sm" fontType="body" className={className}>
                        {nodeChildren}
                    </Heading>
                ),
                h2: ({children: nodeChildren}) => (
                    <Heading as="h5" size="xs" className={className}>
                        {nodeChildren}
                    </Heading>
                ),
                h3: renderAsText,
                h4: renderAsText,
                h5: renderAsText,
                h6: renderAsText,
                p: renderAsText,
                pre: renderAsText,
                code: ({children: nodeChildren}) => (
                    <Text as="span" className={cn("wrap-break-word", className)} display="block">
                        {nodeChildren}
                    </Text>
                ),
                ul: ({children: nodeChildren}) => (
                    <ul className={cn("my-1 list-disc pl-5", className)}>{nodeChildren}</ul>
                ),
                ol: ({children: nodeChildren}) => (
                    <ol className={cn("my-1 list-decimal pl-5", className)}>{nodeChildren}</ol>
                ),
                li: ({children: nodeChildren}) => (
                    <li>
                        <Text as="span" className={className}>
                            {nodeChildren}
                        </Text>
                    </li>
                ),
                a: ({children: nodeChildren, href}) => (
                    <Text
                        as="span"
                        display="inline"
                        className={cn("text-red-500 hover:underline", className)}
                    >
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

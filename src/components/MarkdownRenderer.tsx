import Markdown from "react-markdown";

import {Heading, Text} from "@uva-fnwi/datanose-ui";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
    children?: string;
}

export function MarkdownRenderer({children}: MarkdownRendererProps) {
    if (!children) return null;
    return (
        <Markdown
            rehypePlugins={[rehypeRaw]}
            components={{
                h1: ({children: nodeChildren}) => (
                    <Heading as="h1" size="xl">
                        {nodeChildren}
                    </Heading>
                ),
                h2: ({children: nodeChildren}) => (
                    <Heading as="h2" size="lg">
                        {nodeChildren}
                    </Heading>
                ),
                h3: ({children: nodeChildren}) => (
                    <Heading as="h3" size="md">
                        {nodeChildren}
                    </Heading>
                ),
                h4: ({children: nodeChildren}) => (
                    <Heading as="h4" size="sm">
                        {nodeChildren}
                    </Heading>
                ),
                h5: ({children: nodeChildren}) => (
                    <Heading as="h5" size="xs">
                        {nodeChildren}
                    </Heading>
                ),
                p: ({children}) => (
                    <Text as="p" className="my-1">
                        {children}
                    </Text>
                ),
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
                strong: ({children: nodeChildren}) => (
                    <Text as="b" fontWeight="semibold">
                        {nodeChildren}
                    </Text>
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

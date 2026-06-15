import Markdown from "react-markdown";

import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
    children: string;
}

export function MarkdownRenderer({children}: MarkdownRendererProps) {
    return (
        <Markdown
            rehypePlugins={[rehypeRaw]}
            components={{
                p: ({children}) => <p className="my-1">{children}</p>,
                ul: ({children: nodeChildren}) => (
                    <ul className="my-1 list-disc pl-5">{nodeChildren}</ul>
                ),
                ol: ({children: nodeChildren}) => (
                    <ol className="my-1 list-decimal pl-5">{nodeChildren}</ol>
                ),
                strong: ({children: nodeChildren}) => (
                    <strong className="font-semibold">{nodeChildren}</strong>
                ),
                a: ({children: nodeChildren, href}) => (
                    <a className="text-red-500 hover:underline" href={href} target="_blank">
                        {nodeChildren}
                    </a>
                ),
            }}
        >
            {children}
        </Markdown>
    );
}

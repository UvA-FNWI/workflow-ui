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
                p: ({children}) => <p className="ui:my-3">{children}</p>,
                ul: ({children: nodeChildren}) => (
                    <ul className="ui:my-1 ui:list-disc ui:pl-5">{nodeChildren}</ul>
                ),
                ol: ({children: nodeChildren}) => (
                    <ol className="ui:my-1 ui:list-decimal ui:pl-5">{nodeChildren}</ol>
                ),
                strong: ({children: nodeChildren}) => (
                    <strong className="ui:font-semibold">{nodeChildren}</strong>
                ),
            }}
        >
            {children}
        </Markdown>
    );
}

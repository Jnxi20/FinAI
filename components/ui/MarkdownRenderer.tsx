'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-4 space-y-2">{children}</ol>,
                li: ({ children }) => <li className="pl-1">{children}</li>,
                strong: ({ children }) => <span className="font-bold text-indigo-300">{children}</span>,
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-white">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-white">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-white">{children}</h3>,
                code: ({ children }) => <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-300">{children}</code>,
            }}
        >
            {content}
        </ReactMarkdown>
    );
}

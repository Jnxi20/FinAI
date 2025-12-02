'use client';

import { useState, useEffect, useRef } from 'react';

interface TypewriterMessageProps {
    content: string;
    isStreaming?: boolean;
}

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function TypewriterMessage({ content, isStreaming = false }: TypewriterMessageProps) {
    const [displayedContent, setDisplayedContent] = useState('');
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        // Start immediately if it's the first render or if we haven't started yet
        if (!hasStarted && content) {
            setHasStarted(true);
        }
    }, [content, hasStarted]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayedContent((current) => {
                if (current.length < content.length) {
                    return current + content.charAt(current.length);
                }
                return current;
            });
        }, 10); // Faster speed (10ms) for better feel

        return () => clearInterval(interval);
    }, [content]);

    // If not streaming and fully displayed, ensure we match exactly (just in case)
    useEffect(() => {
        if (!isStreaming && displayedContent.length === content.length) {
            setDisplayedContent(content);
        }
    }, [isStreaming, content, displayedContent]);

    return (
        <div className="relative prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-lg">
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
                {displayedContent}
            </ReactMarkdown>
            {displayedContent.length < content.length && (
                <span className="inline-block w-2 h-5 ml-1 align-middle bg-indigo-500 animate-pulse rounded-sm shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            )}
        </div>
    );
}

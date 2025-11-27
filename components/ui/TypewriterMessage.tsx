'use client';

import { useState, useEffect, useRef } from 'react';

interface TypewriterMessageProps {
    content: string;
    isStreaming?: boolean;
}

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
        <div className="whitespace-pre-wrap relative">
            {displayedContent}
            {displayedContent.length < content.length && (
                <span className="inline-block w-2 h-5 ml-1 align-middle bg-indigo-500 animate-pulse rounded-sm shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            )}
        </div>
    );
}

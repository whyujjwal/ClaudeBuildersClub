"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <p className={`text-sm text-brand-text-muted italic ${className}`}>
        Nothing to preview
      </p>
    );
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-brand-text mt-4 mb-2 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-brand-text mt-3 mb-1.5">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-brand-text mt-2 mb-1">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-brand-text-secondary leading-relaxed mb-2">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-sm text-brand-text-secondary mb-2 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-sm text-brand-text-secondary mb-2 space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-brand-text-secondary">{children}</li>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code className="rounded bg-brand-bg-warm px-1.5 py-0.5 text-xs font-mono text-brand-terracotta" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`block rounded-lg bg-brand-bg-warm p-3 text-xs font-mono text-brand-text overflow-x-auto ${codeClassName}`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="rounded-lg bg-brand-bg-warm p-3 mb-2 overflow-x-auto">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-brand-terracotta/40 pl-3 text-sm text-brand-text-muted italic mb-2">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-2">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-brand-border bg-brand-bg-warm px-3 py-1.5 text-left text-xs font-semibold text-brand-text">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-brand-border px-3 py-1.5 text-xs text-brand-text-secondary">{children}</td>
          ),
          hr: () => <hr className="border-brand-border my-3" />,
          a: ({ href, children }) => (
            <a href={href} className="text-brand-terracotta underline underline-offset-2 hover:text-brand-terracotta-hover" target="_blank" rel="noopener noreferrer">{children}</a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-brand-text">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

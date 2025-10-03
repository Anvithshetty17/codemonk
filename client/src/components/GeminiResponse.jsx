import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

/*
  GeminiResponse
  --------------
  Renders markdown returned from the Gemini API (or other LLMs) with:
  - Headings styled for readability
  - Code blocks syntax highlighted (Prism + atomDark theme)
  - Inline code styled
  - Lists spaced properly
  - Links opening in new tab
*/

const GeminiResponse = ({ markdownText = '' }) => {
  return (
    <div className="markdown-body prose prose-sm max-w-none break-words">
      <ReactMarkdown
        children={markdownText}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  margin: '0.5rem 0',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className={className}
                style={{
                  background: '#f3f4f6',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                }}
                {...props}
              >
                {children}
              </code>
            );
          },
          a({ node, ...props }) {
            return <a target="_blank" rel="noopener noreferrer" {...props} className="text-blue-600 underline" />;
          },
          h1: ({ node, ...props }) => <h2 className="text-base font-bold mt-6 mb-3 pt-2 border-t first:border-t-0 first:pt-0" {...props} />,
          h2: ({ node, ...props }) => <h3 className="text-sm font-semibold mt-5 mb-2 pt-1" {...props} />,
            h3: ({ node, ...props }) => <h4 className="text-sm font-semibold mt-4 mb-2" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc ml-5 space-y-1 my-3" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal ml-5 space-y-1 my-3" {...props} />,
          li: ({ node, ...props }) => <li className="leading-snug" {...props} />,
          p: ({ node, ...props }) => <p className="leading-relaxed mb-3" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
        }}
      />
    </div>
  );
};

export default GeminiResponse;

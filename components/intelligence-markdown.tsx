'use client';

import ReactMarkdown from 'react-markdown';

interface IntelligenceMarkdownProps {
  content: string;
}

export function IntelligenceMarkdown({ content }: IntelligenceMarkdownProps) {
  return (
    <div className="space-y-4">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mt-6 mb-3 uppercase text-sm tracking-wide">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-2">{children}</h3>,
          p: ({ children }) => {
            const text = String(children);
            if (text.includes('💡')) {
              return <p className="text-sm leading-relaxed my-3 p-3 bg-purple-500/10 border-l-4 border-purple-500 rounded-r font-medium">{children}</p>;
            }
            return <p className="text-sm leading-relaxed my-2 text-muted-foreground">{children}</p>;
          },
          ul: ({ children }) => <ul className="space-y-2 my-3 ml-6 list-disc marker:text-purple-500">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-2 my-3 ml-6 list-decimal marker:text-purple-500 marker:font-bold">{children}</ol>,
          li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}


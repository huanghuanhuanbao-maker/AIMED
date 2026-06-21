import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  isUser: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isUser }) => {
  return (
    <div className={`markdown-content ${isUser ? 'text-white' : 'text-slate-800'}`}>
      <ReactMarkdown
        components={{
          ul: ({node, ...props}) => <ul className="list-disc ml-4 my-2 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal ml-4 my-2 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="" {...props} />,
          p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
          h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-md font-semibold my-2" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-medical-500 pl-3 py-1 my-2 bg-slate-50 italic text-slate-600 rounded-r" {...props} />
          ),
          a: ({node, ...props}) => (
            <a className="text-medical-600 underline hover:text-medical-800" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          code: ({node, ...props}) => (
            <code className="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono text-slate-600" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

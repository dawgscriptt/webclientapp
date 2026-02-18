"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-code:before:content-[''] prose-code:after:content-['']">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => <a {...props} className="underline underline-offset-2" />,
          h1: (props) => <h1 {...props} className="text-xl font-semibold" />,
          h2: (props) => <h2 {...props} className="text-lg font-semibold" />,
          h3: (props) => <h3 {...props} className="text-base font-semibold" />,
          code: (props) => (
            <code
              {...props}
              className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-sm"
            />
          ),
          pre: (props) => (
            <pre
              {...props}
              className="overflow-auto rounded-xl border border-border bg-muted p-3 text-sm"
            />
          ),
          blockquote: (props) => (
            <blockquote
              {...props}
              className="border-l-2 border-border pl-3 text-mutedFg"
            />
          ),
          ul: (props) => <ul {...props} className="list-disc pl-5" />,
          ol: (props) => <ol {...props} className="list-decimal pl-5" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

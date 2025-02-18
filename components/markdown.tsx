import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownProps {
  content: string
}

export default function Markdown({ content }: MarkdownProps) {
  return (
    // This container is scrollable with a set maximum height (adjust as needed)
    <div className="markdown-content overflow-y-auto max-h-[600px] pb-[36px]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // All paragraphs will have a bottom padding and white text
          p: ({ node, ...props }) => <p {...props} className="pb-5 text-white" />,
          // Styling for headers
          h1: ({ node, ...props }) => <h1 {...props} className="text-white text-2xl pb-5" />,
          h2: ({ node, ...props }) => <h2 {...props} className="text-white text-xl pb-5" />,
          h3: ({ node, ...props }) => <h3 {...props} className="text-white text-lg pb-5" />,
          // List items will also render white text
          li: ({ node, ...props }) => <li {...props} className="text-white" />,
          // Custom styling for unordered list (bullet points)
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc pl-5 text-white pb-5" />
          ),
          // Optionally, you can style ordered lists if needed
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal pl-5 text-white pb-5" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
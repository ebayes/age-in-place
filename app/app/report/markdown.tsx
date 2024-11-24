import React from 'react';

export const markdownComponents = {
  // Headings
  h1: ({ node, children, ...props }: any) => (
    <h1 className="text-3xl font-bold mt-6 mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ node, children, ...props }: any) => (
    <h2 className="text-2xl font-semibold mt-6 mb-4" {...props}>
      {children}
    </h2>
  ),
  h3: ({ node, children, ...props }: any) => (
    <h3 className="text-xl font-medium mt-6 mb-4" {...props}>
      {children}
    </h3>
  ),
  // Paragraph
  p: ({ node, children, ...props }: any) => (
    <p className="text-base leading-7 mb-4" {...props}>
      {children}
    </p>
  ),
  // Unordered List
  ul: ({ node, children, ...props }: any) => (
    <ul className="list-disc list-inside mb-4" {...props}>
      {children}
    </ul>
  ),
  // Ordered List
  ol: ({ node, children, ...props }: any) => (
    <ol className="list-decimal list-inside mb-4" {...props}>
      {children}
    </ol>
  ),
  // List Item
  li: ({ node, children, ...props }: any) => (
    <li className="mb-2 ml-4" {...props}>
      {children}
    </li>
  ),
  // Blockquote
  blockquote: ({ node, children, ...props }: any) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4" {...props}>
      {children}
    </blockquote>
  ),
  // Bold Text
  strong: ({ node, children, ...props }: any) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  // Italic Text
  em: ({ node, children, ...props }: any) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  // Horizontal Rule
  hr: ({ node, ...props }: any) => (
    <hr className="my-6 border-t" {...props} />
  ),
  // Links
  a: ({ node, children, href, ...props }: any) => (
    <a href={href} className="text-blue-600 underline" {...props}>
      {children}
    </a>
  ),
};
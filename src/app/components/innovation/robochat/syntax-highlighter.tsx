"use client";

import { use } from "react";
import { createHighlighter } from "shiki/bundle/web";

const highlighterPromise = createHighlighter({
  langs: [
    "html",
    "css",
    "js",
    "graphql",
    "javascript",
    "json",
    "jsx",
    "markdown",
    "md",
    "mdx",
    "plaintext",
    "py",
    "python",
    "sh",
    "shell",
    "sql",
    "text",
    "ts",
    "tsx",
    "txt",
    "typescript",
    "zsh",
  ],
  themes: ["aurora-x"],
});

export default function SyntaxHighlighter({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const highlighter = use(highlighterPromise);
  const html = highlighter.codeToHtml(code, {
    lang: language,
    theme: "aurora-x",
  });

  return (
    <div className="p-4 text-sm" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

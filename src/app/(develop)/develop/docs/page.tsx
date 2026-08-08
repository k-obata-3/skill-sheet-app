import fs from "fs";
import path from "path";
import { marked } from "marked";
import "@/styles/markdown.css";

export default async function DocsPage() {
  const mdPath = path.join(process.cwd(), "docs", "functional-requirements.md");
  const mdContent = fs.readFileSync(mdPath, "utf-8");
  const html = await marked(mdContent);

  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

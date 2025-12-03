import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';

export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      properties: {
        className: ['anchor-link'],
        ariaLabel: 'Link to section',
      },
      behavior: 'wrap',
    })
    .use(rehypePrettyCode, {
      theme: 'one-light',
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(file);
}

/**
 * 检测内容是否包含 Markdown 语法（复用之前的逻辑）
 */
export const hasMarkdownSyntax = (content: string): boolean => {
  if (!content) return false;
  const markdownRegex =
    /(^#{1,6}\s+.+)|(\*\*.+\*\*)|(\*.+\*)|(\[.+\]\(.+\))|(`.+`)|(^>\s+.+)|(^-\s+.+)|(^\d+\.\s+.+)|(\|.+\|)|(\$\$.+\$\$)|(\$.+\$)/gm;
  return markdownRegex.test(content);
};

/**
 * 类型定义：缓存解析后的 HTML（避免重复解析）
 */
export type ParsedHtmlCache = Record<string, string>;

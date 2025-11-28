import fs from 'node:fs/promises';
import path from 'node:path';

import matter from 'gray-matter';
import readingTime from 'reading-time';

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

export type Post = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  tags: string[];
  featured: boolean;
  coverImage?: string;
  content: string;
  readingTime: {
    minutes: number;
    text: string;
  };
};

async function readPostFile(fileName: string) {
  debugger;
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = await fs.readFile(fullPath, 'utf-8');
  const { data, content } = matter(fileContents);

  const slug = fileName.replace(/\.mdx?$/, '');

  if (
    !data.title ||
    !data.date ||
    !data.summary ||
    !data.category ||
    !data.tags
  ) {
    throw new Error(`Post ${fileName} is missing required frontmatter fields.`);
  }

  const tags = Array.isArray(data.tags) ? data.tags : [data.tags];
  const featured = Boolean(data.featured);
  const coverImage =
    typeof data.coverImage === 'string' ? data.coverImage : undefined;

  const time = readingTime(content);

  const post: Post = {
    slug,
    title: data.title,
    summary: data.summary,
    date: data.date,
    category: data.category,
    tags,
    featured,
    coverImage,
    content,
    readingTime: {
      minutes: time.minutes,
      text: time.text,
    },
  };

  return post;
}

export async function getAllPosts(): Promise<Post[]> {
  const files = await fs.readdir(postsDirectory);
  const markdownFiles = files.filter(
    (file) => file.endsWith('.md') || file.endsWith('.mdx')
  );
  const posts = await Promise.all(markdownFiles.map(readPostFile));

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getFeaturedPosts(): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.featured).slice(0, 6);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    return await readPostFile(`${slug}.mdx`);
  } catch {
    try {
      return await readPostFile(`${slug}.md`);
    } catch {
      return null;
    }
  }
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter(
    (post) => post.category.toLowerCase() === category.toLowerCase()
  );
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

export async function searchPosts(query: string): Promise<Post[]> {
  const posts = await getAllPosts();
  const normalized = query.trim().toLowerCase();
  if (!normalized) return posts.slice(0, 8);

  return posts.filter((post) => {
    const haystack = [
      post.title,
      post.summary,
      post.category,
      post.tags.join(' '),
      post.content,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

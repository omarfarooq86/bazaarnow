import type { BlogPost, BlogIndex } from "@/types";
import blogIndex from "@/../data/blog-index.json";

export function getBlogPosts(): BlogIndex[] {
  return blogIndex as BlogIndex[];
}

export function getBlogPostBySlug(slug: string): BlogIndex | undefined {
  return (blogIndex as BlogIndex[]).find((p) => p.slug === slug);
}

export async function getBlogPostContent(slug: string) {
  try {
    const post = await import(`@/../data/blog/${slug}.json`);
    return post.default;
  } catch {
    return null;
  }
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug, getBlogPostContent } from "@/lib/blog";
import BlogPostClient from "./BlogPostClient";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Blog titles pair a descriptive head with a long tail after an em dash
 * ("How to Pay with JazzCash Online in Pakistan — Without Getting Charged…").
 * The head alone is the part worth showing, since the root layout appends
 * " | BazaarNow" and only ~60 characters survive in a SERP.
 *
 * The old version appended "..." unconditionally, so a head that already fit
 * still got a stray ellipsis on the end.
 */
function blogSeoTitle(title: string, max = 57): string {
  if (title.length <= 60) return title;
  const head = title.split(" — ")[0].trim();
  if (head.length <= max) return head;
  const cut = head.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim() + "...";
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const seoTitle = blogSeoTitle(post.title);
  return {
    title: seoTitle,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const meta = getBlogPostBySlug(slug);

  if (!meta) {
    notFound();
  }

  const content = await getBlogPostContent(slug);
  if (!content) {
    notFound();
  }

  return <BlogPostClient post={{ ...meta, ...content }} />;
}

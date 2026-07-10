import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug, getBlogPostContent } from "@/lib/blog";
import BlogPostClient from "./BlogPostClient";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const seoTitle = post.title.length > 60 ? post.title.split(" — ")[0].slice(0, 57) + "..." : post.title;
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

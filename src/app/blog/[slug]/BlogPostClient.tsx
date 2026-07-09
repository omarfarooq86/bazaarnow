"use client";

import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Check } from "lucide-react";
import type { BlogPost, BlogSection } from "@/types";
import React from "react";

interface BlogPostClientProps {
  post: BlogPost;
}

// Convert markdown links [text](url) and plain URLs to JSX
function renderContent(text: string): React.ReactNode {
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    const match = part.match(/\[(.*?)\]\((.*?)\)/);
    if (match) {
      const [, label, href] = match;
      if (href.startsWith("http")) {
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-500 underline underline-offset-2 hover:text-brand-600"
          >
            {label}
          </a>
        );
      }
      return (
        <Link
          key={i}
          href={href}
          className="text-brand-500 underline underline-offset-2 hover:text-brand-600"
        >
          {label}
        </Link>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function renderSection(section: BlogSection, index: number) {
  switch (section.type) {
    case "opening":
      return (
        <p key={index} className="text-lg text-charcoal-600 leading-relaxed mb-8 font-medium">
          {renderContent(section.content || "")}
        </p>
      );

    case "tldr":
      return (
        <div key={index} className="bg-brand-50 border border-brand-200 rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-bold text-brand-700 uppercase tracking-wider mb-3">
            {section.title || "TL;DR"}
          </h2>
          <ul className="space-y-1.5">
            {(section.items as string[])?.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-charcoal-700">
                <Check className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "heading":
      return (
        <h2
          key={index}
          id={section.text?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
          className="heading-3 text-dark mt-10 mb-4"
        >
          {section.text}
        </h2>
      );

    case "subheading":
      return (
        <h3 key={index} className="text-lg font-heading font-semibold text-dark mt-6 mb-2">
          {section.text}
        </h3>
      );

    case "paragraph":
      return (
        <p key={index} className="text-sm text-charcoal-600 leading-relaxed mb-4">
          {renderContent(section.content || "")}
        </p>
      );

    case "list":
      return (
        <ul key={index} className="space-y-2 mb-6 ml-4">
          {(section.items as string[])?.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-charcoal-600">
              <span className="text-brand-500 font-bold flex-shrink-0">•</span>
              <span>{renderContent(item)}</span>
            </li>
          ))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={index} className="space-y-3 mb-6 ml-4">
          {(section.items as string[])?.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm text-charcoal-600">
              <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-500 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{renderContent(item)}</span>
            </li>
          ))}
        </ol>
      );

    case "faq":
      return (
        <div key={index} className="space-y-4 mb-8">
          {(section.items as { q: string; a: string }[])?.map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl bg-white border border-charcoal-100 overflow-hidden"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-charcoal-50 transition-colors">
                <span className="text-sm font-semibold text-dark pr-4">{renderContent(faq.q)}</span>
                <span className="text-brand-500 text-lg flex-shrink-0 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm text-charcoal-600 leading-relaxed">{renderContent(faq.a)}</p>
            </details>
          ))}
        </div>
      );

    case "signoff":
      return (
        <div key={index} className="mt-10 p-6 rounded-2xl bg-dark text-white">
          <p className="text-sm leading-relaxed text-charcoal-200 italic">{renderContent(section.content || "")}</p>
        </div>
      );

    default:
      return null;
  }
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  return (
    <>
      <article className="container-custom py-8 max-w-3xl">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal-400 hover:text-brand-500 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Blog
        </Link>

        {/* Header */}
        <div className="mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold mb-3">
            {post.tag}
          </span>
          <h1 className="heading-1 text-dark mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
            <span>By {post.author}</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose-custom">
          {post.sections.map((section, index) => renderSection(section, index))}
        </div>

        {/* Author bio */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-charcoal-100">
          <p className="text-sm font-semibold text-dark mb-1">About the Author</p>
          <p className="text-sm font-heading font-bold text-brand-600 mb-2">
            {post.author}
          </p>
          <p className="text-sm text-charcoal-500 leading-relaxed">
            {post.authorBio}
          </p>
        </div>

        {/* Article structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: post.title,
              description: post.excerpt,
              image: post.image,
              datePublished: post.date,
              dateModified: post.date,
              author: {
                "@type": "Person",
                name: post.author,
              },
              publisher: {
                "@type": "Organization",
                name: "BazaarNow",
                url: "https://www.bazaarnow.net",
              },
            }),
          }}
        />
        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity:
                post.sections
                  .filter((s) => s.type === "faq")
                  .flatMap((s) =>
                    (s.items as { q: string; a: string }[]).map((faq) => ({
                      "@type": "Question",
                      name: faq.q,
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: faq.a,
                      },
                    }))
                  ),
            }),
          }}
        />
        {/* BreadcrumbList */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://www.bazaarnow.net",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Blog",
                  item: "https://www.bazaarnow.net/blog",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: post.title,
                },
              ],
            }),
          }}
        />
      </article>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { getBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Online Shopping Guides Pakistan",
  description:
    "Tips, guides, and honest advice about online shopping in Pakistan. COD guides, payment advice, product recommendations, and more.",
  openGraph: {
    title: "BazaarNow Blog — Online Shopping Guides Pakistan",
    description:
      "Tips, guides, and honest advice about online shopping in Pakistan.",
  },
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <>
      <section className="bg-dark py-16">
        <div className="container-custom text-center">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
            Guides & Stories
          </span>
          <h1 className="heading-1 text-white mt-2 mb-4">BazaarNow Blog</h1>
          <p className="text-charcoal-300 text-base max-w-2xl mx-auto">
            Honest advice about online shopping in Pakistan. No fluff. No
            &quot;unlock your potential.&quot; Just useful stuff.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom max-w-3xl">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-charcoal-400 text-lg font-medium">
                No posts yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="rounded-2xl bg-white border border-charcoal-100 p-6 hover:border-brand-200 hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-center gap-3 text-xs text-charcoal-400 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 font-semibold">
                      {post.tag}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <Link href={`/blog/${post.slug}`} className="group">
                    <h2 className="heading-3 text-dark mb-2 group-hover:text-brand-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-sm text-charcoal-500 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-charcoal-400">
                      By {post.author}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                    >
                      Read Article
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

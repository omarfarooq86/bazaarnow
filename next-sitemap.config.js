/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.bazaarnow.net",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ["/checkout*", "/cart*", "/search*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    additionalSitemaps: ["https://www.bazaarnow.net/sitemap.xml"],
  },
};

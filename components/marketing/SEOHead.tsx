"use client";

import { useEffect } from "react";

const SEO_DATA: Record<
  string,
  { title: string; description: string; keywords?: string; ogImage?: string }
> = {
  Home: {
    title: "StewardOS — Church Guest Retention & Care Management System",
    description:
      "Close the back door of your church. StewardOS automates visitor follow-up, tracks every guest's journey, and alerts you before anyone falls through the cracks. Built for churches 75–400+.",
    keywords:
      "church guest retention, visitor follow-up software, church care management, church CRM, pastor tools, guest journey church, church growth software",
    ogImage: "https://images.unsplash.com/photo-1545236487-e0c3e6a1b2f9?w=1200&q=80",
  },
  Features: {
    title: "Features — StewardOS Church Care Platform",
    description:
      "AI-powered follow-up, automated care workflows, volunteer coordination, and retention analytics — everything a pastor needs to care for every person.",
    keywords:
      "church software features, AI church follow-up, church workflow automation, guest care platform",
  },
  Pricing: {
    title: "Pricing — StewardOS | Start Free, No Credit Card",
    description:
      "Simple, transparent pricing for churches of every size. Start your 14-day free trial — no credit card required. Plans from $89/month.",
    keywords:
      "church software pricing, church CRM cost, affordable church management software",
  },
  Demo: {
    title: "Book a Live Demo — StewardOS",
    description:
      "See StewardOS in action. Book a 30-minute demo and see how churches like yours are closing the back door and growing through genuine care.",
    keywords: "StewardOS demo, church software demo, book a demo",
  },
  About: {
    title: "About StewardOS — Built for Pastors Who Care Deeply",
    description:
      "StewardOS was built by a team that believes every person who walks through your doors deserves to be genuinely known and cared for.",
    keywords: "about StewardOS, church care software company",
  },
  "Visitor Journey": {
    title: "The 5-Stage Visitor Journey System — StewardOS",
    description:
      "A proven, research-backed framework for turning first-time visitors into fully-committed members. The 5-stage visitor journey built into every StewardOS account.",
    keywords:
      "church visitor journey, first time visitor church, church assimilation, guest to member",
  },
  Implementation: {
    title: "Implementation & Onboarding — StewardOS",
    description:
      "We set everything up for you. White-glove onboarding, data migration, and a 30-day launch plan so your church is fully operational from day one.",
    keywords: "church software onboarding, church CRM setup, StewardOS implementation",
  },
  Resources: {
    title: "Resources & Blog — StewardOS Church Leadership",
    description:
      "Practical guides, case studies, and pastoral insights on guest retention, church growth, and building a culture of genuine care.",
    keywords:
      "church growth blog, visitor retention tips, pastoral care resources, church leadership",
  },
};

function pathToPageName(path: string): string {
  const map: Record<string, string> = {
    "/": "Home",
    "/features": "Features",
    "/pricing": "Pricing",
    "/demo": "Demo",
    "/about": "About",
    "/visitor-journey": "Visitor Journey",
    "/implementation": "Implementation",
    "/resources": "Resources",
  };
  return map[path] ?? "Home";
}

export default function SEOHead({ pageName }: { pageName?: string }) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const resolvedName = pageName ?? pathToPageName(pathname);
  const seo = SEO_DATA[resolvedName] ?? SEO_DATA.Home;

  useEffect(() => {
    document.title = seo.title;

    const setMeta = (name: string, content: string, prop = false) => {
      const attr = prop ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setMeta("description", seo.description);
    setMeta("keywords", seo.keywords ?? "");
    setMeta("robots", "index, follow");
    setMeta("author", "StewardOS");
    setMeta("og:title", seo.title, true);
    setMeta("og:description", seo.description, true);
    setMeta("og:type", "website", true);
    setMeta("og:site_name", "StewardOS", true);
    if (seo.ogImage) setMeta("og:image", seo.ogImage, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", seo.title);
    setMeta("twitter:description", seo.description);

    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "StewardOS",
      applicationCategory: "BusinessApplication",
      description: SEO_DATA.Home.description,
      offers: { "@type": "Offer", price: "89", priceCurrency: "USD" },
      operatingSystem: "Web",
    };
    let jsonLd = document.getElementById("seo-jsonld");
    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.id = "seo-jsonld";
      jsonLd.setAttribute("type", "application/ld+json");
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(schema);
  }, [resolvedName, seo.title, seo.description, seo.keywords, seo.ogImage]);

  return null;
}

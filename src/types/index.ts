export interface Product {
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  images: string[];
  videoUrl?: string;
  inStock: boolean;
  stockCount?: number;
  isFeatured: boolean;
  tags: string[];
  deliveryInfo: string;
  sku?: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  productCount: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  image: string;
  bgColor: string;
  textColor: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  social: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  paymentMethods: PaymentMethod[];
  bankDetails: BankDetail[];
  deliveryCities: string[];
  deliveryTime: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: "cod" | "advance";
}

export interface BankDetail {
  bank: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentType = "cod" | "advance";

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  text: string;
  avatar: string;
}

export interface BlogIndex {
  slug: string;
  title: string;
  date: string;
  author: string;
  tag: string;
  readTime: string;
  excerpt: string;
  image: string;
}

export interface BlogSection {
  type: "opening" | "tldr" | "heading" | "subheading" | "paragraph" | "list" | "orderedList" | "faq" | "signoff";
  content?: string;
  title?: string;
  text?: string;
  items?: (string | { q: string; a: string })[];
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  authorBio: string;
  tag: string;
  readTime: string;
  excerpt: string;
  image: string;
  sections: BlogSection[];
}

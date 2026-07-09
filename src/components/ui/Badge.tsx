interface BadgeProps {
  children: React.ReactNode;
  variant?: "sale" | "new" | "cod" | "featured";
  className?: string;
}

export default function Badge({ children, variant = "sale", className = "" }: BadgeProps) {
  const variants = {
    sale: "badge-sale",
    new: "badge-new",
    cod: "badge-cod",
    featured:
      "bg-gold-500 text-dark text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1",
  };

  return <span className={`${variants[variant]} ${className}`}>{children}</span>;
}

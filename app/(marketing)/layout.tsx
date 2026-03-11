import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />
      <main className="pt-14 lg:pt-20">{children}</main>
      <MarketingFooter />
    </div>
  );
}

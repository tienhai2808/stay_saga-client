import { CustomerLayoutClient } from "@/components/layout/customer-layout-client";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <CustomerLayoutClient>{children}</CustomerLayoutClient>;
}

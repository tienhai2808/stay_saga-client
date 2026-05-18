import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";

interface PaymentResultPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const allowedStatuses = new Set(["success", "cancel"]);

export default async function PaymentResultPage({ searchParams }: PaymentResultPageProps) {
  const params = await searchParams;
  const rawStatus = params.status;
  const status = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;

  if (!status) {
    notFound();
  }

  const normalizedStatus = status.toLowerCase();
  if (!allowedStatuses.has(normalizedStatus)) {
    notFound();
  }

  const isSuccess = normalizedStatus === "success";
  const result = isSuccess
    ? {
        label: "Payment successful",
        variant: "default" as const,
        description: "Your payment has been completed successfully.",
      }
    : {
        label: "Payment cancelled",
        variant: "destructive" as const,
        description: "Your payment was cancelled. Please try again if needed.",
      };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Result"
        description="Payment status returned from the payment gateway."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Transaction status</span>
            <Badge variant={result.variant}>{result.label}</Badge>
          </CardTitle>
          <CardDescription>{result.description}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          You can return to room types to create a new booking anytime.
        </CardContent>
      </Card>
    </div>
  );
}

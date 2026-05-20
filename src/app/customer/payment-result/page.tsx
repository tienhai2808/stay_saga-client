import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";

interface PaymentResultPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

type PaymentResultState = "success" | "cancel" | "failed";

function getSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseBooleanFlag(
  value: string | undefined,
): boolean | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  return undefined;
}

function resolvePaymentResult(params: Record<string, string | string[] | undefined>): PaymentResultState | null {
  const status = getSingleValue(params.status)?.toLowerCase();
  const code = getSingleValue(params.code);
  const cancel = parseBooleanFlag(getSingleValue(params.cancel));

  if (cancel === true) return "cancel";

  const successStatuses = new Set(["success", "paid"]);
  const cancelStatuses = new Set(["cancel", "cancelled", "canceled"]);
  const failedStatuses = new Set(["failed", "fail", "error", "expired"]);

  if (code === "00" || (status && successStatuses.has(status))) return "success";
  if (status && cancelStatuses.has(status)) return "cancel";
  if (status && failedStatuses.has(status)) return "failed";

  if (cancel === false && code) return code === "00" ? "success" : "failed";

  return null;
}

export default async function PaymentResultPage({ searchParams }: PaymentResultPageProps) {
  const params = await searchParams;
  const paymentResult = resolvePaymentResult(params);
  if (!paymentResult) {
    notFound();
  }

  const result = paymentResult === "success"
    ? {
        label: "Payment successful",
        variant: "default" as const,
        description: "Your payment has been completed successfully.",
      }
    : paymentResult === "cancel"
      ? {
        label: "Payment cancelled",
        variant: "destructive" as const,
        description: "Your payment was cancelled. Please try again if needed.",
      }
      : {
        label: "Payment failed",
        variant: "destructive" as const,
        description: "Your payment was not completed. Please try again.",
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

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { LoadingScreen } from "@/components/common/loading-screen";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { paymentService } from "@/services/payment.service";
import { getErrorMessage } from "@/lib/http/client";

export default function CustomerPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastProcessedBookingId = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const openCheckout = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    if (!bookingId || !/^\d+$/.test(bookingId)) {
      toast.error("Missing booking reference. Please choose a booking to continue payment.");
      router.replace("/customer/bookings");
      return;
    }

    if (lastProcessedBookingId.current === bookingId) {
      return;
    }
    lastProcessedBookingId.current = bookingId;

    const processPayment = async () => {
      try {
        setLoading(true);
        const response = await paymentService.process({ bookingId });
        const paymentData = response.data.data;
        if (!paymentData) {
          throw new Error("Payment data was not returned");
        }

        setCheckoutUrl(paymentData.checkoutUrl);
        toast.success(response.data.message);
        openCheckout(paymentData.checkoutUrl);
      } catch (error) {
        toast.error(getErrorMessage(error));
        router.replace("/customer/bookings");
      } finally {
        setLoading(false);
      }
    };

    void processPayment();
  }, [router, searchParams]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking Payment"
        description="Creating your payment session and opening PayOS checkout."
      />

      {loading ? <LoadingScreen label="Preparing secure checkout..." /> : null}

      {!loading && checkoutUrl ? (
        <Card>
          <CardHeader>
            <CardTitle>Checkout ready</CardTitle>
            <CardDescription>If the checkout tab did not open, click below to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="mt-2 w-fit"
              onClick={() => openCheckout(checkoutUrl)}
            >
              <ExternalLink className="h-4 w-4" />
              Open checkout
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

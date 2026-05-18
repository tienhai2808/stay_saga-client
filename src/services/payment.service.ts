import { apiClient } from "@/lib/http/client";
import type { ApiEnvelope } from "@/types/api";
import type { ProcessPaymentRequest, ProcessPaymentResponse } from "@/types/payment";

export const paymentService = {
  process(payload: ProcessPaymentRequest) {
    return apiClient.post<ApiEnvelope<ProcessPaymentResponse>>("/payments", payload);
  },
};

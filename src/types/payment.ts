export interface ProcessPaymentRequest {
  bookingId: string;
}

export interface ProcessPaymentResponse {
  paymentId: number;
  bookingId: number;
  orderCode: number;
  paymentLinkId: string;
  checkoutUrl: string;
  qrCode: string;
  provider: string;
  method: string;
  status: string;
}

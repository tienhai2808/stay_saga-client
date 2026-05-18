export interface CreateBookingRequest {
  roomTypeId: string;
  roomCount: number;
  guestCount: number;
  checkIn: string;
  checkOut: string;
}

export interface CreateBookingData {
  id: string;
}

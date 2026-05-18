"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Paginator } from "@/components/common/paginator";
import { DEFAULT_ORDER, DEFAULT_PAGE_SIZE, DEFAULT_SORT } from "@/lib/constants";
import { getErrorMessage } from "@/lib/http/client";
import { formatCurrency, toIsoDateStart } from "@/lib/utils";
import { bookingService } from "@/services/booking.service";
import { roomTypeService } from "@/services/room-type.service";
import type { MetaResponse } from "@/types/api";
import type { CreateBookingRequest } from "@/types/booking";
import type { RoomTypeResponse } from "@/types/property";

const bookingSchema = z
  .object({
    roomCount: z
      .string()
      .regex(/^\d+$/, "Room count must be a positive integer")
      .refine((value) => Number(value) > 0, "Room count must be greater than 0"),
    guestCount: z
      .string()
      .regex(/^\d+$/, "Guest count must be a positive integer")
      .refine((value) => Number(value) > 0, "Guest count must be greater than 0"),
    checkIn: z.string().min(1, "Check-in date is required"),
    checkOut: z.string().min(1, "Check-out date is required"),
  })
  .refine((values) => values.checkOut > values.checkIn, {
    message: "Check-out date must be after check-in date",
    path: ["checkOut"],
  });

type BookingFormValues = z.infer<typeof bookingSchema>;

const emptyMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPage: 0,
  hasPrev: false,
  hasNext: false,
};

export default function CustomerRoomTypesPage() {
  const router = useRouter();
  const [items, setItems] = useState<RoomTypeResponse[]>([]);
  const [meta, setMeta] = useState<MetaResponse>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [propertyFilterInput, setPropertyFilterInput] = useState("");
  const [search, setSearch] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [order, setOrder] = useState<"asc" | "desc">(DEFAULT_ORDER);
  const [page, setPage] = useState(1);
  const [openBooking, setOpenBooking] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomTypeResponse | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const bookingForm = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      roomCount: "1",
      guestCount: "1",
      checkIn: "",
      checkOut: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await roomTypeService.list({
          page,
          limit: DEFAULT_PAGE_SIZE,
          search,
          sort,
          order,
          propertyId,
        });

        setItems(response.data.data?.roomTypes ?? []);
        setMeta(response.data.data?.meta ?? emptyMeta);
      } catch (fetchError) {
        setError(getErrorMessage(fetchError, "Unable to load room type list"));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [order, page, propertyId, search, sort]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
    setPropertyId(propertyFilterInput.trim());
  };

  const openBookingDialog = (roomType: RoomTypeResponse) => {
    setSelectedRoomType(roomType);
    bookingForm.reset({
      roomCount: "1",
      guestCount: "1",
      checkIn: "",
      checkOut: "",
    });
    setOpenBooking(true);
  };

  const onBookingSubmit = async (values: BookingFormValues) => {
    if (!selectedRoomType) {
      return;
    }

    const payload: CreateBookingRequest = {
      roomTypeId: selectedRoomType.id,
      roomCount: Number(values.roomCount),
      guestCount: Number(values.guestCount),
      checkIn: toIsoDateStart(values.checkIn),
      checkOut: toIsoDateStart(values.checkOut),
    };

    try {
      setSubmitLoading(true);
      const response = await bookingService.create(payload);
      const bookingId = response.data.data?.id;
      if (!bookingId) {
        throw new Error("Booking ID was not returned");
      }

      toast.success(response.data.message);
      setOpenBooking(false);
      router.push(`/customer/payment?bookingId=${bookingId}`);
    } catch (submitError) {
      toast.error(getErrorMessage(submitError));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room Type List"
        description="Choose a suitable room type and book directly."
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_170px_170px_auto]">
            <Input
              placeholder="Search by room type name..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            <Input
              placeholder="Filter Property ID"
              value={propertyFilterInput}
              onChange={(event) => setPropertyFilterInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            <Select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
            >
              <option value="name">Sort: Name</option>
              <option value="id">Sort: ID</option>
              <option value="price">Sort: Price</option>
            </Select>

            <Select
              value={order}
              onChange={(event) => {
                setOrder(event.target.value as "asc" | "desc");
                setPage(1);
              }}
            >
              <option value="asc">Order: Asc</option>
              <option value="desc">Order: Desc</option>
            </Select>

            <Button variant="outline" onClick={handleSearch}>
              Search
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {loading ? <p className="text-sm text-muted-foreground">Loading data...</p> : null}
          {!loading && items.length === 0 ? <EmptyState label="No matching room types found." /> : null}

          {!loading && items.length > 0 ? (
            <>
              <div className="space-y-3 md:hidden">
                {items.map((item) => (
                  <div key={item.id} className="space-y-3 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.property.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>Price: {formatCurrency(item.price)}</p>
                      <p>Capacity: {item.maxGuest}</p>
                      <p>Total rooms: {item.totalRoom}</p>
                    </div>
                    <Button size="sm" className="w-full" onClick={() => openBookingDialog(item)}>
                      <CalendarDays className="h-4 w-4" />
                      Book
                    </Button>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <Table className="min-w-[920px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room type</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Total rooms</TableHead>
                      <TableHead className="w-[140px] text-right">Book</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <p>{item.property.name}</p>
                        </TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{item.maxGuest}</TableCell>
                        <TableCell>{item.totalRoom}</TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button size="sm" onClick={() => openBookingDialog(item)}>
                              <CalendarDays className="h-4 w-4" />
                              Book
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Paginator meta={meta} onPageChange={(nextPage) => setPage(nextPage)} />
            </>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={openBooking} onOpenChange={setOpenBooking}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new booking</DialogTitle>
            <DialogDescription>
              {selectedRoomType
                ? `Room type: ${selectedRoomType.name} - ${selectedRoomType.property.name}`
                : "Fill in the details to place a booking."}
            </DialogDescription>
          </DialogHeader>

          <Form {...bookingForm}>
            <form className="space-y-4" onSubmit={bookingForm.handleSubmit(onBookingSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={bookingForm.control}
                  name="roomCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room count</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bookingForm.control}
                  name="guestCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest count</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={bookingForm.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bookingForm.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenBooking(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitLoading}>
                  {submitLoading ? "Processing..." : "Confirm booking"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

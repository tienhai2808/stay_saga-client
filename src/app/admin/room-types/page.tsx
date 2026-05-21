"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { formatCurrency } from "@/lib/utils";
import { propertyService } from "@/services/property.service";
import { roomTypeService } from "@/services/room-type.service";
import type { MetaResponse } from "@/types/api";
import type {
  BasicPropertyOption,
  RoomTypeRequest,
  RoomTypeResponse,
} from "@/types/property";

const roomTypeSchema = z.object({
  name: z.string().min(1, "Room type name is required"),
  propertyId: z.string().min(1, "Property is required"),
  price: z
    .string()
    .refine((value) => !Number.isNaN(Number(value)), "Invalid room price")
    .refine((value) => Number(value) > 0, "Price must be greater than 0"),
  maxGuest: z
    .string()
    .regex(/^\d+$/, "Capacity must be a positive integer")
    .refine((value) => Number(value) > 0, "Capacity must be greater than 0"),
  totalRoom: z
    .string()
    .regex(/^\d+$/, "Total rooms must be a positive integer")
    .refine((value) => Number(value) > 0, "Total rooms must be greater than 0"),
});

type RoomTypeFormValues = z.infer<typeof roomTypeSchema>;

const emptyMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPage: 0,
  hasPrev: false,
  hasNext: false,
};

export default function AdminRoomTypesPage() {
  const [items, setItems] = useState<RoomTypeResponse[]>([]);
  const [propertyOptions, setPropertyOptions] = useState<BasicPropertyOption[]>([]);
  const [meta, setMeta] = useState<MetaResponse>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [propertyFilterInput, setPropertyFilterInput] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [order, setOrder] = useState<"asc" | "desc">(DEFAULT_ORDER);
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState<RoomTypeResponse | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const form = useForm<RoomTypeFormValues>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      name: "",
      propertyId: "",
      price: "0",
      maxGuest: "1",
      totalRoom: "1",
    },
  });

  useEffect(() => {
    const fetchPropertyOptions = async () => {
      try {
        const response = await propertyService.listBasic();
        const data = response.data.data;
        const normalized = data?.properties ?? data?.property ?? data?.items ?? [];
        setPropertyOptions(normalized);
      } catch (fetchError) {
        toast.error(getErrorMessage(fetchError, "Unable to load property options"));
      }
    };

    void fetchPropertyOptions();
  }, []);

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

  const dialogTitle = useMemo(
    () => (editingItem ? "Update Room Type" : "Create New Room Type"),
    [editingItem],
  );

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
    setPropertyId(propertyFilterInput.trim());
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    form.reset({
      name: "",
      propertyId: propertyFilterInput || "",
      price: "0",
      maxGuest: "1",
      totalRoom: "1",
    });
    setOpenForm(true);
  };

  const openEditDialog = (item: RoomTypeResponse) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      propertyId: item.property.id,
      price: String(item.price),
      maxGuest: String(item.maxGuest),
      totalRoom: String(item.totalRoom),
    });
    setOpenForm(true);
  };

  const onSubmit = async (values: RoomTypeFormValues) => {
    const payload: RoomTypeRequest = {
      name: values.name,
      propertyId: values.propertyId.trim(),
      price: Number(values.price),
      maxGuest: Number(values.maxGuest),
      totalRoom: Number(values.totalRoom),
    };

    try {
      setSubmitLoading(true);
      if (editingItem) {
        const response = await roomTypeService.update(editingItem.id, payload);
        toast.success(response.data.message);
      } else {
        const response = await roomTypeService.create(payload);
        toast.success(response.data.message);
      }

      setOpenForm(false);
      const refreshed = await roomTypeService.list({
        page,
        limit: DEFAULT_PAGE_SIZE,
        search,
        sort,
        order,
        propertyId,
      });

      setItems(refreshed.data.data?.roomTypes ?? []);
      setMeta(refreshed.data.data?.meta ?? emptyMeta);
    } catch (submitError) {
      toast.error(getErrorMessage(submitError));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await roomTypeService.remove(id);
      toast.success(response.data.message);

      const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);

      const refreshed = await roomTypeService.list({
        page: nextPage,
        limit: DEFAULT_PAGE_SIZE,
        search,
        sort,
        order,
        propertyId,
      });

      setItems(refreshed.data.data?.roomTypes ?? []);
      setMeta(refreshed.data.data?.meta ?? emptyMeta);
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room Type Management"
        description="Manage room types by property with search and pagination."
        action={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Create
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_170px_170px_auto]">
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

            <Select
              value={propertyFilterInput}
              onChange={(event) => setPropertyFilterInput(event.target.value)}
            >
              <option value="">All properties</option>
              {propertyOptions.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </Select>

            <Select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
            >
              <option value="name">Sort: Name</option>
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

          {!loading && items.length === 0 ? <EmptyState label="No room types yet." /> : null}

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
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete room type?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
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
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="outline" onClick={() => openEditDialog(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete room type?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Fill in all required room type information before saving.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room type name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="">Select a property</option>
                        {propertyOptions.map((property) => (
                          <option key={property.id} value={property.id}>
                            {property.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room price</FormLabel>
                      <FormControl>
                        <Input type="number" step="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxGuest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalRoom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total rooms</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitLoading}>
                  {submitLoading ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

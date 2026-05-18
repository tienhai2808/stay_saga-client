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
import { normalizeTimeValue } from "@/lib/utils";
import { propertyService } from "@/services/property.service";
import type { MetaResponse } from "@/types/api";
import type { PropertyRequest, PropertyResponse } from "@/types/property";

const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address: z.string().min(1, "Address is required"),
  ward: z.string().min(1, "Ward is required"),
  city: z.string().min(1, "City is required"),
  latitude: z
    .string()
    .refine((value) => !Number.isNaN(Number(value)), "Invalid latitude")
    .refine((value) => Number(value) >= -90 && Number(value) <= 90, "Latitude must be between -90 and 90"),
  longitude: z
    .string()
    .refine((value) => !Number.isNaN(Number(value)), "Invalid longitude")
    .refine(
      (value) => Number(value) >= -180 && Number(value) <= 180,
      "Longitude must be between -180 and 180",
    ),
  checkInTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Invalid check-in time"),
  checkOutTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Invalid check-out time"),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

const emptyMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPage: 0,
  hasPrev: false,
  hasNext: false,
};

export default function AdminPropertiesPage() {
  const [items, setItems] = useState<PropertyResponse[]>([]);
  const [meta, setMeta] = useState<MetaResponse>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [order, setOrder] = useState<"asc" | "desc">(DEFAULT_ORDER);
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PropertyResponse | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      address: "",
      ward: "",
      city: "",
      latitude: "0",
      longitude: "0",
      checkInTime: "14:00",
      checkOutTime: "12:00",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await propertyService.list({
          page,
          limit: DEFAULT_PAGE_SIZE,
          search,
          sort,
          order,
        });

        setItems(response.data.data?.properties ?? []);
        setMeta(response.data.data?.meta ?? emptyMeta);
      } catch (fetchError) {
        setError(getErrorMessage(fetchError, "Unable to load property list"));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [order, page, search, sort]);

  const dialogTitle = useMemo(
    () => (editingItem ? "Update Property" : "Create New Property"),
    [editingItem],
  );

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    form.reset({
      name: "",
      address: "",
      ward: "",
      city: "",
      latitude: "0",
      longitude: "0",
      checkInTime: "14:00",
      checkOutTime: "12:00",
    });
    setOpenForm(true);
  };

  const openEditDialog = (item: PropertyResponse) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      address: item.address,
      ward: item.ward,
      city: item.city,
      latitude: String(item.latitude),
      longitude: String(item.longitude),
      checkInTime: item.checkInTime.slice(0, 5),
      checkOutTime: item.checkOutTime.slice(0, 5),
    });
    setOpenForm(true);
  };

  const onSubmit = async (values: PropertyFormValues) => {
    const payload: PropertyRequest = {
      ...values,
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      checkInTime: normalizeTimeValue(values.checkInTime),
      checkOutTime: normalizeTimeValue(values.checkOutTime),
    };

    try {
      setSubmitLoading(true);
      if (editingItem) {
        const response = await propertyService.update(editingItem.id, payload);
        toast.success(response.data.message);
      } else {
        const response = await propertyService.create(payload);
        toast.success(response.data.message);
      }

      setOpenForm(false);
      setPage(1);
      setSearch("");
      setSearchInput("");
      const refreshed = await propertyService.list({
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        sort,
        order,
        search: "",
      });

      setItems(refreshed.data.data?.properties ?? []);
      setMeta(refreshed.data.data?.meta ?? emptyMeta);
    } catch (submitError) {
      toast.error(getErrorMessage(submitError));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await propertyService.remove(id);
      toast.success(response.data.message);

      const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);

      const refreshed = await propertyService.list({
        page: nextPage,
        limit: DEFAULT_PAGE_SIZE,
        search,
        sort,
        order,
      });

      setItems(refreshed.data.data?.properties ?? []);
      setMeta(refreshed.data.data?.meta ?? emptyMeta);
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Property Management"
        description="Create, update, delete, and browse properties with pagination."
        action={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Create
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_170px_auto]">
            <Input
              placeholder="Search by name, address, city..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
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
              <option value="address">Sort: Address</option>
              <option value="ward">Sort: Ward</option>
              <option value="city">Sort: City</option>
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

          {!loading && items.length === 0 ? <EmptyState label="No properties yet." /> : null}

          {!loading && items.length > 0 ? (
            <>
              <div className="space-y-3 md:hidden">
                {items.map((item) => (
                  <div key={item.id} className="space-y-3 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.address}</p>
                      <p className="text-sm text-muted-foreground">{item.city}</p>
                    </div>
                    <p className="text-sm">
                      {item.checkInTime.slice(0, 5)} - {item.checkOutTime.slice(0, 5)}
                    </p>
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
                            <AlertDialogTitle>Delete property?</AlertDialogTitle>
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
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Check-in/out</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.address}</TableCell>
                        <TableCell>{item.city}</TableCell>
                        <TableCell>
                          {item.checkInTime.slice(0, 5)} - {item.checkOutTime.slice(0, 5)}
                        </TableCell>
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
                                  <AlertDialogTitle>Delete property?</AlertDialogTitle>
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

              <Paginator
                meta={meta}
                onPageChange={(nextPage) => {
                  setPage(nextPage);
                }}
              />
            </>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Fill in all required information before saving the property.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="checkInTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkOutTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
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

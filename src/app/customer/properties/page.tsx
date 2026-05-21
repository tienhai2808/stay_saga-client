"use client";

import { useEffect, useState } from "react";
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
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Paginator } from "@/components/common/paginator";
import { DEFAULT_ORDER, DEFAULT_PAGE_SIZE, DEFAULT_SORT } from "@/lib/constants";
import { getErrorMessage } from "@/lib/http/client";
import { propertyService } from "@/services/property.service";
import type { MetaResponse } from "@/types/api";
import type { PropertyResponse } from "@/types/property";

const emptyMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPage: 0,
  hasPrev: false,
  hasNext: false,
};

export default function CustomerPropertiesPage() {
  const [items, setItems] = useState<PropertyResponse[]>([]);
  const [meta, setMeta] = useState<MetaResponse>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [order, setOrder] = useState<"asc" | "desc">(DEFAULT_ORDER);
  const [page, setPage] = useState(1);

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

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Property List"
        description="Search and explore available properties in the system."
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
              <option value="address">Sort: Address</option>
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
          {!loading && items.length === 0 ? <EmptyState label="No properties found." /> : null}

          {!loading && items.length > 0 ? (
            <>
              <div className="space-y-3 md:hidden">
                {items.map((item) => (
                  <div key={item.id} className="space-y-2 rounded-lg border p-3">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.address}, {item.ward}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.city}</p>
                    <p className="text-sm">
                      {item.checkInTime.slice(0, 5)} - {item.checkOutTime.slice(0, 5)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Check-in/out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          {item.address}, {item.ward}
                        </TableCell>
                        <TableCell>{item.city}</TableCell>
                        <TableCell>
                          {item.checkInTime.slice(0, 5)} - {item.checkOutTime.slice(0, 5)}
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
    </div>
  );
}

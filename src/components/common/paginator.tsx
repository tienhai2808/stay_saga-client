import { Button } from "@/components/ui/button";
import type { MetaResponse } from "@/types/api";

interface PaginatorProps {
  meta: MetaResponse;
  onPageChange: (page: number) => void;
}

export function Paginator({ meta, onPageChange }: PaginatorProps) {
  return (
    <div className="mt-4 flex items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">
        Page {meta.page} / {Math.max(meta.totalPage, 1)} - Total {meta.total} records
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasPrev}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasNext}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

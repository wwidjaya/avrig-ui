import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "./Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./Table";
import { cn } from "../lib/utils";

export interface ColumnDef<TData> {
  key: string;
  header: React.ReactNode;
  cell?: (row: TData) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: TData) => string | number | null | undefined;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pageSize?: number;
  className?: string;
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData, index: number) => React.Key;
  filterable?: boolean;
  emptyMessage?: React.ReactNode;
}

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  pageSize = 10,
  className,
  onRowClick,
  getRowId,
  filterable = true,
  emptyMessage = "No results."
}: DataTableProps<TData>) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [filter, setFilter] = React.useState("");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const filteredData = React.useMemo(() => {
    const query = filter.trim().toLocaleLowerCase();
    if (!query) return data;
    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.key];
        return String(value ?? "").toLocaleLowerCase().includes(query);
      })
    );
  }, [columns, data, filter]);

  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;
    const column = columns.find((item) => item.key === sortKey);
    return [...filteredData].sort((a, b) => {
      const aValue = column?.sortValue ? column.sortValue(a) : a[sortKey];
      const bValue = column?.sortValue ? column.sortValue(b) : b[sortKey];
      if (aValue == null) return bValue == null ? 0 : 1;
      if (bValue == null) return -1;
      const result =
        typeof aValue === "number" && typeof bValue === "number"
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
      return sortDirection === "asc" ? result : -result;
    });
  }, [columns, filteredData, sortDirection, sortKey]);

  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(sortedData.length / safePageSize));
  const page = Math.min(currentPage, totalPages);
  const paginatedData = sortedData.slice((page - 1) * safePageSize, page * safePageSize);

  return (
    <div className={cn("space-y-4", className)}>
      {filterable && (
        <input
          type="search"
          aria-label="Filter table"
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="Filter results..."
          className="h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:max-w-xs"
        />
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  aria-sort={sortKey === column.key ? (sortDirection === "asc" ? "ascending" : "descending") : undefined}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className="inline-flex items-center gap-1 font-medium focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {column.header}
                      <span aria-hidden="true">
                        {sortKey === column.key ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </button>
                  ) : column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length ? (
              paginatedData.map((row, index) => (
                <TableRow
                  key={getRowId?.(row, index) ?? index}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={onRowClick ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onRowClick(row);
                    }
                  } : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-label={onRowClick ? "Select row" : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.cell ? column.cell(row) : (row[column.key] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
          <div aria-live="polite">Page {page} of {totalPages} ({sortedData.length} total)</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="First page" onClick={() => setCurrentPage(1)} disabled={page <= 1}>
              <ChevronsLeft aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Previous page" onClick={() => setCurrentPage((value) => Math.max(value - 1, 1))} disabled={page <= 1}>
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Next page" onClick={() => setCurrentPage((value) => Math.min(value + 1, totalPages))} disabled={page >= totalPages}>
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Last page" onClick={() => setCurrentPage(totalPages)} disabled={page >= totalPages}>
              <ChevronsRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

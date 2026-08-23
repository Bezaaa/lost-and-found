"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const SEARCH_DEBOUNCE_MS = 350;

export function ReportFilters({
  basePath,
  type,
  status,
  query,
  showStatusFilter = false,
}: {
  basePath: string;
  type?: string;
  status?: string;
  query?: string;
  showStatusFilter?: boolean;
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(query ?? "");
  const lastPushedQuery = useRef(query ?? "");

  // Reflect external navigation (e.g. back/forward) that changes the URL's q.
  useEffect(() => {
    if ((query ?? "") !== lastPushedQuery.current) {
      setSearchValue(query ?? "");
      lastPushedQuery.current = query ?? "";
    }
  }, [query]);

  function navigate(next: { type?: string; status?: string; q?: string }) {
    const nextType = next.type !== undefined ? next.type : type ?? "";
    const nextStatus = next.status !== undefined ? next.status : status ?? "";
    const nextQuery = next.q !== undefined ? next.q : searchValue;

    const params = new URLSearchParams();
    if (nextType) params.set("type", nextType);
    if (nextStatus) params.set("status", nextStatus);
    if (nextQuery) params.set("q", nextQuery);
    // Any filter/search change starts back at page 1.

    lastPushedQuery.current = nextQuery;
    router.replace(`${basePath}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  // Debounce the search box so we don't refetch on every keystroke.
  useEffect(() => {
    if (searchValue === (query ?? "")) return;
    const handle = setTimeout(() => navigate({ q: searchValue }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={type ?? ""}
        onChange={(e) => navigate({ type: e.target.value })}
        className="w-36"
        aria-label="Filter by type"
      >
        <option value="">All types</option>
        <option value="LOST">Lost</option>
        <option value="FOUND">Found</option>
      </Select>

      {showStatusFilter && (
        <Select
          value={status ?? ""}
          onChange={(e) => navigate({ status: e.target.value })}
          className="w-40"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="RESOLVED">Resolved</option>
        </Select>
      )}

      <div className="relative min-w-64 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search item, description, location, category, or brand..."
          aria-label="Search reports"
          className="pl-9"
        />
      </div>
    </div>
  );
}

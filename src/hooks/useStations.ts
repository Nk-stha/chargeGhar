import { useState, useEffect, useCallback } from "react";
import stationsService from "../lib/api/stations.service";
import {
  Station,
  StationFilters,
  Pagination,
  StationsListResponse,
} from "../types/station.types";

interface UseStationsReturn {
  stations: Station[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  search: string;
  fetchStations: (filters?: StationFilters) => Promise<void>;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setStatus: (status: string | undefined) => void;
}

export const useStations = (initialPageSize: number = 10): UseStationsReturn => {
  const [stations, setStations] = useState<Station[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string | undefined>(undefined);

  const fetchStations = useCallback(
    async (filters?: StationFilters) => {
      try {
        setLoading(true);
        setError(null);

        const requestFilters: StationFilters = {
          page: filters?.page ?? currentPage,
          page_size: filters?.page_size ?? pageSize,
          search: filters?.search !== undefined ? filters.search : (search || undefined),
          status: filters?.status ?? (status as any),
        };

        // Remove undefined/empty values
        if (!requestFilters.search) delete requestFilters.search;
        if (!requestFilters.status) delete requestFilters.status;

        const response = await stationsService.getStations(requestFilters);

        if (response.success) {
          setStations(response.data.results);
          setPagination(response.data.pagination);
        } else {
          setError("Failed to fetch stations");
        }
      } catch (err: any) {
        console.error("Error fetching stations:", err);
        setError(err.response?.data?.message || "Failed to fetch stations");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, search, status]
  );

  const refetch = useCallback(async () => {
    await fetchStations();
  }, [fetchStations]);

  const handleSetPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSetPageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  const handleSetSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setCurrentPage(1);
  }, []);

  const handleSetStatus = useCallback((newStatus: string | undefined) => {
    setStatus(newStatus);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchStations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, search, status]);

  return {
    search,
    stations,
    pagination,
    loading,
    error,
    currentPage,
    totalPages: pagination?.total_pages ?? 1,
    totalCount: pagination?.total_count ?? 0,
    fetchStations,
    refetch,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    setSearch: handleSetSearch,
    setStatus: handleSetStatus,
  };
};

export default useStations;

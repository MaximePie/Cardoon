import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import { createElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthenticatedAxios } from "../../services/userCardsApi";
import { extractErrorMessage } from "../../utils";
import { FetchedCategory, useCategories } from "./useCategories";

// Mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    isAxiosError: vi.fn(),
  },
}));

// Mock the userCardsApi module
vi.mock("../../services/userCardsApi", () => ({
  createAuthenticatedAxios: vi.fn(),
}));

// Mock utils
vi.mock("../../utils", () => ({
  extractErrorMessage: vi.fn(),
}));

describe("useCategories", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it("should fetch categories successfully", async () => {
    const mockCategories: FetchedCategory[] = [
      { category: "Category A", count: 5 },
      { category: "Category B", count: 3 },
    ];

    vi.mocked(axios.get).mockResolvedValue({ data: mockCategories });
    vi.mocked(createAuthenticatedAxios).mockReturnValue({
      headers: { "Content-Type": "application/json" },
    });

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockCategories);
    expect(result.current.error).toBeNull();
  });

  it("should handle API errors", async () => {
    const apiError = new Error("API Error");
    vi.mocked(axios.get).mockRejectedValue(apiError);
    vi.mocked(axios.isAxiosError).mockReturnValue(false);
    vi.mocked(createAuthenticatedAxios).mockReturnValue({
      headers: { "Content-Type": "application/json" },
    });
    vi.mocked(extractErrorMessage).mockReturnValue("API Error");

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });

  it("should filter out categories with null names", async () => {
    const mockCategories = [
      { category: "Category A", count: 5 },
      { category: null, count: 1 },
      { category: "Category B", count: 3 },
    ];

    vi.mocked(axios.get).mockResolvedValue({ data: mockCategories });
    vi.mocked(createAuthenticatedAxios).mockReturnValue({
      headers: { "Content-Type": "application/json" },
    });

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // The current implementation filters out null categories and sorts alphabetically
    const expectedCategories = [
      { category: "Category A", count: 5 },
      { category: "Category B", count: 3 },
    ];
    expect(result.current.data).toEqual(expectedCategories);
    expect(result.current.data?.every((cat) => cat.category !== null)).toBe(
      true
    );
  });

  it("should handle empty categories response", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] });
    vi.mocked(createAuthenticatedAxios).mockReturnValue({
      headers: { "Content-Type": "application/json" },
    });

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should handle 404 errors specifically", async () => {
    const axiosError = {
      response: { status: 404 },
      isAxiosError: true,
    };

    vi.mocked(axios.get).mockRejectedValue(axiosError);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    vi.mocked(createAuthenticatedAxios).mockReturnValue({
      headers: { "Content-Type": "application/json" },
    });
    vi.mocked(extractErrorMessage).mockReturnValue("Not found");

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("404");
  });

  it("should sort categories alphabetically", async () => {
    const mockCategories = [
      { category: "Zebra", count: 2 },
      { category: "Apple", count: 5 },
      { category: "Banana", count: 3 },
    ];

    vi.mocked(axios.get).mockResolvedValue({ data: mockCategories });
    vi.mocked(createAuthenticatedAxios).mockReturnValue({
      headers: { "Content-Type": "application/json" },
    });

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should be sorted alphabetically
    const expectedOrder = [
      { category: "Apple", count: 5 },
      { category: "Banana", count: 3 },
      { category: "Zebra", count: 2 },
    ];
    expect(result.current.data).toEqual(expectedOrder);
  });

  it("should start with loading state", () => {
    vi.mocked(axios.get).mockImplementation(() => new Promise(() => {})); // Never resolves
    vi.mocked(createAuthenticatedAxios).mockReturnValue({
      headers: { "Content-Type": "application/json" },
    });

    const { result } = renderHook(() => useCategories(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });
});

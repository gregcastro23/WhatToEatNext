import { renderHook, waitFor, act } from "@testing-library/react";
import { useMyTables, useTable } from "@/hooks/useTables";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";
import type { TableDetail, TableRecord } from "@/types/table";

describe("useTables hooks", () => {
  const mockTableRecord: TableRecord = {
    id: "table-alpha",
    hostId: "user-host",
    title: "Solar Dinner",
    scheduledAt: "2026-10-20T19:00:00.000Z",
    venue: { type: "home", name: "Hearth" },
    status: "planned",
    visibility: "commensals",
    menu: [],
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-10-01T12:00:00.000Z",
  };

  const mockTableDetail: TableDetail = {
    ...mockTableRecord,
    members: [],
    photos: [],
  };

  describe("useMyTables", () => {
    it("loads tables on mount and retains prior state on malformed 2xx", async () => {
      let isMalformed = false;
      installFetchMock(
        jest.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve(
                isMalformed
                  ? { success: true, tables: [{ id: "bad-table" }] }
                  : { success: true, tables: [mockTableRecord] },
              ),
          }),
        ),
      );

      const { result } = renderHook(() => useMyTables("upcoming"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.tables).toHaveLength(1);
      expect(result.current.tables[0]?.id).toBe("table-alpha");

      // Now simulate a malformed 2xx response on refetch
      isMalformed = true;
      await act(async () => {
        await result.current.refetch();
      });

      // State MUST be retained rather than wiped with []
      expect(result.current.tables).toHaveLength(1);
      expect(result.current.tables[0]?.id).toBe("table-alpha");
    });
  });

  describe("useTable", () => {
    it("loads table on mount and retains prior state on malformed 2xx", async () => {
      let isMalformed = false;
      installFetchMock(
        jest.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve(
                isMalformed
                  ? { success: true, table: { id: "bad-table-id" } }
                  : { success: true, table: mockTableDetail, viewerId: "user-host" },
              ),
          }),
        ),
      );

      const { result } = renderHook(() => useTable("table-alpha"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.table?.id).toBe("table-alpha");
      expect(result.current.viewerId).toBe("user-host");

      // Now simulate a malformed 2xx response on refetch
      isMalformed = true;
      await act(async () => {
        await result.current.refetch();
      });

      // Prior good state MUST be retained
      expect(result.current.table?.id).toBe("table-alpha");
      expect(result.current.viewerId).toBe("user-host");
    });
  });
});

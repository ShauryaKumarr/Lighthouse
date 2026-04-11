"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  RawLogRow,
  InterventionEvent,
  RequestLifecycle,
  DerivedMetrics,
} from "./types";
import { parseInhibitorCsv } from "./parse-csv";
import { parseInhibitorEvents } from "./parse-jsonl";
import { groupLifecycles } from "./group-lifecycles";
import { deriveMetrics } from "./derive-metrics";

interface DataState {
  loading: boolean;
  error: string | null;
  rawRows: RawLogRow[];
  interventions: InterventionEvent[];
  lifecycles: RequestLifecycle[];
  metrics: DerivedMetrics | null;
  dataSource: string;
  loadCustomData: (csvText: string, jsonlText: string) => Promise<void>;
}

const DataContext = createContext<DataState>({
  loading: true,
  error: null,
  rawRows: [],
  interventions: [],
  lifecycles: [],
  metrics: null,
  dataSource: "sample_logs/set_a",
  loadCustomData: async () => {},
});

export function useData() {
  return useContext(DataContext);
}

async function processData(csvText: string, jsonlText: string) {
  const rawRows = await parseInhibitorCsv(csvText);
  const interventions = parseInhibitorEvents(jsonlText);
  const lifecycles = groupLifecycles(rawRows);
  const metrics = deriveMetrics(lifecycles, interventions);
  return { rawRows, interventions, lifecycles, metrics };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<DataState, "loadCustomData">>({
    loading: true,
    error: null,
    rawRows: [],
    interventions: [],
    lifecycles: [],
    metrics: null,
    dataSource: "sample_logs/set_a",
  });

  useEffect(() => {
    async function load() {
      try {
        const [csvResp, jsonlResp] = await Promise.all([
          fetch("/sample_logs/set_a/inhibitor_logs.csv"),
          fetch("/sample_logs/set_a/inhibitor_events.jsonl"),
        ]);

        const csvText = await csvResp.text();
        const jsonlText = await jsonlResp.text();
        const data = await processData(csvText, jsonlText);

        setState({
          loading: false,
          error: null,
          dataSource: "sample_logs/set_a",
          ...data,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load data",
        }));
      }
    }
    load();
  }, []);

  const loadCustomData = useCallback(
    async (csvText: string, jsonlText: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await processData(csvText, jsonlText);
        setState({
          loading: false,
          error: null,
          dataSource: "custom upload",
          ...data,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error ? err.message : "Failed to parse uploaded data",
        }));
      }
    },
    []
  );

  return (
    <DataContext.Provider value={{ ...state, loadCustomData }}>
      {children}
    </DataContext.Provider>
  );
}

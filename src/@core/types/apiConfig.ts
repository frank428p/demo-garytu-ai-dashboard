// ─── Response Wrapper ─────────────────────────────────────────────────────────
export type ApiMeta = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  timestamp: string;
  meta?: ApiMeta;
};
// ─── Response Wrapper ─────────────────────────────────────────────────────────

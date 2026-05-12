import apiClient from "@/lib/axios";
import type { ApiResponse, ApiMeta } from "@/@core/types/apiConfig";
import type {
  CmsVideoSelectorResponse,
  CmsVideoSelectorDetailResponse,
  CmsVideoSelectorTypeThumbnailResponse,
  GetVideoSelectorsParams,
  VideoSelectorFormData,
  VideoSelectorUpdateData,
  UpdateVideoSelectorPositionsRequest,
} from "@/@core/types/videoSelector";

export type VideoSelectorListResponse = ApiResponse<CmsVideoSelectorResponse[]> & { meta: ApiMeta };
export type VideoSelectorResponse = ApiResponse<CmsVideoSelectorResponse>;
export type VideoSelectorDetailResponse = ApiResponse<CmsVideoSelectorDetailResponse>;
export type VideoSelectorPositionsResponse = ApiResponse<CmsVideoSelectorResponse[]>;
export type VideoSelectorTypeThumbnailResponse = ApiResponse<CmsVideoSelectorTypeThumbnailResponse>;
export type DeleteVideoSelectorResponse = ApiResponse<null>;

// 1. List video selectors
export async function getVideoSelectors(
  params?: GetVideoSelectorsParams
): Promise<VideoSelectorListResponse> {
  const response = await apiClient.get<VideoSelectorListResponse>("/cms/video-selectors", {
    params,
  });
  return response.data;
}

// 2. Create video selector
export async function createVideoSelector(
  data: VideoSelectorFormData,
  files?: { cover?: File; thumbnail?: File }
): Promise<VideoSelectorResponse> {
  const formData = new FormData();
  formData.append("payload", JSON.stringify(data));
  if (files?.cover) formData.append("cover", files.cover);
  if (files?.thumbnail) formData.append("thumbnail", files.thumbnail);

  const response = await apiClient.post<VideoSelectorResponse>(
    "/cms/video-selectors",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

// 3. Update video selector positions
export async function updateVideoSelectorPositions(
  data: UpdateVideoSelectorPositionsRequest
): Promise<VideoSelectorPositionsResponse> {
  const response = await apiClient.patch<VideoSelectorPositionsResponse>(
    "/cms/video-selectors/positions",
    data
  );
  return response.data;
}

// 4. Get video selector type global thumbnail
export async function getVideoSelectorTypeThumbnail(
  selectorType: string
): Promise<VideoSelectorTypeThumbnailResponse> {
  const response = await apiClient.get<VideoSelectorTypeThumbnailResponse>(
    `/cms/video-selectors/${selectorType}/thumbnail`
  );
  return response.data;
}

// 5. Update video selector type global thumbnail
export async function updateVideoSelectorTypeThumbnail(
  selectorType: string,
  file: File
): Promise<VideoSelectorTypeThumbnailResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.patch<VideoSelectorTypeThumbnailResponse>(
    `/cms/video-selectors/${selectorType}/thumbnail`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

// 6. Delete video selector type global thumbnail
export async function deleteVideoSelectorTypeThumbnail(
  selectorType: string
): Promise<DeleteVideoSelectorResponse> {
  const response = await apiClient.delete<DeleteVideoSelectorResponse>(
    `/cms/video-selectors/${selectorType}/thumbnail`
  );
  return response.data;
}

// 7. Get video selector by id
export async function getVideoSelector(id: number): Promise<VideoSelectorDetailResponse> {
  const response = await apiClient.get<VideoSelectorDetailResponse>(
    `/cms/video-selectors/${id}`
  );
  return response.data;
}

// 8. Update video selector
export async function updateVideoSelector(
  id: number,
  data?: VideoSelectorUpdateData,
  files?: { cover?: File; thumbnail?: File }
): Promise<VideoSelectorResponse> {
  const formData = new FormData();
  if (data) formData.append("payload", JSON.stringify(data));
  if (files?.cover) formData.append("cover", files.cover);
  if (files?.thumbnail) formData.append("thumbnail", files.thumbnail);

  const response = await apiClient.patch<VideoSelectorResponse>(
    `/cms/video-selectors/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

// 9. Delete video selector
export async function deleteVideoSelector(id: number): Promise<DeleteVideoSelectorResponse> {
  const response = await apiClient.delete<DeleteVideoSelectorResponse>(
    `/cms/video-selectors/${id}`
  );
  return response.data;
}

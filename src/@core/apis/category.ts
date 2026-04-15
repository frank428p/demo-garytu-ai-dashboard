import apiClient from "@/lib/axios";
import type { ApiResponse, ApiMeta } from "@/@core/types/apiConfig";
import type { Category, GetCategoriesParams, CategoryFormData } from "@/@core/types/category";

export type CategoryListResponse = ApiResponse<Category[]> & { meta: ApiMeta };
export type CategoryResponse = ApiResponse<Category>;
export type DeleteCategoryResponse = ApiResponse<null>;

export async function getCategories(params?: GetCategoriesParams): Promise<CategoryListResponse> {
  const response = await apiClient.get<CategoryListResponse>("/cms/categories", { params });
  return response.data;
}

export async function getCategory(id: string): Promise<CategoryResponse> {
  const response = await apiClient.get<CategoryResponse>(`/cms/categories/${id}`);
  return response.data;
}

export async function createCategory(data: CategoryFormData): Promise<CategoryResponse> {
  const response = await apiClient.post<CategoryResponse>("/cms/categories", data);
  return response.data;
}

export async function updateCategory(
  id: string,
  data: Partial<CategoryFormData>
): Promise<CategoryResponse> {
  const response = await apiClient.patch<CategoryResponse>(`/cms/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: string): Promise<DeleteCategoryResponse> {
  const response = await apiClient.delete<DeleteCategoryResponse>(`/cms/categories/${id}`);
  return response.data;
}

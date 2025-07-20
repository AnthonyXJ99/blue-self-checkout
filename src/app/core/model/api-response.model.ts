/**
 * Modelo de respuesta estándar de la API
 */
export interface ApiResponse<T = any> {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: T[];
}
  
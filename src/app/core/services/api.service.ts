import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { API_CONFIG, RequestParams } from '../config/api.config';
import { ApiResponse } from '../model/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

  /**
   * Realiza una petición GET
   */
  get<T>(endpoint: string, params?: RequestParams): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpParams = this.buildHttpParams(params);

    return this.http.get<T>(url, { params: httpParams }).pipe(
      timeout(API_CONFIG.TIMEOUT),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Realiza una petición GET para respuestas paginadas
   */
  getPaginated<T>(endpoint: string, params?: RequestParams): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const httpParams = this.buildHttpParams(params);

    return this.http.get<ApiResponse<T>>(url, { params: httpParams }).pipe(
      timeout(API_CONFIG.TIMEOUT),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Realiza una petición POST
   */
  post<T>(endpoint: string, data: any, params?: RequestParams): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpParams = this.buildHttpParams(params);

    return this.http.post<T>(url, data, { params: httpParams }).pipe(
      timeout(API_CONFIG.TIMEOUT),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Realiza una petición PUT
   */
  put<T>(endpoint: string, data: any, params?: RequestParams): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpParams = this.buildHttpParams(params);

    return this.http.put<T>(url, data, { params: httpParams }).pipe(
      timeout(API_CONFIG.TIMEOUT),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Realiza una petición PATCH
   */
  patch<T>(endpoint: string, data: any, params?: RequestParams): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpParams = this.buildHttpParams(params);

    return this.http.patch<T>(url, data, { params: httpParams }).pipe(
      timeout(API_CONFIG.TIMEOUT),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Realiza una petición DELETE
   */
  delete<T>(endpoint: string, params?: RequestParams): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpParams = this.buildHttpParams(params);

    return this.http.delete<T>(url, { params: httpParams }).pipe(
      timeout(API_CONFIG.TIMEOUT),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Sube un archivo
   */
  upload<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const url = this.buildUrl(endpoint);
    const formData = new FormData();
    
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<T>(url, formData, {
      headers: {
        // No incluir Content-Type para que el navegador establezca el boundary correcto
      }
    }).pipe(
      timeout(API_CONFIG.TIMEOUT * 2), // Más tiempo para uploads
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Sube múltiples archivos
   */
  uploadMultiple<T>(endpoint: string, files: File[], additionalData?: any): Observable<T> {
    const url = this.buildUrl(endpoint);
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<T>(url, formData, {
      headers: {
        // No incluir Content-Type para que el navegador establezca el boundary correcto
      }
    }).pipe(
      timeout(API_CONFIG.TIMEOUT * 3), // Más tiempo para múltiples archivos
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Descarga un archivo
   */
  download(endpoint: string, params?: RequestParams): Observable<Blob> {
    const url = this.buildUrl(endpoint);
    const httpParams = this.buildHttpParams(params);

    return this.http.get(url, { 
      params: httpParams,
      responseType: 'blob'
    }).pipe(
      timeout(API_CONFIG.TIMEOUT),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Construye la URL completa
   */
  private buildUrl(endpoint: string): string {
    // Si la endpoint ya es una URL completa, la devuelve tal como está
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // Si la endpoint empieza con '/', la concatena directamente
    if (endpoint.startsWith('/')) {
      return `${API_CONFIG.BASE_URL}${endpoint.substring(1)}`;
    }

    // Si la endpoint es relativa, la concatena con la URL base
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  }

  /**
   * Construye los parámetros HTTP
   */
  private buildHttpParams(params?: RequestParams): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }

    return httpParams;
  }

  /**
   * Maneja los errores de la API
   */
  private handleError(error: any): Observable<never> {
    console.error('API Service Error:', error);
    return throwError(() => error);
  }

  /**
   * Obtiene la URL base de la API
   */
  getBaseUrl(): string {
    return API_CONFIG.BASE_URL;
  }

  /**
   * Verifica si la API está disponible
   */
  ping(): Observable<boolean> {
    return this.get<any>('api/health').pipe(
      map(() => true),
      catchError(() => [false])
    );
  }
} 
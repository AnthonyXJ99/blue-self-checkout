import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

export function ApiInterceptor(request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
    
    // Clonar la request para modificarla
    let modifiedRequest = request.clone();

    // Agregar headers por defecto si no existen y no es un upload de archivo
    if (!modifiedRequest.headers.has('Content-Type') && !isFileUpload(modifiedRequest)) {
      modifiedRequest = modifiedRequest.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    }

    // Agregar token de autenticación si existe
    const token = getAuthToken();
    if (token) {
      modifiedRequest = modifiedRequest.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
    }

    // Agregar headers personalizados si es necesario
    if (shouldAddCustomHeaders(modifiedRequest.url)) {
      modifiedRequest = modifiedRequest.clone({
        setHeaders: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-Client-Version': '1.0.0'
        }
      });
    }

    // Procesar la request con reintentos y manejo de errores
    return next(modifiedRequest).pipe(
      retry(API_CONFIG.RETRY_CONFIG.maxRetries),
      catchError((error: HttpErrorResponse) => {
        return handleError(error);
      })
    );
  }

  /**
   * Verifica si la request es para upload de archivos
   */
  function isFileUpload(request: HttpRequest<any>): boolean {
    // Verificar si es FormData
    if (request.body instanceof FormData) {
      return true;
    }
    
    // Verificar si la URL contiene endpoints de upload
    const uploadEndpoints = [
      'api/upload',
      'api/images',
      'api/gallery',
      'api/photos',
      '/upload',
      '/images',
      '/gallery',
      '/photos'
    ];
    
    return uploadEndpoints.some(endpoint => request.url.includes(endpoint));
  }

  /**
   * Obtiene el token de autenticación del localStorage
   */
  function getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Determina si se deben agregar headers personalizados
   */
  function shouldAddCustomHeaders(url: string): boolean {
    // Agregar headers personalizados para endpoints específicos
    const customHeadersEndpoints = [
      'api/auth',
      'api/customers',
      'api/customer-groups'
    ];
    
    return customHeadersEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Maneja los errores de la API
   */
  function handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud incorrecta. Verifique los datos enviados.';
          break;
        case 401:
          errorMessage = 'No autorizado. Inicie sesión nuevamente.';
          handleUnauthorized();
          break;
        case 403:
          errorMessage = 'Acceso denegado. No tiene permisos para esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 409:
          errorMessage = 'Conflicto. El recurso ya existe o no puede ser procesado.';
          break;
        case 422:
          errorMessage = 'Datos de validación incorrectos.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intente más tarde.';
          break;
        case 503:
          errorMessage = 'Servicio no disponible. Intente más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    // Log del error para debugging
    console.error('API Error:', {
      status: error.status,
      message: errorMessage,
      url: error.url,
      error: error.error
    });

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Maneja el caso de usuario no autorizado
   */
  function handleUnauthorized(): void {
    // Limpiar token y redirigir al login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    // O mostrar un toast/mensaje
    console.warn('Usuario no autorizado. Redirigiendo al login...');
  } 
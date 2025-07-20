# Configuración de API - Core Module

Este módulo proporciona una configuración centralizada para consumir la API REST.

## 📁 Estructura

```
src/app/core/
├── config/
│   └── api.config.ts          # Configuración de la API
├── interceptors/
│   └── api.interceptor.ts     # Interceptor HTTP
├── services/
│   └── api.service.ts         # Servicio base para HTTP
└── README.md                  # Esta documentación
```

## 🚀 Configuración

### 1. URL Base
La URL base está configurada en `api.config.ts`:
```typescript
BASE_URL: 'http://192.168.18.43:5023/'
```

### 2. Endpoints
Los endpoints están organizados por módulo:
```typescript
ENDPOINTS: {
  CUSTOMER_GROUPS: 'api/customer-groups',
  CUSTOMERS: 'api/customers',
  PRODUCTS: 'api/products',
  // ... más endpoints
}
```

## 🔧 Uso

### 1. Usar el ApiService directamente

```typescript
import { ApiService } from '@core/services/api.service';

@Injectable()
export class MiServicio {
  constructor(private apiService: ApiService) {}

  // GET
  getData(): Observable<MyData[]> {
    return this.apiService.get<MyData[]>('api/mi-endpoint');
  }

  // POST
  createData(data: MyData): Observable<MyData> {
    return this.apiService.post<MyData>('api/mi-endpoint', data);
  }

  // PUT
  updateData(id: string, data: MyData): Observable<MyData> {
    return this.apiService.put<MyData>(`api/mi-endpoint/${id}`, data);
  }

  // DELETE
  deleteData(id: string): Observable<void> {
    return this.apiService.delete<void>(`api/mi-endpoint/${id}`);
  }

  // Upload
  uploadFile(file: File): Observable<any> {
    return this.apiService.upload<any>('api/upload', file);
  }

  // Upload múltiples archivos
  uploadMultipleFiles(files: File[]): Observable<any> {
    return this.apiService.uploadMultiple<any>('api/upload', files);
  }
}
```

### 2. Crear un servicio específico

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { API_CONFIG } from '@core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class MiServicioEspecifico {
  constructor(private apiService: ApiService) {}

  getItems(): Observable<Item[]> {
    return this.apiService.get<Item[]>(API_CONFIG.ENDPOINTS.MI_ENDPOINT);
  }
}
```

### 3. Usar en componentes

```typescript
import { Component, OnInit } from '@angular/core';
import { MiServicioEspecifico } from './mi-servicio.service';

@Component({
  selector: 'app-mi-componente',
  template: '...'
})
export class MiComponente implements OnInit {
  data$ = this.servicio.getItems();

  constructor(private servicio: MiServicioEspecifico) {}

  ngOnInit() {
    // Los datos se cargan automáticamente
  }
}
```

## 🔐 Autenticación

El interceptor maneja automáticamente la autenticación:

1. **Token en localStorage**: El interceptor busca `auth_token` en localStorage
2. **Header Authorization**: Se agrega automáticamente `Bearer {token}`
3. **Manejo de 401**: Si recibe 401, limpia el token y redirige al login

### Configurar token:
```typescript
localStorage.setItem('auth_token', 'tu-token-aqui');
```

## ⚡ Características

### 1. Timeout automático
- Todas las peticiones tienen un timeout de 30 segundos
- Los uploads tienen 60 segundos

### 2. Reintentos automáticos
- Máximo 3 reintentos en caso de error
- Delay de 1 segundo entre reintentos

### 3. Manejo de errores
- Errores HTTP mapeados a mensajes en español
- Logging automático de errores
- Manejo específico para 401 (no autorizado)

### 4. Headers automáticos
- `Content-Type: application/json` (excepto para uploads)
- `Accept: application/json`
- `Authorization: Bearer {token}` (si existe)
- Para uploads: el navegador establece automáticamente `multipart/form-data` con el boundary correcto

## 📊 Parámetros de petición

### Paginación
```typescript
const params = {
  page: 1,
  pageSize: 10,
  sortBy: 'name',
  sortOrder: 'asc'
};
```

### Filtros
```typescript
const params = {
  search: 'término de búsqueda',
  status: 'active',
  enabled: true
};
```

### Combinados
```typescript
const params = {
  page: 1,
  pageSize: 20,
  search: 'cliente',
  enabled: true,
  sortBy: 'name',
  sortOrder: 'asc'
};
```

## 🛠️ Personalización

### 1. Cambiar URL base
Editar `src/app/core/config/api.config.ts`:
```typescript
BASE_URL: 'https://tu-api.com/'
```

### 2. Agregar nuevos endpoints
```typescript
ENDPOINTS: {
  // ... endpoints existentes
  MI_NUEVO_ENDPOINT: 'api/mi-nuevo-endpoint'
}
```

### 3. Modificar timeout
```typescript
TIMEOUT: 45000, // 45 segundos
```

### 4. Agregar headers personalizados
En `api.interceptor.ts`:
```typescript
private shouldAddCustomHeaders(url: string): boolean {
  const customHeadersEndpoints = [
    'api/auth',
    'api/customers',
    'api/mi-nuevo-endpoint' // ← Agregar aquí
  ];
  
  return customHeadersEndpoints.some(endpoint => url.includes(endpoint));
}
```

## 🔍 Debugging

### 1. Ver logs de errores
Los errores se loguean automáticamente en la consola con detalles completos.

### 2. Verificar conectividad
```typescript
this.apiService.ping().subscribe(
  isOnline => console.log('API online:', isOnline)
);
```

### 3. Ver URL base
```typescript
console.log('Base URL:', this.apiService.getBaseUrl());
```

## 📁 Manejo de Archivos

### Upload de archivo único
```typescript
uploadImage(file: File): Observable<any> {
  return this.apiService.upload<any>('api/images', file, {
    category: 'product',
    description: 'Imagen del producto'
  });
}
```

### Upload de múltiples archivos
```typescript
uploadImages(files: File[]): Observable<any> {
  return this.apiService.uploadMultiple<any>('api/images', files, {
    category: 'gallery',
    tags: 'product,main'
  });
}
```

### Descarga de archivos
```typescript
downloadReport(params: RequestParams): Observable<Blob> {
  return this.apiService.download('api/reports/export', params);
}
```

## 📝 Ejemplos completos

Ver `src/app/pages/service/customer-api.service.ts` para un ejemplo completo de implementación. 
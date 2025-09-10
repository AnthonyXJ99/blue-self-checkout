/**
 * Configuración de la API
 */
export const API_CONFIG = {
  // URL base de la API
  //BASE_URL: 'http://192.168.20.10:9095/',
  //BASE_URL: 'http://192.168.18.43:5023/',
  BASE_URL: 'https://localhost:7115/',
  
  // Endpoints específicos
  ENDPOINTS: {
    // Customer Groups
    CUSTOMER_GROUPS: 'api/customergroups',
    
    // Customers
    CUSTOMERS: 'api/customers',
    
    // Products
    PRODUCTS: 'api/products',
    CATEGORIES: 'api/categories',
    PRODUCT_TREES: 'api/producttrees',
    ACCOMPANIMENTS: 'api/accompaniments',
    
    // Devices
    DEVICES: 'api/devices',
    
    // Gallery
    GALLERY: 'api/gallery',
    IMAGES: 'api/images',

    //Order
    ORDERS: 'api/order',
    
    // Auth
    AUTH: 'api/auth',
    LOGIN: 'api/auth/login',
    LOGOUT: 'api/auth/logout',

    
    // Common
    COUNTRIES: 'api/countries',
    ICONS: 'api/icons',
    NODES: 'api/nodes',
    PHOTOS: 'api/photos'
  },
  
  // Configuración de headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Timeout de las peticiones (en milisegundos)
  TIMEOUT: 30000,
  
  // Configuración de reintentos
  RETRY_CONFIG: {
    maxRetries: 3,
    retryDelay: 1000
  },
  
  // Configuración de caché
  CACHE_CONFIG: {
    enabled: true,
    ttl: 5 * 60 * 1000 // 5 minutos
  }
};

/**
 * Tipos de respuesta de la API
 */


/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
}

/**
 * Parámetros de filtro
 */
export interface FilterParams {
  filter?: string;
  status?: string;
  enabled?: boolean;
  [key: string]: any;
}

/**
 * Parámetros completos para peticiones
 */
export interface RequestParams extends PaginationParams, FilterParams {
  [key: string]: any;
} 
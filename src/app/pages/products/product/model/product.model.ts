import { RequestParams } from "../../../../core/config/api.config";

/**
 * Modelo para Material del producto
 */
export interface ProductMaterial {
    itemCode: string;
    itemName: string;
    quantity: number;
    imageUrl?: string;
    isPrimary: string;              // Y/N
    productItemCode: string;
  }
  
  /**
   * Modelo para Acompañamiento del producto
   */
  export interface ProductAccompaniment {
    itemCode: string;
    itemName: string;
    priceOld: number;
    price: number;
    imageUrl?: string;
    productItemCode: string;
  }
  
  /**
   * Modelo de datos para Product según tu API real
   */
  export interface Product {
    itemCode: string;               // Código único del producto (PK)
    eanCode?: string;               // Código EAN/Código de barras
    itemName: string;               // Nombre del producto
    frgnName?: string;              // Nombre en idioma extranjero
    price: number;                  // Precio del producto
    discount?: number;              // Descuento (porcentaje)
    imageUrl?: string;              // URL de la imagen
    description?: string;           // Descripción del producto
    frgnDescription?: string;       // Descripción en idioma extranjero
    sellItem: string;               // Se vende (Y/N)
    available: string;              // Disponible (Y/N)
    enabled: string;                // Habilitado (Y/N)
    groupItemCode?: string;         // Código del grupo
    categoryItemCode?: string;      // Código de la categoría
    waitingTime?: string;           // Tiempo de espera
    rating?: number;                // Calificación
    material: ProductMaterial[];    // Materiales del producto
    accompaniment: ProductAccompaniment[]; // Acompañamientos
  }
  
  /**
   * Modelo de respuesta paginada para productos
   */
  export interface ProductPagedResponse {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    data: Product[];
  }
  
  /**
   * Parámetros para filtrar productos
   */
  export interface ProductFilterParams extends RequestParams {
    search?: string;
    groupItemCode?: string;
    categoryItemCode?: string;
    minPrice?: number;
    maxPrice?: number;
    available?: string;             // Y/N
    sellItem?: string;              // Y/N
  }
  
  /**
   * Parámetros para crear producto
   */
  export interface ProductCreateRequest {
    itemCode: string;
    eanCode?: string;
    itemName: string;
    frgnName?: string;
    price: number;
    discount?: number;
    imageUrl?: string;
    description?: string;
    frgnDescription?: string;
    sellItem: string;               // Y/N
    available: string;              // Y/N
    enabled: string;                // Y/N
    groupItemCode?: string;
    categoryItemCode?: string;
    waitingTime?: string;
    rating?: number;
    material?: ProductMaterial[];
    accompaniment?: ProductAccompaniment[];
  }
  
  /**
   * Parámetros para actualizar producto
   */
  export interface ProductUpdateRequest extends ProductCreateRequest {}
  
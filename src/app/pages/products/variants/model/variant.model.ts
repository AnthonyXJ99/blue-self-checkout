/**
 * Modelo para Variante de Producto
 * Basado en API_DOCUMENTATION.md - Sección Variantes
 */
export interface Variant {
  variantID: number;              // ID único de la variante (generado por backend)
  itemCode: string;               // Código del producto padre
  variantName: string;            // Nombre de la variante (ej: "Coca Cola 500ml")
  brandName: string;              // Nombre de la marca (ej: "Coca Cola")
  sizeCode?: string;              // Código del tamaño (referencia a tabla OSZC)
  colorCode?: string;             // Código del color (referencia a tabla Colors)
  priceAdjustment: number;        // Ajuste de precio (puede ser positivo, negativo o cero)
  available: string;              // Disponible (Y/N)
  sizeName?: string;              // Nombre del tamaño (calculado por backend)
  colorName?: string;             // Nombre del color (calculado por backend)
  basePrice: number;              // Precio base del producto padre (calculado)
  finalPrice: number;             // Precio final = basePrice + priceAdjustment (calculado)
}

/**
 * DTO para crear una nueva variante
 */
export interface VariantCreateDto {
  variantName: string;            // Requerido
  brandName: string;              // Requerido
  sizeCode?: string;              // Opcional (debe existir en tabla OSZC)
  colorCode?: string;             // Opcional (debe existir en tabla Colors)
  priceAdjustment: number;        // Requerido (puede ser 0)
  available: string;              // Requerido (Y/N)
}

/**
 * DTO para actualizar una variante existente
 */
export interface VariantUpdateDto {
  variantName?: string;
  brandName?: string;
  sizeCode?: string;
  colorCode?: string;
  priceAdjustment?: number;
  available?: string;             // Y/N
}

/**
 * DTO para crear múltiples variantes en bulk
 */
export interface VariantBulkCreateDto {
  variants: VariantCreateDto[];
}

/**
 * Respuesta de creación bulk
 */
export interface VariantBulkCreateResponse {
  created: Variant[];
  errors: {
    index: number;
    variant: VariantCreateDto;
    error: string;
  }[];
}

/**
 * Opciones para select de tamaños (tabla OSZC)
 */
export interface SizeOption {
  sizeCode: string;
  sizeName: string;
}

/**
 * Opciones para select de colores (tabla Colors)
 */
export interface ColorOption {
  colorCode: string;
  colorName: string;
}

/**
 * Producto con variantes (para listar)
 */
export interface ProductWithVariants {
  itemCode: string;
  itemName: string;
  price: number;
  imageUrl?: string;
  u_HasVariants: string;
  variantCount: number;           // Calculado en frontend
}

/**
 * Estados disponibles
 */
export enum VariantAvailableStatus {
  YES = 'Y',
  NO = 'N'
}

/**
 * Interfaz para slot de variante (crear múltiples)
 */
export interface VariantSlot {
  variantName: string;
  brandName: string;
  sizeCode?: string;
  colorCode?: string;
  priceAdjustment: number;
  available: string;
  sizeName?: string;              // Para mostrar en UI
  colorName?: string;             // Para mostrar en UI
}

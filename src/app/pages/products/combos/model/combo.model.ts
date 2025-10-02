import { Product } from "../../product/model/product.model";

// ===== DTOs de respuesta (Response) =====

/**
 * DTO de respuesta para una opción de combo (según API documentation)
 * Basado en DTOs de API_DOCUMENTATION.md
 */
export interface ComboOptionResponseDto {
  optionCode: number;               // ID único de la opción
  comboItemCode: string;            // Código del combo principal (segun la API)
  componentLineNum: number;         // Número de línea del componente (según la API)
  groupCode: string;                // Código del grupo (según la API - BEBIDAS, PAPAS, etc.)
  itemCode: string;                 // Código del producto opción (según la API)
  itemName?: string;                // Nombre personalizado de la opción
  sizeCode?: string;                // Código del tamaño
  optionItemName: string;           // Nombre del producto opción (viene de la API)
  optionPrice: number;              // Precio base del producto opción
  priceDiff: number;                // Diferencia de precio (según la API - reemplaza priceDelta)
  finalPrice: number;               // Precio final calculado
  isDefault: string;                // Y/N - Si es la opción por defecto
  upLevel: number;                  // Nivel de upgrade (según la API - reemplaza upgradeLevel)
  upLabel?: string;                 // Etiqueta de upgrade (según la API - reemplaza upgradeLabel)
  lineNum: number;                  // Número de línea
  displayOrder: number;             // Orden de visualización
  available: string;                // Y/N - Disponibilidad
  imageUrl?: string;                // URL de imagen del producto opción
  description?: string;             // Descripción del producto opción
}

/**
 * DTO de respuesta para un combo completo con sus opciones
 * Basado en ComboResponseDto de API_DOCUMENTATION.md
 */
export interface ComboResponseDto {
  itemCode: string;                 // Código único del combo
  itemName: string;                 // Nombre del combo
  frgnName?: string;                // Nombre en idioma extranjero
  price: number;                    // Precio base del combo
  discount?: number;                // Descuento en porcentaje
  imageUrl?: string;                // URL de imagen del combo
  description?: string;             // Descripción del combo
  frgnDescription?: string;         // Descripción en idioma extranjero
  groupItemCode?: string;           // Código del grupo
  categoryItemCode?: string;        // Código de la categoría
  waitingTime?: string;             // Tiempo de espera
  rating?: number;                  // Calificación
  isCombo: string;                  // Siempre 'Y' para combos
  available: string;                // Y/N - Disponibilidad
  enabled: string;                  // Y/N - Estado del combo
  sellItem: string;                 // Y/N - Disponible para venta
  options: ComboOptionResponseDto[]; // Array de opciones del combo (renombrado de comboOptions a options)
}

// ===== DTOs de creación (Create) =====

/**
 * DTO para crear una opción individual de combo
 * Basado en ComboOptionItemDto de API_DOCUMENTATION.md
 */
export interface ComboOptionItemDto {
  componentLineNum: number;         // Línea del componente (requerido)
  groupCode: string;                // Código del grupo (requerido - BEBIDAS, PAPAS, etc.)
  itemCode: string;                 // Código del producto opción (requerido)
  itemName?: string;                // Nombre personalizado
  sizeCode?: string;                // Código del tamaño
  isDefault: string;                // Y/N (requerido)
  priceDiff: number;                // Diferencia de precio (según API - reemplaza priceDelta)
  upLevel: number;                  // Nivel de upgrade (según API - reemplaza upgradeLevel)
  upLabel?: string;                 // Etiqueta de upgrade (según API - reemplaza upgradeLabel)
  lineNum?: number;                 // Número de línea (default: 0)
  displayOrder?: number;            // Orden de visualización (default: 0)
  available: string;                // Y/N - Disponibilidad (default: Y)
}

/**
 * DTO para crear un combo con sus opciones en una sola operación
 * Basado en ComboCreateDto de API_DOCUMENTATION.md
 */
export interface ComboCreateDto {
  itemCode: string;                 // Código único del combo (requerido)
  itemName: string;                 // Nombre del combo (requerido)
  frgnName?: string;                // Nombre en idioma extranjero
  price: number;                    // Precio base del combo (requerido)
  discount?: number;                // Descuento en porcentaje
  imageUrl?: string;                // URL de imagen opcional
  description?: string;             // Descripción opcional
  frgnDescription?: string;         // Descripción en idioma extranjero
  groupItemCode?: string;           // Código del grupo
  categoryItemCode?: string;        // Código de la categoría
  waitingTime?: string;             // Tiempo de espera
  rating?: number;                  // Calificación
  eanCode?: string;                 // Código EAN
  options: ComboOptionItemDto[];    // Array de opciones (opcional)
}

// ===== DTOs de actualización (Update) =====

/**
 * DTO para actualizar un combo (sin incluir opciones)
 * Basado en ComboUpdateDto de API_DOCUMENTATION.md
 */
export interface ComboUpdateDto {
  itemName: string;                 // Nombre del combo (requerido)
  frgnName?: string;                // Nombre en idioma extranjero
  price: number;                    // Precio base (requerido)
  discount?: number;                // Descuento en porcentaje
  imageUrl?: string;                // URL de imagen opcional
  description?: string;             // Descripción opcional
  frgnDescription?: string;         // Descripción en idioma extranjero
  groupItemCode?: string;           // Código del grupo
  categoryItemCode?: string;        // Código de la categoría
  waitingTime?: string;             // Tiempo de espera
  rating?: number;                  // Calificación
  available: string;                // Y/N - Disponibilidad (requerido, default: Y)
  enabled: string;                  // Y/N - Estado (requerido, default: Y)
}

/**
 * DTO para actualizar una opción de combo
 * Basado en ComboOptionUpdateDto de API_DOCUMENTATION.md
 */
export interface ComboOptionUpdateDto {
  itemName?: string;                // Nombre personalizado de la opción
  sizeCode?: string;                // Código del tamaño
  isDefault: string;                // Y/N - Si es la opción por defecto
  priceDiff: number;                // Diferencia de precio
  upLevel: number;                  // Nivel de upgrade
  upLabel?: string;                 // Etiqueta de upgrade
  lineNum?: number;                 // Número de línea
  displayOrder?: number;            // Orden de visualización
  available: string;                // Y/N - Disponibilidad
}

// ===== Modelos de dominio (para uso interno en la aplicación) =====

/**
 * Alias para mantener compatibilidad con código existente
 */
export interface ComboOption extends ComboOptionResponseDto {}

/**
 * Modelo completo de un combo con sus opciones
 * Extiende Product para mantener compatibilidad
 */
export interface ComboProduct extends Product {
  isCombo: 'Y';                     // Siempre debe ser 'Y' para combos
  options: ComboOption[];           // Array de opciones del combo (renombrado de comboOptions a options)
}

/**
 * Alias para mantener compatibilidad con código existente
 */
export interface ComboOptionCreateRequest extends ComboOptionItemDto {}

/**
 * Alias para mantener compatibilidad con código existente
 */
export interface ComboOptionUpdateRequest extends ComboOptionUpdateDto {}

// ===== UI Helpers =====

/**
 * Slot para configurar nueva opción en el modal (UI helper)
 */
export interface ComboOptionSlot {
  componentLineNum: number;         // Línea del componente
  groupCode: string;                // Grupo al que pertenece
  itemCode: string;                 // Producto seleccionado
  itemName?: string;                // Nombre personalizado
  sizeCode?: string;                // Código del tamaño
  isDefault: string;                // Y/N
  priceDiff: number;                // Diferencia de precio
  upLevel: number;                  // Nivel de upgrade (0, 1, 2...)
  upLabel?: string;                 // Etiqueta de upgrade
  lineNum?: number;                 // Número de línea
  displayOrder?: number;            // Orden de visualización
  available: string;                // Y/N - Disponibilidad
}
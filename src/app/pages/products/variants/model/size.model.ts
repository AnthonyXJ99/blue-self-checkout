/**
 * Interfaz para Size (OSZC - Tamaños)
 * Representa los tamaños disponibles desde la tabla OSZC de SAP B1
 */
export interface Size {
  /**
   * Código único del tamaño
   * @example "500ML", "750ML", "1LT", "MED", "LRG"
   */
  sizeCode: string;

  /**
   * Nombre descriptivo del tamaño
   * @example "500 Mililitros", "Mediano", "Grande"
   */
  sizeName: string;

  /**
   * Número de línea para ordenamiento
   */
  lineNum: number;

  /**
   * Estado habilitado (Y/N)
   */
  enabled: string;

  /**
   * Fuente de datos (M=Manual, A=Automático, etc.)
   */
  dataSource: string;

  /**
   * Usuario que creó el registro
   */
  createdBy?: string | null;

  /**
   * Fecha de creación
   */
  createDate?: string;

  /**
   * Usuario que actualizó el registro
   */
  updateBy?: string | null;

  /**
   * Fecha de actualización
   */
  updateDate?: string;
}

/**
 * DTO para crear un nuevo Size
 */
export interface SizeCreateDto {
  sizeCode: string;
  sizeName: string;
  lineNum: number;
  enabled: string;      // Y/N
  dataSource: string;   // M=Manual
}

/**
 * DTO para actualizar un Size (igual que create)
 */
export interface SizeUpdateDto extends SizeCreateDto {}

/**
 * Representa una orden en el sistema
 */
export interface Order {
    docEntry: number;
    folioPref?: string;
    folioNum: string;
    customerCode?: string;
    customerName?: string;
    nickName?: string;
    deviceCode?: string;
    docDate?: Date;
    docDueDate?: Date;
    docStatus?: string;
    docType?: string;
    paidType?: string;
    transferred?: string;
    printed?: string;
    docRate?: number;
    docTotal?: number;
    docTotalFC?: number;
    comments?: string;
    orderLines?: OrderLine[];
  }
  
  /**
   * Línea de orden
   */
  export interface OrderLine {
    docEntry: number;
    lineId: number;
    itemCode: string;
    itemName: string;
    quantity?: number;
    price?: number;
    lineStatus?: string;
    taxCode?: string;
    lineTotal?: number;
    order?: Order;
  }
  
  /**
   * DTO para crear una orden
   */
  export interface OrderCreateDto {
    folioNum: string;
    folioPref?: string;
    customerCode?: string;
    customerName?: string;
    nickName?: string;
    deviceCode?: string;
    docDate?: Date;
    docDueDate?: Date;
    docStatus?: string;
    docType?: string;
    paidType?: string;
    transferred?: string;
    printed?: string;
    docRate?: number;
    docTotal?: number;
    docTotalFC?: number;
    comments?: string;
    orderLines?: DocumentLineCreateDto[];
  }
  
  /**
   * DTO para actualizar una orden
   */
  export interface OrderUpdateDto {
    folioPref?: string;
    folioNum?: string;
    customerCode?: string;
    customerName?: string;
    nickName?: string;
    deviceCode?: string;
    docDate?: Date;
    docDueDate?: Date;
    docStatus?: string;
    docType?: string;
    paidType?: string;
    transferred?: string;
    printed?: string;
    docRate?: number;
    docTotal?: number;
    docTotalFC?: number;
    comments?: string;
    orderLines?: DocumentLineUpdateDto[];
  }
  
  /**
   * DTO de respuesta de orden
   */
  export interface OrderResponseDto {
    docEntry: number;
    folioPref?: string;
    folioNum?: string;
    customerCode?: string;
    customerName?: string;
    nickName?: string;
    deviceCode?: string;
    docDate?: Date;
    docDueDate?: Date;
    docStatus?: string;
    docType?: string;
    paidType?: string;
    transferred?: string;
    printed?: string;
    docRate?: number;
    docTotal?: number;
    docTotalFC?: number;
    comments?: string;
    orderLines?: DocumentLineResponseDto[];
  }
  
  /**
   * DTO para crear línea de documento
   */
  export interface DocumentLineCreateDto {
    itemCode: string;
    itemName: string;
    quantity?: number;
    price?: number;
    lineStatus?: string;
    taxCode?: string;
    lineTotal?: number;
  }
  
  /**
   * DTO para actualizar línea de documento
   */
  export interface DocumentLineUpdateDto {
    lineId: number;
    itemCode?: string;
    itemName?: string;
    quantity: number;
    price: number;
    lineStatus?: string;
    taxCode?: string;
    lineTotal: number;
  }
  
  /**
   * DTO de respuesta de línea de documento
   */
  export interface DocumentLineResponseDto {
    docEntry: number;
    lineId: number;
    itemCode?: string;
    itemName?: string;
    quantity?: number;
    price?: number;
    lineStatus?: string;
    taxCode?: string;
    lineTotal?: number;
  }
  
  /**
   * Importar ApiResponse del archivo de configuración
   */
  import { ApiResponse } from "../../../../core/model/api-response.model";
  
  /**
   * Respuesta paginada de órdenes (usando ApiResponse existente)
   */
  /**
 * ApiResponse extendida para órdenes con campos adicionales
 */
export interface OrderApiResponse<T> extends ApiResponse<T> {
  totalRecords: number;     // ✅ Campo que devuelve tu API
  totalPages: number;       // ✅ Campo adicional de tu API  
  hasNextPage: boolean;     // ✅ Campo adicional
  hasPreviousPage: boolean; // ✅ Campo adicional
}

/**
 * Respuesta paginada específica para órdenes
 */
  export type OrderPagedResponse = OrderApiResponse<OrderResponseDto>;

  
  /**
   * Parámetros de filtro para órdenes
   */
  export interface OrderFilterParams {
    page?: number;
    pageSize?: number;
    filter?: string;
    customerCode?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    docType?: string;
    deviceCode?: string;
  }
  
  /**
   * Estados posibles de una orden
   */
  export enum OrderStatus {
    PENDING = 'P',
    COMPLETED = 'C',
    CANCELLED = 'X',
    IN_PROGRESS = 'I'
  }
  
  /**
   * Tipos de documento
   */
  export enum DocumentType {
    ORDER = 'O',
    INVOICE = 'F',
    QUOTE = 'Q'
  }
  
  /**
   * Tipos de pago
   */
  export enum PaymentType {
    CASH = 'C',
    CARD = 'T',
    TRANSFER = 'R',
    MIXED = 'M'
  }
  
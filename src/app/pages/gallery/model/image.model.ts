import { RequestParams } from "../../../core/config/api.config";
import { ApiResponse } from "../../../core/model/api-response.model";

/**
 * Modelo de datos para Image
 */
export interface Image {
  imageCode?: string;           // PK - generado automáticamente
  imageTitle: string;           // Título descriptivo (requerido)
  imageType: ImageType;         // Tipo de imagen (requerido)
  description?: string;         // Descripción opcional
  fileName: string;             // Nombre del archivo generado
  filePath: string;             // Ruta física completa
  publicUrl: string;            // URL pública para acceso
  originalFileName?: string;    // Nombre original del archivo
  fileSize: number;             // Tamaño en bytes
  contentType?: string;         // Tipo MIME
  createdAt: Date;              // Fecha de creación
  updatedAt?: Date;             // Fecha de actualización
  deletedAt?: Date;             // Fecha de eliminación (soft delete)
  isActive: boolean;            // Estado activo
  displayOrder?: number;        // Orden de visualización
  altText?: string;             // Texto alternativo
  tags?: string;                // Etiquetas para clasificación
  deviceCode?: string;          // Código del dispositivo asociado
}

/**
 * Tipos de imagen
 */
export type ImageType = 'Logo' | 'Publicidad' | 'Banner' | 'Item';

/**
 * Modelo para actualizar imagen
 */
export interface UpdateImageRequest {
    imageTitle?: string;
    imageType?: ImageType;
    description?: string;
    tag?: string;
    deviceId?: string;
}

/**
 * Modelo de respuesta paginada para imágenes
 */
export interface ImagePagedResponse extends ApiResponse<Image> {}

/**
* Parámetros para filtrar imágenes
*/
export interface ImageFilterParams extends RequestParams {
 search?: string;
 imageType?: ImageType;
}

/**
 * Parámetros para upload de imagen
 */
export interface ImageUploadData {
    imageTitle: string;
    imageType?: ImageType;
    description?: string;
    tag?: string;
    deviceCode?: string;
  }
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { API_CONFIG } from '../../core/config/api.config';
import { RequestParams } from '../../core/config/api.config';
import { ApiResponse } from '../../core/model/api-response.model';
import { Image, ImageFilterParams, ImagePagedResponse, ImageType, ImageUploadData, UpdateImageRequest } from '../gallery/model/image.model';

@Injectable({
    providedIn: 'root'
})
export class ImageApiService{
    private readonly endpoint = API_CONFIG.ENDPOINTS.IMAGES;

    constructor(private apiService: ApiService) {}

    /**
   * Sube una nueva imagen al sistema
   * POST /api/Images/upload
   */
  uploadImage(file: File, imageData: ImageUploadData): Observable<Image> {
    const additionalData = {
      imageTitle: imageData.imageTitle,
      imageType: imageData.imageType || 'Item',
      description: imageData.description || '',
      tag: imageData.tag || ''
    };

    return this.apiService.upload<Image>(`${this.endpoint}/upload`, file, additionalData);
  }

  /**
   * Obtiene todas las imágenes sin paginación
   * GET /api/Images/all
   */
  getAllImages(): Observable<Image[]> {
    return this.apiService.get<Image[]>(`${this.endpoint}/all`);
  }

  /**
   * Obtiene imágenes con paginación y filtros
   * GET /api/Images
   */
  getImages(params?: ImageFilterParams): Observable<ImagePagedResponse> {
    return this.apiService.getPaginated<Image>(`${this.endpoint}`, params);
  }

  /**
   * Obtiene imágenes por tipo específico
   * GET /api/Images/by-type/{type}
   */
  getImagesByType(type: ImageType): Observable<Image[]> {
    return this.apiService.get<Image[]>(`${this.endpoint}/by-type/${type}`);
  }

  /**
   * Obtiene una imagen específica por código
   * GET /api/Images/{imageCode}
   */
  getImageByCode(imageCode: string): Observable<Image> {
    return this.apiService.get<Image>(`${this.endpoint}/${imageCode}`);
  }

  /**
   * Actualiza los datos de una imagen existente (sin cambiar el archivo)
   * PUT /api/Images/{imageCode}
   */
  updateImage(imageCode: string, updateData: UpdateImageRequest): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/${imageCode}`, updateData);
  }

  /**
   * Elimina una imagen (archivo físico y registro en BD)
   * DELETE /api/Images/{imageCode}
   */
  deleteImage(imageCode: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${imageCode}`);
  }

  /**
   * Lista todas las imágenes físicas disponibles en la carpeta
   * GET /api/Images/files/list
   */
  listImageFiles(): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.endpoint}/files/list`);
  }

  // === MÉTODOS DE UTILIDAD ===

  /**
   * Valida si un tipo de imagen es válido
   */
  isValidImageType(type: string): type is ImageType {
    return ['Logo', 'Publicidad', 'Item'].includes(type);
  }

  /**
   * Obtiene las imágenes de logos
   */
  getLogos(): Observable<Image[]> {
    return this.getImagesByType('Logo');
  }

  /**
   * Obtiene las imágenes de publicidad
   */
  getAdvertisements(): Observable<Image[]> {
    return this.getImagesByType('Publicidad');
  }

  /**
   * Obtiene las imágenes de productos/items
   */
  getProductImages(): Observable<Image[]> {
    return this.getImagesByType('Item');
  }

  /**
   * Busca imágenes por término de búsqueda
   */
  searchImages(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<ImagePagedResponse> {
    const params: ImageFilterParams = {
      search: searchTerm,
      pageNumber,
      pageSize
    };
    return this.getImages(params);
  }

  /**
   * Busca imágenes por tipo y término de búsqueda
   */
  searchImagesByType(imageType: ImageType, searchTerm?: string, pageNumber: number = 1, pageSize: number = 10): Observable<ImagePagedResponse> {
    const params: ImageFilterParams = {
      imageType,
      search: searchTerm,
      pageNumber,
      pageSize
    };
    return this.getImages(params);
  }

  /**
   * Valida el archivo antes del upload
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de archivo no válido. Solo se permiten JPEG, PNG, GIF y WebP.'
      };
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo es demasiado grande. Máximo 5MB permitido.'
      };
    }

    return { isValid: true };
  }

  /**
   * Obtiene la URL completa de una imagen
   */
  getImageUrl(image: Image): string {
    if (image.publicUrl.startsWith('http')) {
      return image.publicUrl;
    }
    return `${this.apiService.getBaseUrl()}${image.publicUrl}`;
  }

  /**
   * Crea un objeto Image para preview antes del upload
   */
  createImagePreview(file: File, imageData: ImageUploadData): Partial<Image> {
    return {
      imageTitle: imageData.imageTitle,
      imageType: imageData.imageType || 'Item',
      description: imageData.description,
      originalFileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      isActive: true,
      tags: imageData.tag
    };
  }

    
}

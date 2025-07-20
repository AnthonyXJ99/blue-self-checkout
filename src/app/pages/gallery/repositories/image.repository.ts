import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ImageApiService } from '../../service/image-api.service';
import { Image, ImageFilterParams, ImagePagedResponse, ImageType, ImageUploadData, UpdateImageRequest } from '../model/image.model';

@Injectable({ providedIn: 'root' })
export class ImageRepository {
  constructor(private imageApi: ImageApiService) {}

  uploadImage(file: File, imageData: ImageUploadData): Observable<Image | null> {
    return this.imageApi.uploadImage(file, imageData).pipe(
      catchError(() => of(null))
    );
  }

  getAllImages(): Observable<Image[]> {
    return this.imageApi.getAllImages().pipe(
      catchError(() => of([]))
    );
  }

  getImages(params?: ImageFilterParams): Observable<ImagePagedResponse | null> {
    return this.imageApi.getImages(params).pipe(
      catchError(() => of(null))
    );
  }

  getImagesByType(type: ImageType): Observable<Image[]> {
    return this.imageApi.getImagesByType(type).pipe(
      catchError(() => of([]))
    );
  }

  getImageByCode(imageCode: string): Observable<Image | null> {
    return this.imageApi.getImageByCode(imageCode).pipe(
      catchError(() => of(null))
    );
  }

  updateImage(imageCode: string, updateData: UpdateImageRequest): Observable<boolean> {
    return this.imageApi.updateImage(imageCode, updateData).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  deleteImage(imageCode: string): Observable<boolean> {
    return this.imageApi.deleteImage(imageCode).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  listImageFiles(): Observable<string[]> {
    return this.imageApi.listImageFiles().pipe(
      catchError(() => of([]))
    );
  }

  getLogos(): Observable<Image[]> {
    return this.imageApi.getLogos().pipe(
      catchError(() => of([]))
    );
  }

  getAdvertisements(): Observable<Image[]> {
    return this.imageApi.getAdvertisements().pipe(
      catchError(() => of([]))
    );
  }

  getProductImages(): Observable<Image[]> {
    return this.imageApi.getProductImages().pipe(
      catchError(() => of([]))
    );
  }

  searchImages(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<ImagePagedResponse | null> {
    return this.imageApi.searchImages(searchTerm, pageNumber, pageSize).pipe(
      catchError(() => of(null))
    );
  }

  searchImagesByType(imageType: ImageType, searchTerm?: string, pageNumber: number = 1, pageSize: number = 10): Observable<ImagePagedResponse | null> {
    return this.imageApi.searchImagesByType(imageType, searchTerm, pageNumber, pageSize).pipe(
      catchError(() => of(null))
    );
  }

  validateImageFile(file: File): { isValid: boolean; error?: string } {
    return this.imageApi.validateImageFile(file);
  }

  getImageUrl(image: Image): string {
    return this.imageApi.getImageUrl(image);
  }

  createImagePreview(file: File, imageData: ImageUploadData): Partial<Image> {
    return this.imageApi.createImagePreview(file, imageData);
  }
}

import { ChangeDetectionStrategy, Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TableModule, Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { RippleModule } from 'primeng/ripple';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { ChipsModule } from 'primeng/chips';
import { SelectModule } from 'primeng/select';
import { finalize } from 'rxjs/operators';

// Importar repository y modelos
import { ImageRepository } from './repositories/image.repository';
import { Image, ImageType, ImageUploadData, UpdateImageRequest } from './model/image.model';

// Interfaz para compatibilidad con el template existente
export interface ImageItem extends Image {
  // El template usa estas propiedades tal como están en Image
}

export interface ImageResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: ImageItem[];
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    RippleModule,
    DropdownModule,
    FileUploadModule,
    ChipsModule,
    SelectModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent implements OnInit {
  
  images = signal<ImageItem[]>([]);
  selectedImages = signal<ImageItem[] | null>(null);
  imageDialog: boolean = false;
  submitted = signal(false);
  image = signal<ImageItem | null>(null);
  loading = signal(false);
  
  @ViewChild('dt') dt!: Table;

  // Tipos de imagen disponibles (ajustados a los del API)
  imageTypes = [
    { label: 'Todos', value: '' },
    { label: 'Logo', value: 'Logo' },
    { label: 'Publicidad', value: 'Publicidad' },
    { label: 'Banner', value: 'Banner' },
    { label: 'Item', value: 'Item' }
  ];

  // Filtros
  selectedImageType = signal<string | null>(null);
  searchText = signal('');

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private imageRepository: ImageRepository
  ) {}

  ngOnInit() {
    console.log('GalleryComponent initialized');
    this.loadImages();
  }

  loadImages() {
    console.log('Loading images...');
    this.loading.set(true);
    
    this.imageRepository.getAllImages()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (images) => {
          this.images.set(images);
          console.log('Images loaded:', images.length);
        },
        error: (error) => {
          console.error('Error loading images:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las imágenes',
            life: 5000
          });
        }
      });
  }

  openNew() {
    this.image.set({
      imageCode: '',
      imageTitle: '',
      imageType: 'Item' as ImageType,
      description: '',
      fileName: '',
      filePath: '',
      publicUrl: '',
      originalFileName: '',
      fileSize: 0,
      contentType: '',
      createdAt: new Date(),
      updatedAt: undefined,
      deletedAt: undefined,
      isActive: true,
      displayOrder: undefined,
      altText: '',
      tags: '',
      deviceCode: ''
    });
    this.submitted.set(false);
    this.imageDialog = true;
  }

  deleteSelectedImages() {
    const selected = this.selectedImages();
    if (!selected || selected.length === 0) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar ${selected.length} imagen(es) seleccionada(s)?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        let deletedCount = 0;
        let errorCount = 0;

        selected.forEach((image) => {
          this.imageRepository.deleteImage(image.imageCode!).subscribe({
            next: (success) => {
              if (success) {
                deletedCount++;
              } else {
                errorCount++;
              }

              // Verificar si es la última operación
              if (deletedCount + errorCount === selected.length) {
                this.loading.set(false);
                
                if (deletedCount > 0) {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Exitoso',
                    detail: `${deletedCount} imagen(es) eliminada(s)`,
                    life: 3000
                  });
                }
                
                if (errorCount > 0) {
                  this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: `${errorCount} imagen(es) no pudieron eliminarse`,
                    life: 5000
                  });
                }

                // Recargar imágenes y limpiar selección
                this.loadImages();
                this.selectedImages.set(null);
              }
            },
            error: () => {
              errorCount++;
              if (deletedCount + errorCount === selected.length) {
                this.loading.set(false);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar las imágenes seleccionadas',
                  life: 5000
                });
                this.loadImages();
                this.selectedImages.set(null);
              }
            }
          });
        });
      }
    });
  }

  editImage(image: ImageItem) {
    this.image.set({ ...image });
    this.imageDialog = true;
  }

  deleteImage(image: ImageItem) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar ' + image.imageTitle + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);
        
        this.imageRepository.deleteImage(image.imageCode!)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (success) => {
              if (success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Exitoso',
                  detail: 'Imagen eliminada',
                  life: 3000
                });
                this.loadImages(); // Recargar lista
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'No se pudo eliminar la imagen',
                  life: 5000
                });
              }
            },
            error: (error) => {
              console.error('Error deleting image:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar la imagen',
                life: 5000
              });
            }
          });
      }
    });
  }

  hideDialog() {
    this.imageDialog = false;
    this.submitted.set(false);
    this.selectedFile.set(null); // Limpiar archivo seleccionado
  }

  saveImage() {
    this.submitted.set(true);
    const currentImage = this.image();

    if (!currentImage?.imageTitle?.trim() || !currentImage?.imageType) {
      return;
    }

    this.loading.set(true);

    if (currentImage.imageCode) {
      // Actualizar imagen existente (solo metadatos)
      const updateData: UpdateImageRequest = {
        imageTitle: currentImage.imageTitle,
        imageType: currentImage.imageType,
        description: currentImage.description,
        tag: currentImage.tags
      };

      this.imageRepository.updateImage(currentImage.imageCode, updateData)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (success) => {
            if (success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Imagen actualizada',
                life: 3000
              });
              this.imageDialog = false;
              this.image.set(null);
              this.selectedFile.set(null);
              this.loadImages();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar la imagen',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error updating image:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar la imagen',
              life: 5000
            });
          }
        });
    } else {
      // Nueva imagen - requiere archivo
      const file = this.selectedFile();
      if (!file) {
        this.loading.set(false);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Debe seleccionar un archivo de imagen',
          life: 5000
        });
        return;
      }

      // Crear nueva imagen con upload
      const uploadData: ImageUploadData = {
        imageTitle: currentImage.imageTitle,
        imageType: currentImage.imageType as ImageType,
        description: currentImage.description,
        tag: currentImage.tags
      };

      this.imageRepository.uploadImage(file, uploadData)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (uploadedImage) => {
            if (uploadedImage) {
              this.messageService.add({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Imagen creada correctamente',
                life: 3000
              });
              this.imageDialog = false;
              this.image.set(null);
              this.selectedFile.set(null);
              this.loadImages();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo crear la imagen',
                life: 5000
              });
            }
          },
          error: (error) => {
            console.error('Error creating image:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear la imagen',
              life: 5000
            });
          }
        });
    }
  }

  findIndexById(imageCode: string): number {
    return this.images().findIndex(img => img.imageCode === imageCode);
  }

  createImageCode(): string {
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
                     (now.getMonth() + 1).toString().padStart(2, '0') +
                     now.getDate().toString().padStart(2, '0') +
                     now.getHours().toString().padStart(2, '0') +
                     now.getMinutes().toString().padStart(2, '0') +
                     now.getSeconds().toString().padStart(2, '0');
    
    const randomId = Math.random().toString(36).substring(2, 10);
    return `IMG_${timestamp}_${randomId}`;
  }

  getSeverity(isActive: boolean) {
    return isActive ? 'success' : 'danger';
  }

  getActiveLabel(isActive: boolean) {
    return isActive ? 'Activa' : 'Inactiva';
  }

  getFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onImageTypeFilter() {
    const selectedType = this.selectedImageType();
    console.log('Filtering by image type:', selectedType);
    
    if (selectedType) {
      this.loading.set(true);
      this.imageRepository.getImagesByType(selectedType as ImageType)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (images) => {
            this.images.set(images);
          },
          error: (error) => {
            console.error('Error filtering images:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al filtrar imágenes',
              life: 5000
            });
          }
        });
    } else {
      // Si no hay filtro, cargar todas las imágenes
      this.loadImages();
    }
  }

  // Variable para almacenar el archivo seleccionado
  selectedFile = signal<File | null>(null);

  onFileUpload(event: any) {
    const file = event.files[0];
    if (!file) return;

    // Validar archivo
    const validation = this.imageRepository.validateImageFile(file);
    if (!validation.isValid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: validation.error,
        life: 5000
      });
      return;
    }

    // Guardar el archivo para usarlo en saveImage()
    this.selectedFile.set(file);

    // Crear preview y actualizar la imagen en la vista
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (this.image()) {
        this.image.set({ 
          ...this.image()!, 
          originalFileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          publicUrl: e.target.result // URL temporal para preview
        });
      }
    };
    reader.readAsDataURL(file);

    this.messageService.add({
      severity: 'success',
      summary: 'Archivo cargado',
      detail: 'Imagen lista para guardar',
      life: 3000
    });
  }
}

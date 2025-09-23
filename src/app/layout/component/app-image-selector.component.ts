import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';

import { ImageRepository } from '../../pages/gallery/repositories/image.repository';
import { Image, ImageType, ImageUploadData } from '../../pages/gallery/model/image.model';

@Component({
  selector: 'app-image-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    FileUploadModule,
    TableModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <!-- Botón y preview en el formulario principal -->
    <div class="flex flex-col gap-3">
      <label class="block font-bold mb-3">{{ label }}</label>
      
      <!-- Preview de imagen seleccionada -->
      <div class="flex items-center gap-4" *ngIf="selectedImageUrl">
        <img [src]="selectedImageUrl" 
             alt="Imagen seleccionada" 
             class="w-20 h-20 object-cover rounded border shadow-sm"
             [title]="selectedImageTitle || 'Imagen seleccionada'" />
        <div class="flex flex-col gap-2">
          <span class="text-sm font-medium">{{ selectedImageTitle }}</span>
          <div class="flex gap-1">
            <p-button 
              label="Cambiar" 
              icon="pi pi-images" 
              size="small" 
              outlined
              (click)="openSelector()" />
            <p-button 
              icon="pi pi-times" 
              size="small" 
              severity="danger"
              outlined
              (click)="clearSelection()"
              pTooltip="Quitar imagen" />
          </div>
        </div>
      </div>

      <!-- Botón inicial cuando no hay imagen -->
      <div *ngIf="!selectedImageUrl" class="flex items-center gap-2">
        <p-button 
          label="Seleccionar Imagen" 
          icon="pi pi-images" 
          outlined
          (click)="openSelector()" />
        <p-button 
          label="Subir Nueva" 
          icon="pi pi-plus" 
          severity="secondary"
          outlined
          (click)="openUploadTab()" />
      </div>

      <small class="text-muted-color" *ngIf="!selectedImageUrl">
        Selecciona una imagen existente o sube una nueva
      </small>
    </div>

    <!-- Dialog principal del selector -->
    <p-dialog 
      [(visible)]="selectorVisible" 
      [style]="{ width: '90vw', maxWidth: '1200px', height: '80vh' }" 
      header="Seleccionar Imagen" 
      [modal]="true" 
      (onHide)="closeSelectorDialog()"
      [maximizable]="true">
      
      <ng-template #content>
        <div class="h-full flex flex-col gap-4">
          
          <!-- Tabs de navegación -->
          <div class="flex gap-2 border-b pb-3">
            <p-button 
              [label]="'Galería (' + images().length + ')'" 
              icon="pi pi-images"
              [outlined]="activeTab !== 'gallery'"
              [severity]="activeTab === 'gallery' ? 'primary' : 'secondary'"
              size="small"
              (click)="setActiveTab('gallery')" />
            <p-button 
              label="Subir Nueva" 
              icon="pi pi-plus"
              [outlined]="activeTab !== 'upload'"
              [severity]="activeTab === 'upload' ? 'primary' : 'secondary'"
              size="small"
              (click)="setActiveTab('upload')" />
          </div>

          <!-- Tab: Galería de imágenes existentes -->
          <div *ngIf="activeTab === 'gallery'" class="flex-1 flex flex-col gap-4 overflow-hidden">
            
            <!-- Filtros de búsqueda -->
            <div class="flex gap-3 items-center">
              <p-iconfield class="flex-1">
                <p-inputicon styleClass="pi pi-search" />
                <input 
                  pInputText 
                  type="text" 
                  [(ngModel)]="searchTerm"
                  (input)="onSearch()"
                  placeholder="Buscar por título, descripción o tags..." 
                  fluid />
              </p-iconfield>
              <p-select 
                [options]="imageTypes" 
                [(ngModel)]="selectedType"
                (onChange)="onTypeFilter()"
                optionLabel="label" 
                optionValue="value"
                placeholder="Todos los tipos"
                [style]="{ width: '200px' }">
              </p-select>
            </div>

            <!-- Grid de imágenes -->
            <div class="flex-1 overflow-auto">
              <div *ngIf="loading()" class="flex justify-center items-center h-40">
                <i class="pi pi-spinner pi-spin text-2xl text-primary"></i>
                <span class="ml-2">Cargando imágenes...</span>
              </div>

              <div *ngIf="!loading() && filteredImages().length === 0" class="text-center py-8 text-muted-color">
                <i class="pi pi-image text-4xl mb-3 block"></i>
                <p class="text-lg">No se encontraron imágenes</p>
                <p class="text-sm">Prueba con otros filtros o sube una nueva imagen</p>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" *ngIf="!loading() && filteredImages().length > 0">
                <div 
                  *ngFor="let image of filteredImages()" 
                  class="border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md"
                  [class.border-primary]="selectedImageCode === image.imageCode"
                  [class.bg-primary-50]="selectedImageCode === image.imageCode"
                  (click)="selectImage(image)">
                  
                  <div class="aspect-square overflow-hidden rounded mb-2">
                    <img 
                      [src]="image.publicUrl" 
                      [alt]="image.imageTitle"
                      class="w-full h-full object-cover"
                      [title]="image.imageTitle" />
                  </div>
                  
                  <div class="space-y-1">
                    <h6 class="font-medium text-sm truncate" [title]="image.imageTitle">
                      {{ image.imageTitle }}
                    </h6>
                    <p-tag [value]="image.imageType" severity="info" class="text-xs" />
                    <p class="text-xs text-muted-color truncate" *ngIf="image.description" [title]="image.description">
                      {{ image.description }}
                    </p>
                  </div>
                  
                  <!-- Indicador de selección -->
                  <div 
                    *ngIf="selectedImageCode === image.imageCode" 
                    class="absolute top-2 right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
                    <i class="pi pi-check text-xs"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Subir nueva imagen -->
          <div *ngIf="activeTab === 'upload'" class="flex-1 flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              
              <!-- Formulario de upload -->
              <div class="space-y-4">
                <h6 class="font-semibold text-lg">Subir Nueva Imagen</h6>
                
                <!-- Upload de archivo -->
                <div>
                  <label class="block font-bold mb-3">Archivo de Imagen *</label>
                  <p-fileupload 
                    mode="basic" 
                    name="image" 
                    accept="image/*" 
                    [maxFileSize]="10000000"
                    chooseLabel="Seleccionar Imagen"
                    (onSelect)="onFileSelect($event)"
                    [auto]="false"
                    customUpload="true">
                  </p-fileupload>
                  <small class="text-muted-color">Formatos: JPG, PNG, GIF. Máximo 10MB</small>
                </div>

                <!-- Título -->
                <div>
                  <label for="uploadTitle" class="block font-bold mb-3">Título *</label>
                  <input 
                    type="text" 
                    pInputText 
                    id="uploadTitle" 
                    [(ngModel)]="uploadData.imageTitle" 
                    placeholder="Título de la imagen"
                    required 
                    fluid />
                </div>

                <!-- Tipo -->
                <div>
                  <label for="uploadType" class="block font-bold mb-3">Tipo *</label>
                  <p-select 
                    id="uploadType"
                    [options]="imageTypesForUpload" 
                    [(ngModel)]="uploadData.imageType"
                    optionLabel="label" 
                    optionValue="value"
                    placeholder="Seleccionar tipo"
                    fluid>
                  </p-select>
                </div>

                <!-- Descripción -->
                <div>
                  <label for="uploadDescription" class="block font-bold mb-3">Descripción</label>
                  <textarea 
                    id="uploadDescription" 
                    pTextarea 
                    [(ngModel)]="uploadData.description" 
                    rows="3" 
                    placeholder="Descripción de la imagen"
                    fluid>
                  </textarea>
                </div>

                <!-- Tags -->
                <div>
                  <label for="uploadTags" class="block font-bold mb-3">Tags</label>
                  <input 
                    type="text" 
                    pInputText 
                    id="uploadTags" 
                    [(ngModel)]="uploadData.tag" 
                    placeholder="Separar con espacios"
                    fluid />
                  <small class="text-muted-color">Ejemplo: logo empresa principal</small>
                </div>

                <!-- Botón de upload -->
                <div class="pt-4">
                  <p-button 
                    label="Subir y Seleccionar" 
                    icon="pi pi-upload"
                    [loading]="uploading()"
                    [disabled]="!selectedFile() || !uploadData.imageTitle.trim()"
                    (click)="uploadNewImage()"
                    class="w-full" />
                </div>
              </div>

              <!-- Preview -->
              <div class="border-l pl-6" *ngIf="selectedFile()">
                <h6 class="font-semibold text-lg mb-4">Vista Previa</h6>
                <div class="bg-surface-50 dark:bg-surface-800 rounded p-4">
                  <img 
                    *ngIf="previewUrl()" 
                    [src]="previewUrl()" 
                    alt="Preview" 
                    class="w-full max-w-sm h-64 object-cover rounded mb-4 mx-auto" />
                  
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="font-medium">Archivo:</span>
                      <span>{{ selectedFile()?.name }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-medium">Tamaño:</span>
                      <span>{{ getFileSize(selectedFile()?.size || 0) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-medium">Tipo:</span>
                      <span>{{ selectedFile()?.type }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-template>

      <ng-template #footer>
        <div class="flex justify-between items-center w-full">
          <div *ngIf="activeTab === 'gallery' && selectedImageCode">
            <span class="text-sm text-muted-color">
              Imagen seleccionada: {{ getSelectedImageTitle() }}
            </span>
          </div>
          <div class="flex gap-2 ml-auto">
            <p-button label="Cancelar" icon="pi pi-times" outlined (click)="closeSelectorDialog()" />
            <p-button 
              label="Usar Seleccionada" 
              icon="pi pi-check"
              [disabled]="!selectedImageCode && activeTab === 'gallery'"
              (click)="confirmSelection()"
              *ngIf="activeTab === 'gallery'" />
          </div>
        </div>
      </ng-template>
    </p-dialog>

    <p-toast />
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .grid > div {
      position: relative;
    }
    
    .aspect-square {
      aspect-ratio: 1;
    }
  `]
})
export class ImageSelectorComponent implements OnInit {
  
  @Input() label: string = 'Imagen';
  @Input() selectedImageUrl: string = '';
  @Input() selectedImageTitle: string = '';
  @Input() filterByType: ImageType | null = null; // Para filtrar por tipo específico
  @Input() tipo: ImageType | null = null; // Filtro opcional por tipo de imagen
  
  @Output() imageSelected = new EventEmitter<{ url: string; title: string; imageCode: string  }>();
  @Output() imageCleared = new EventEmitter<void>();

  // Estados del componente
  selectorVisible = false;
  activeTab: 'gallery' | 'upload' = 'gallery';
  loading = signal(false);
  uploading = signal(false);

  // Imágenes y filtros
  images = signal<Image[]>([]);
  filteredImages = signal<Image[]>([]);
  searchTerm = '';
  selectedType = '';
  selectedImageCode = '';

  // Upload
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string>('');
  uploadData = {
    imageTitle: '',
    imageType: 'Item' as ImageType,
    description: '',
    tag: ''
  };

  // Opciones
  imageTypes: { label: string; value: string }[] = [];
  imageTypesForUpload: { label: string; value: string }[] = [];

  constructor(
    private imageRepository: ImageRepository,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initializeImageTypes();
    this.loadImages();
  }

  private initializeImageTypes() {
    const allTypes = [
      { label: 'Logo', value: 'Logo' },
      { label: 'Banner', value: 'Banner' },
      { label: 'Publicidad', value: 'Publicidad' },
      { label: 'Items', value: 'Item' }
    ];

    // Si se especifica un tipo, filtrar solo ese tipo
    if (this.tipo) {
      this.imageTypes = [
        { label: 'Todos los tipos', value: '' },
        ...allTypes.filter(type => type.value === this.tipo)
      ];
      this.imageTypesForUpload = allTypes.filter(type => type.value === this.tipo);
      // Establecer el tipo por defecto para upload
      this.uploadData.imageType = this.tipo;
    } else {
      // Mostrar todos los tipos
      this.imageTypes = [
        { label: 'Todos los tipos', value: '' },
        ...allTypes
      ];
      this.imageTypesForUpload = allTypes;
    }
  }

  // === MÉTODOS PRINCIPALES ===

  openSelector() {
    this.selectorVisible = true;
    this.activeTab = 'gallery';
    this.loadImages();
  }

  openUploadTab() {
    this.selectorVisible = true;
    this.activeTab = 'upload';
    this.resetUploadForm();
  }

  closeSelectorDialog() {
    this.selectorVisible = false;
    this.resetSelectionState();
    this.resetUploadForm();
  }

  setActiveTab(tab: 'gallery' | 'upload') {
    this.activeTab = tab;
    if (tab === 'gallery') {
      this.loadImages();
    } else {
      this.resetUploadForm();
    }
  }

  clearSelection() {
    this.selectedImageUrl = '';
    this.selectedImageTitle = '';
    this.imageCleared.emit();
  }

  // === GALERÍA ===

  loadImages() {
    this.loading.set(true);
    
    const loadObservable = this.filterByType 
      ? this.imageRepository.getImagesByType(this.filterByType)
      : this.imageRepository.getAllImages();

    loadObservable
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (images) => {
          this.images.set(images);
          this.applyFilters();
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

  selectImage(image: Image) {
    this.selectedImageCode = image.imageCode || '';
  }

  confirmSelection() {
    const selected = this.images().find(img => img.imageCode === this.selectedImageCode);
    if (selected) {
      this.selectedImageUrl = selected.publicUrl;
      this.selectedImageTitle = selected.imageTitle;
      this.imageSelected.emit({
        url: selected.publicUrl,
        title: selected.imageTitle,
        imageCode: selected.imageCode || ''
      });
      this.closeSelectorDialog();
    }
  }

  onSearch() {
    this.applyFilters();
  }

  onTypeFilter() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.images()];

    // Filtrar por tipo
    if (this.selectedType) {
      filtered = filtered.filter(img => img.imageType === this.selectedType);
    }

    // Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(img => 
        img.imageTitle.toLowerCase().includes(term) ||
        img.description?.toLowerCase().includes(term) ||
        img.tags?.toLowerCase().includes(term)
      );
    }

    this.filteredImages.set(filtered);
  }

  getSelectedImageTitle(): string {
    const selected = this.images().find(img => img.imageCode === this.selectedImageCode);
    return selected?.imageTitle || '';
  }

  // === UPLOAD ===

  onFileSelect(event: any) {
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

    this.selectedFile.set(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl.set(e.target.result);
    };
    reader.readAsDataURL(file);

    // Autocompletar título si está vacío
    if (!this.uploadData.imageTitle.trim()) {
      this.uploadData.imageTitle = file.name.split('.')[0];
    }
  }

  uploadNewImage() {
    const file = this.selectedFile();
    if (!file || !this.uploadData.imageTitle.trim()) return;

    this.uploading.set(true);

    const uploadData: ImageUploadData = {
      imageTitle: this.uploadData.imageTitle,
      imageType: this.uploadData.imageType,
      description: this.uploadData.description,
      tag: this.uploadData.tag
    };

    this.imageRepository.uploadImage(file, uploadData)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (uploadedImage) => {
          if (uploadedImage) {
            this.messageService.add({
              severity: 'success',
              summary: 'Exitoso',
              detail: 'Imagen subida correctamente',
              life: 3000
            });

            // Seleccionar automáticamente la imagen subida
            this.selectedImageUrl = uploadedImage.publicUrl;
            this.selectedImageTitle = uploadedImage.imageTitle;
            this.imageSelected.emit({
              url: uploadedImage.publicUrl,
              title: uploadedImage.imageTitle,
              imageCode: uploadedImage.imageCode || ''
            });

            this.closeSelectorDialog();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo subir la imagen',
              life: 5000
            });
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al subir la imagen',
            life: 5000
          });
        }
      });
  }

  // === UTILIDADES ===

  resetSelectionState() {
    this.selectedImageCode = '';
    this.searchTerm = '';
    this.selectedType = '';
  }

  resetUploadForm() {
    this.selectedFile.set(null);
    this.previewUrl.set('');
    this.uploadData = {
      imageTitle: '',
      imageType: 'Item',
      description: '',
      tag: ''
    };
  }

  getFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
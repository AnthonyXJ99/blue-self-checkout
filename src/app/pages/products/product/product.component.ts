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
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { RatingModule } from 'primeng/rating';
import { FileUploadModule } from 'primeng/fileupload';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';

export interface MaterialItem {
  itemCode: string;
  itemName: string;
  quantity: number;
  imageUrl: string;
  isPrimary: string;
  productItemCode: string;
}

export interface AccompanimentItem {
  itemCode: string;
  itemName: string;
  priceOld: number;
  price: number;
  imageUrl: string;
  productItemCode: string;
}

export interface ProductItem {
  itemCode: string;
  eanCode: string;
  itemName: string;
  frgnName: string;
  price: number;
  discount: number;
  imageUrl: string;
  description: string;
  frgnDescription: string | null;
  sellItem: string;
  available: string;
  enabled: string;
  groupItemCode: string | null;
  categoryItemCode: string;
  waitingTime: string;
  rating: number;
  material: MaterialItem[];
  accompaniment: AccompanimentItem[];
}

export interface ProductResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: ProductItem[];
}

@Component({
  selector: 'app-product',
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
    SelectModule,
    CheckboxModule,
    InputNumberModule,
    RatingModule,
    FileUploadModule,
    TabViewModule,
    CardModule,
    ChipModule,
    DividerModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent implements OnInit {
  
  products = signal<ProductItem[]>([]);
  selectedProducts = signal<ProductItem[] | null>(null);
  productDialog: boolean = false;
  submitted = signal(false);
  product = signal<ProductItem | null>(null);
  
  @ViewChild('dt') dt!: Table;

  // Estados disponibles
  statusOptions = [
    { label: 'Sí', value: 'Y' },
    { label: 'No', value: 'N' }
  ];

  // Categorías disponibles (ejemplo)
  categoryOptions = [
    { label: 'Hamburguesas', value: 'CI0001' },
    { label: 'Bebidas', value: 'CI0002' },
    { label: 'Postres', value: 'CI0003' },
    { label: 'Acompañamientos', value: 'CI0004' },
    { label: 'Combos', value: 'CI0005' },
    { label: 'Promociones', value: 'CI0006' }
  ];

  // Grupos disponibles (ejemplo)
  groupOptions = [
    { label: 'Comida Rápida', value: 'GI0001' },
    { label: 'Bebidas', value: 'GI0002' },
    { label: 'Postres', value: 'GI0003' }
  ];

  // Filtros
  selectedCategory = signal<string | null>(null);
  selectedStatus = signal<string | null>(null);
  searchText = signal('');

  // Materiales y acompañamientos
  materials = signal<MaterialItem[]>([]);
  accompaniments = signal<AccompanimentItem[]>([]);

  ngOnInit() {
    console.log('ProductComponent initialized');
    this.loadProducts();
  }

  loadProducts() {
    console.log('Loading products...');
    // Datos de ejemplo
    const mockData: ProductItem[] = [
      {
        itemCode: 'I0001',
        eanCode: '1234567890123',
        itemName: 'Big Mac',
        frgnName: 'Big Mac',
        price: 8500,
        discount: 10,
        imageUrl: 'http://192.168.18.43:5023/images/74be8c23-8d20-47ea-84f4-7616f8956cce.png',
        description: 'Hamburguesa clásica con lechuga, queso, cebolla y salsa especial',
        frgnDescription: 'Classic burger with lettuce, cheese, onion and special sauce',
        sellItem: 'Y',
        available: 'Y',
        enabled: 'Y',
        groupItemCode: 'GI0001',
        categoryItemCode: 'CI0001',
        waitingTime: '5',
        rating: 4.52,
        material: [
          {
            itemCode: 'M001',
            itemName: 'Pan de hamburguesa',
            quantity: 2,
            imageUrl: 'http://example.com/pan.jpg',
            isPrimary: 'Y',
            productItemCode: 'I0001'
          }
        ],
        accompaniment: [
          {
            itemCode: 'A001',
            itemName: 'Papas fritas',
            priceOld: 2000,
            price: 1800,
            imageUrl: 'http://example.com/papas.jpg',
            productItemCode: 'I0001'
          }
        ]
      },
      {
        itemCode: 'I0002',
        eanCode: '1234567890124',
        itemName: 'McFlurry Oreo',
        frgnName: 'McFlurry Oreo',
        price: 3500,
        discount: 0,
        imageUrl: 'http://example.com/mcflurry.jpg',
        description: 'Helado suave con galletas Oreo trituradas',
        frgnDescription: 'Soft serve ice cream with crushed Oreo cookies',
        sellItem: 'Y',
        available: 'Y',
        enabled: 'Y',
        groupItemCode: 'GI0003',
        categoryItemCode: 'CI0003',
        waitingTime: '3',
        rating: 4.8,
        material: [],
        accompaniment: []
      }
    ];
    this.products.set(mockData);
    console.log('Products loaded:', this.products());
  }

  openNew() {
    this.product.set({
      itemCode: '',
      eanCode: '',
      itemName: '',
      frgnName: '',
      price: 0,
      discount: 0,
      imageUrl: '',
      description: '',
      frgnDescription: '',
      sellItem: 'Y',
      available: 'Y',
      enabled: 'Y',
      groupItemCode: '',
      categoryItemCode: '',
      waitingTime: '5',
      rating: 0,
      material: [],
      accompaniment: []
    });
    this.materials.set([]);
    this.accompaniments.set([]);
    this.submitted.set(false);
    this.productDialog = true;
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar los productos seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products.set(this.products().filter((val) => !this.selectedProducts()?.includes(val)));
        this.selectedProducts.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Exitoso',
          detail: 'Productos eliminados',
          life: 3000
        });
      }
    });
  }

  editProduct(product: ProductItem) {
    this.product.set({ ...product });
    this.materials.set([...product.material]);
    this.accompaniments.set([...product.accompaniment]);
    this.productDialog = true;
  }

  deleteProduct(product: ProductItem) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar ' + product.itemName + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products.set(this.products().filter((val) => val.itemCode !== product.itemCode));
        this.messageService.add({
          severity: 'success',
          summary: 'Exitoso',
          detail: 'Producto eliminado',
          life: 3000
        });
      }
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted.set(false);
  }

  saveProduct() {
    this.submitted.set(true);

    if (this.product()?.itemName?.trim() && this.product()?.itemCode?.trim()) {
      let products = [...this.products()];
      
      if (this.product()?.itemCode) {
        // Actualizar producto existente
        const index = products.findIndex(prod => prod.itemCode === this.product()?.itemCode);
        if (index !== -1) {
          products[index] = { 
            ...this.product()!,
            material: this.materials(),
            accompaniment: this.accompaniments()
          };
        }
      } else {
        // Crear nuevo producto
        const newProduct = { 
          ...this.product()!, 
          itemCode: this.createProductCode(),
          material: this.materials(),
          accompaniment: this.accompaniments()
        };
        products.push(newProduct);
      }

      this.products.set(products);
      this.productDialog = false;
      this.product.set(null);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Exitoso',
        detail: this.product()?.itemCode ? 'Producto actualizado' : 'Producto creado',
        life: 3000
      });
    }
  }

  createProductCode(): string {
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
                     (now.getMonth() + 1).toString().padStart(2, '0') +
                     now.getDate().toString().padStart(2, '0') +
                     now.getHours().toString().padStart(2, '0') +
                     now.getMinutes().toString().padStart(2, '0') +
                     now.getSeconds().toString().padStart(2, '0');
    
    const randomId = Math.random().toString(36).substring(2, 8);
    return `I${timestamp}_${randomId}`;
  }

  getSeverity(status: string) {
    return status === 'Y' ? 'success' : 'danger';
  }

  getStatusLabel(status: string) {
    return status === 'Y' ? 'Sí' : 'No';
  }

  getCategoryLabel(categoryCode: string): string {
    const category = this.categoryOptions.find(cat => cat.value === categoryCode);
    return category ? category.label : categoryCode;
  }

  getGroupLabel(groupCode: string): string {
    const group = this.groupOptions.find(grp => grp.value === groupCode);
    return group ? group.label : groupCode;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onCategoryFilter() {
    console.log('Filtering by category:', this.selectedCategory());
  }

  onStatusFilter() {
    console.log('Filtering by status:', this.selectedStatus());
  }

  // Gestión de materiales
  addMaterial() {
    const newMaterial: MaterialItem = {
      itemCode: '',
      itemName: '',
      quantity: 1,
      imageUrl: '',
      isPrimary: 'N',
      productItemCode: this.product()?.itemCode || ''
    };
    this.materials.set([...this.materials(), newMaterial]);
  }

  removeMaterial(index: number) {
    const materials = [...this.materials()];
    materials.splice(index, 1);
    this.materials.set(materials);
  }

  // Gestión de acompañamientos
  addAccompaniment() {
    const newAccompaniment: AccompanimentItem = {
      itemCode: '',
      itemName: '',
      priceOld: 0,
      price: 0,
      imageUrl: '',
      productItemCode: this.product()?.itemCode || ''
    };
    this.accompaniments.set([...this.accompaniments(), newAccompaniment]);
  }

  removeAccompaniment(index: number) {
    const accompaniments = [...this.accompaniments()];
    accompaniments.splice(index, 1);
    this.accompaniments.set(accompaniments);
  }

  onFileUpload(event: any) {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.product()) {
          this.product.set({ 
            ...this.product()!, 
            imageUrl: e.target.result
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}
}

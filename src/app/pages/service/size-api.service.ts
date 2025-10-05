import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { API_CONFIG } from '../../core/config/api.config';
import { Size } from '../products/product/model/size.model';

/**
 * Servicio API para gestión de Tamaños (OSZC)
 * Obtiene los tamaños disponibles desde la tabla OSZC de SAP B1
 */
@Injectable({
  providedIn: 'root'
})
export class SizeApiService {

  private readonly SIZES_ENDPOINT = API_CONFIG.ENDPOINTS.SIZES;

  constructor(private apiService: ApiService) {}

  /**
   * Obtiene todos los tamaños disponibles desde la tabla OSZC
   * GET /api/Products/sizes
   */
  getAllSizes(): Observable<Size[]> {
    console.log('📏 Fetching all sizes from OSZC table');

    return this.apiService.get<Size[]>(this.SIZES_ENDPOINT).pipe(
      catchError(error => {
        console.error('Error fetching sizes:', error);
        // Si falla el endpoint, retornar tamaños por defecto comunes
        //return of(this.getDefaultSizes());      return of(this.getDefaultSizes());
        return of([]); // Retornar arreglo vacío si hay error
      })
    );
  }

  /**
   * Obtiene tamaños por defecto en caso de error de API
   * Estos son tamaños comunes que pueden usarse como fallback
   */
  // private getDefaultSizes(): Size[] {
  //   return [
  //     { sizeCode: '500ML', sizeName: '500 Mililitros' },
  //     { sizeCode: '750ML', sizeName: '750 Mililitros' },
  //     { sizeCode: '1LT', sizeName: '1 Litro' },
  //     { sizeCode: '1.5LT', sizeName: '1.5 Litros' },
  //     { sizeCode: '2LT', sizeName: '2 Litros' },
  //     { sizeCode: 'MED', sizeName: 'Mediano' },
  //     { sizeCode: 'LRG', sizeName: 'Grande' },
  //     { sizeCode: 'XL', sizeName: 'Extra Grande' }
  //   ];
  // }

  /**
   * Busca un tamaño por su código
   */
  getSizeByCode(sizeCode: string, sizes: Size[]): Size | undefined {
    return sizes.find(s => s.sizeCode === sizeCode);
  }

  /**
   * Valida si un código de tamaño existe
   */
  isSizeCodeValid(sizeCode: string, sizes: Size[]): boolean {
    return sizes.some(s => s.sizeCode === sizeCode);
  }

  /**
   * Obtiene el nombre de un tamaño por su código
   */
  getSizeName(sizeCode: string, sizes: Size[]): string {
    const size = this.getSizeByCode(sizeCode, sizes);
    return size?.sizeName || sizeCode;
  }
}

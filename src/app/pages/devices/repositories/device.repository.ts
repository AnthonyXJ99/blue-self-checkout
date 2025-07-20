import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DeviceApiService } from '../../service/device-api.service';
import { Device, DeviceCreateRequest, DeviceFilterParams, DevicePagedResponse, DeviceUpdateRequest } from '../model/device.model';

@Injectable({ providedIn: 'root' })
export class DeviceRepository {
  constructor(private deviceApi: DeviceApiService) {}

  getAllDevices(): Observable<Device[]> {
    return this.deviceApi.getAllDevices().pipe(
      catchError(() => of([]))
    );
  }

  getDevices(params?: DeviceFilterParams): Observable<DevicePagedResponse | null> {
    return this.deviceApi.getDevices(params).pipe(
      catchError(() => of(null))
    );
  }

  getDeviceByCode(deviceCode: string): Observable<Device | null> {
    return this.deviceApi.getDeviceByCode(deviceCode).pipe(
      catchError(() => of(null))
    );
  }

  createDevice(deviceData: DeviceCreateRequest): Observable<Device | null> {
    return this.deviceApi.createDevice(deviceData).pipe(
      catchError(() => of(null))
    );
  }

  updateDevice(deviceCode: string, deviceData: DeviceUpdateRequest): Observable<boolean> {
    return this.deviceApi.updateDevice(deviceCode, deviceData).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  deleteDevice(deviceCode: string): Observable<boolean> {
    return this.deviceApi.deleteDevice(deviceCode).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getEnabledDevices(): Observable<Device[]> {
    return this.deviceApi.getEnabledDevices().pipe(
      catchError(() => of([]))
    );
  }

  searchDevices(searchTerm: string, pageNumber: number = 1, pageSize: number = 10): Observable<DevicePagedResponse | null> {
    return this.deviceApi.searchDevices(searchTerm, pageNumber, pageSize).pipe(
      catchError(() => of(null))
    );
  }

  validateDeviceData(device: Partial<DeviceCreateRequest>): { isValid: boolean; errors: string[] } {
    return this.deviceApi.validateDeviceData(device);
  }

  isValidEnabledStatus(status: string): boolean {
    return this.deviceApi.isValidEnabledStatus(status);
  }

  isDeviceEnabled(device: Device): boolean {
    return this.deviceApi.isDeviceEnabled(device);
  }

  booleanToEnabledStatus(enabled: boolean): string {
    return this.deviceApi.booleanToEnabledStatus(enabled);
  }

  getEnabledLabel(device: Device): string {
    return this.deviceApi.getEnabledLabel(device);
  }

  getEnabledSeverity(device: Device): 'success' | 'danger' {
    return this.deviceApi.getEnabledSeverity(device);
  }

  createDefaultDevice(): DeviceCreateRequest {
    return this.deviceApi.createDefaultDevice();
  }

  checkDeviceConnectivity(device: Device): Observable<boolean> {
    return this.deviceApi.checkDeviceConnectivity(device).pipe(
      catchError(() => of(false))
    );
  }

  getDeviceStats(): { 
    total: number; 
    enabled: number; 
    disabled: number; 
    enabledPercentage: number 
  } {
    return this.deviceApi.getDeviceStats();
  }

  exportDevicesToCSV(devices: Device[]): string {
    return this.deviceApi.exportDevicesToCSV(devices);
  }
}

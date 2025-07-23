/**
 * Configuración para el sistema de exportación
 */
export const EXPORT_CONFIG = {
    // Cambiar a 'backend' cuando implementes endpoints de exportación
    MODE: 'frontend' as 'frontend' | 'backend' | 'hybrid',
    
    // Límite de registros para exportación en frontend
    MAX_RECORDS_FRONTEND: 10000,
    
    // Configuración de archivos CSV
    CSV: {
      DELIMITER: ',',
      ENCODING: 'utf-8',
      INCLUDE_BOM: true, // Para Excel en español
    },
    
    // Endpoints de exportación (para cuando uses backend)
    ENDPOINTS: {
      ORDERS_EXPORT: '/api/order/export',
      ORDERS_EXPORT_CSV: '/api/order/export/csv',
      ORDERS_EXPORT_TODAY: '/api/order/export/today',
      ORDERS_EXPORT_DATE_RANGE: '/api/order/export/date-range'
    }
  };
  
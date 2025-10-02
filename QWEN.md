# Blue Self Checkout Web Application

## Project Overview

Blue Self Checkout is an Angular 19 web application built for managing a self-checkout system. The application provides a comprehensive interface for managing products, combos, orders, customers, and devices in a retail environment. It uses PrimeNG as the primary UI component library and follows Angular's standalone component architecture.

### Key Features

- **Product Management**: CRUD operations for products, categories, product groups, ingredients, and accompaniments
- **Combo Management**: Creation and management of combo products with customizable options
- **Order Processing**: Complete order management system
- **Customer Management**: Customer data management and related operations
- **Device Management**: POS terminals and self-checkout device management
- **System Configuration**: Configuration settings for the self-checkout system
- **Dashboard**: Analytics interface with widgets for stats, revenue streams, recent sales, and notifications

### Technology Stack

- **Frontend Framework**: Angular 19
- **UI Library**: PrimeNG 19.0.8 with Aura theme
- **CSS Framework**: Tailwind CSS with PrimeUI integration
- **Styling**: SCSS and CSS
- **Data Visualization**: Chart.js 4.4.2
- **State Management**: RxJS-based service layer (no NgRx)
- **API Communication**: Angular HTTP Client with interceptors
- **Build Tool**: Angular CLI 19.0.6
- **Package Manager**: npm

## Architecture Overview

### Project Structure

The application follows a feature-based modular approach with three main directories:

- **Core Module** (`src/app/core/`):
  - Singleton services, API configuration, interceptors, and shared models
  - Centralized API service with pagination and error handling
  - Configuration for API endpoints and default settings

- **Layout Module** (`src/app/layout/`):
  - Application shell components (header, sidebar, footer, menu)
  - Navigation system with hierarchical menu structure
  - Layout services for theme and configuration management

- **Pages Module** (`src/app/pages/`):
  - Feature modules organized by business domain:
    - Dashboard (`dashboard/`): Analytics and widgets
    - Orders (`orders/order/`): Complete order management
    - Products (`products/`): Product catalog with sub-modules (product, category, product-group, ingredients, accompaniments, combos)
    - Devices (`devices/`): Device and OPOS management
    - Customers (`customer/`): Customer management system
    - Gallery (`gallery/`): Image and media management
    - Authentication (`auth/`): Login and auth flows
    - System Configuration (`system-configuration/`): Configuration management

### Key Architectural Patterns

- **Standalone Components**: Uses Angular 19's standalone components pattern with explicit imports
- **Repository Pattern**: Data access layer using repository pattern (e.g., `customer/repositories/`)
- **Service-Based State Management**: RxJS and Angular services for state management instead of NgRx
- **API Service Pattern**: Centralized HTTP client with RESTful methods, file upload/download, pagination, error handling, and retry logic
- **Component Structure**: Feature pages with dedicated components and specialized widgets

## Building and Running

### Prerequisites

- Node.js (compatible with Angular 19)
- Angular CLI 19.0.6

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

To start a local development server:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

Alternative command using npm scripts:
```bash
npm start
```

### Building for Production

To build the project:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

Alternative command using npm scripts:
```bash
npm run build
```

### Code Generation

Angular CLI includes powerful code scaffolding tools. To generate a new component:
```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`):
```bash
ng generate --help
```

### Testing

To execute unit tests with the Karma test runner:
```bash
ng test
```

Alternative command using npm scripts:
```bash
npm test
```

### Development Scripts

- `npm run format` - Format code using Prettier
- `ng build --watch` or `npm run watch` - Build with file watching for development

### API Configuration

The application is configured to connect to an API backend. The default configuration points to:
- Base URL: `https://localhost:7115/`

This can be modified in `src/app/core/config/api.config.ts` for different environments (development, staging, production).

## Development Conventions

### Code Style

- TypeScript strict typing is enabled
- Interface definitions for all API models
- Generic types for API responses and pagination
- Proper error handling with typed observables

### Component Organization

- Feature components grouped under `pages/<feature>/components/`
- Widget components for dashboard with descriptive names ending in "widget"
- Standalone components with explicit imports
- SCSS for component-specific styles

### Service Layer

- Feature-specific services in `pages/<feature>/services/`
- Core services in `src/app/core/services/`
- Repository pattern used for data access (e.g., `customer/repositories/`)

### Error Handling

- Comprehensive error handling in API service with fallback strategies and logging
- Centralized interceptor for HTTP request/response handling
- Formatted error messages according to API responses

## Business Domains

### Dashboard
- Main analytics interface with widgets for stats, revenue streams, recent sales, best-selling products, and notifications
- Uses `DashboardService` to aggregate data from multiple APIs using RxJS `forkJoin`

### Products
- Product catalog management including categories and product groups
- Combos with customizable options and pricing
- Ingredients management for product composition
- Accompaniments and related products

### Orders
- Complete order management with CRUD operations
- Export capabilities for order data

### Devices
- Management of POS terminals and self-checkout devices
- OPOS (OLE for Point of Service) device integration

### Customers
- Customer management system with repository pattern
- Customer groups and related operations

### System Configuration
- Configuration settings for the self-checkout system
- Synchronization settings and other system parameters

## Navigation & Menu System

The navigation is managed in `src/app/layout/component/app.menu.ts` with:
- Hierarchical menu structure using PrimeNG MenuItem interface
- Feature-based navigation grouping
- Dynamic routing with Angular Router
- Currently includes: Dashboard, Devices (POS/Devices), Gallery, Products (Groups/Categories/Products), Customers, Orders, System Configuration

## API Integration

The application connects to a backend API that supports:
- Product management (simple, variable, and combo products)
- Order processing
- Customer management
- Device configuration
- Image and media handling
- Authentication and authorization

Endpoints are configured in `src/app/core/config/api.config.ts` with support for pagination, filtering, and sorting parameters.
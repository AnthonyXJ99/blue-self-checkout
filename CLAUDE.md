# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Serve
- `ng serve` - Start development server (usually port 4200)
- `ng build` - Build for production
- `ng build --watch` - Build with file watching for development
- `npm run format` - Format code using Prettier

### Code Quality & Testing
- `ng test` - Run unit tests with Karma
- `ng test --watch=false --browsers=ChromeHeadless` - Run tests once in CI mode

### Angular CLI
- `ng generate component <name>` - Create new component
- `ng generate service <name>` - Create new service
- `ng generate module <name>` - Create new module

## Architecture Overview

### Project Structure
This is an Angular 19 application for "Blue Self Checkout" - a self-service checkout system built with PrimeNG. The app follows Angular standalone components architecture with a feature-based modular approach:

- **Core Module** (`src/app/core/`): Singleton services, API configuration, interceptors, and shared models
- **Layout Module** (`src/app/layout/`): Application shell components (header, sidebar, footer, menu)
- **Pages Module** (`src/app/pages/`): Feature modules organized by business domain (orders, products, devices, etc.)

### Key Architectural Patterns

**Standalone Components**: The application uses Angular 19's standalone components pattern. Most components are standalone and import their dependencies directly.

**API Service Pattern**: Centralized HTTP client in `src/app/core/services/api.service.ts` with:
- RESTful methods (GET, POST, PUT, PATCH, DELETE)
- File upload/download capabilities
- Pagination support
- Error handling and timeout configuration
- Built-in retry logic and caching configuration

**API Configuration**: Centralized in `src/app/core/config/api.config.ts`:
- Currently configured for local development: `https://localhost:7115/`
- Includes all API endpoints for different entities
- Supports pagination, filtering, and sorting parameters
- Default headers and timeout configuration

**Service-Based State Management**: Uses RxJS and Angular services for state management rather than NgRx. Each feature has its own service layer for business logic.

**Component Structure**: Feature pages are organized with dedicated components subfolders containing specialized widgets and UI components.

### Key Business Domains

The application manages several core entities through dedicated page modules:

**Dashboard** (`src/app/pages/dashboard/`): 
- Main analytics interface with widgets for stats, revenue streams, recent sales, best-selling products, and notifications
- Uses `DashboardService` to aggregate data from multiple APIs using RxJS `forkJoin`

**Orders** (`src/app/pages/orders/`): Complete order management with CRUD operations

**Products** (`src/app/pages/products/`): Product catalog management including categories and product groups

**Devices** (`src/app/pages/devices/`): Device management for POS terminals and self-checkout devices

**Customers** (`src/app/pages/customer/`): Customer management system

**Gallery** (`src/app/pages/gallery/`): Image and media management

**Authentication** (`src/app/pages/auth/`): Login and authentication flows

### Navigation & Menu System

The navigation is managed in `src/app/layout/component/app.menu.ts` with:
- Hierarchical menu structure using PrimeNG MenuItem interface
- Feature-based navigation grouping
- Dynamic routing with Angular Router
- Currently includes: Dashboard, Devices (POS/Devices), Gallery, Products (Groups/Categories/Products), Customers, Orders

### UI Framework & Styling

**PrimeNG Integration**: 
- Uses PrimeNG 19.0.8 as the primary UI component library
- PrimeIcons for iconography
- Tailwind CSS with PrimeUI for styling
- SCSS for component-specific styles

**Theming**: Uses PrimeNG's theming system with `@primeng/themes`

### Development Patterns

**TypeScript Patterns**:
- Strict typing enabled
- Interface definitions for all API models
- Generic types for API responses and pagination
- Proper error handling with typed observables

**Component Organization**:
- Feature components grouped under `pages/<feature>/components/`
- Widget components for dashboard use descriptive names ending in "widget"
- Standalone components with explicit imports

**Service Layer**:
- Feature-specific services in `pages/<feature>/services/`
- Core services in `src/app/core/services/`
- Repository pattern used for data access (e.g., `customer/repositories/`)

**Error Handling**: Comprehensive error handling in API service with fallback strategies and logging

### Notable Dependencies
- **Angular 19**: Latest Angular framework
- **PrimeNG 19.0.8**: Primary UI component library
- **Chart.js 4.4.2**: Data visualization for dashboard widgets
- **RxJS**: Reactive programming for state management
- **TailwindCSS**: Utility-first CSS framework
- **Prettier**: Code formatting
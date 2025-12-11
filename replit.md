# ST Fashions E-Commerce Platform

## Overview

ST Fashions (Sannidhi & Tanisha Fashions) is a full-stack e-commerce web application specializing in Indian fashion products including Sarees, Aari Work Blouses, Ready Made Blouses, Ladies Fancy Items, and Stationery. The platform features two distinct interfaces: a customer-facing storefront with shopping capabilities and an administrative dashboard for product and order management.

The application implements a modern, Myntra-inspired design aesthetic with vibrant brand colors (Hot Pink/Magenta primary, Gold/Yellow accents, Purple highlights) and elegant typography combining Playfair Display serif for headings with Inter sans-serif for body text.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- React Router (via Wouter) for client-side routing with separate customer and admin route hierarchies
- TanStack Query (React Query) for server state management and API data caching

**UI Component System**
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling with custom theme extension
- Custom color system using HSL CSS variables for consistent theming
- Responsive design patterns supporting mobile-first development

**State Management Strategy**
- Local storage for cart persistence and user session management
- Custom event system (`cartUpdated` events) for cross-component cart synchronization
- React Hook Form with Zod validation for form state and validation
- Query client for server-side data caching and optimistic updates

**Key Design Decisions**
- Separation of customer and admin interfaces through distinct route prefixes (`/` for customers, `/admin` for admin)
- Client-side session management using localStorage (no HTTP-only cookies)
- Event-driven cart updates to maintain consistency across components
- Image lightbox and zoom functionality for product detail pages

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for type-safe API development
- RESTful API design with resource-based endpoints (`/api/products`, `/api/orders`, `/api/customers`)
- Custom middleware for request logging and error handling
- HTTP server creation for potential WebSocket upgrade support

**Data Storage Solution**
- Google Sheets as the primary database through Google Sheets API v4
- Drizzle ORM configuration present for potential PostgreSQL migration
- Four separate sheets: Products, Orders, Customers, Admin
- Spreadsheet created on-demand with automatic schema initialization
- Row-based storage with JSON serialization for complex fields (arrays, objects)

**Rationale for Google Sheets**
The application uses Google Sheets instead of a traditional database, likely for:
- Simplified deployment without database provisioning
- Easy data inspection and manual editing through familiar spreadsheet interface
- Low operational overhead for small to medium traffic
- Built-in data backup through Google's infrastructure

**Authentication & Security**
- Bcrypt password hashing with configurable salt rounds
- Separate authentication flows for customers (phone + password) and admin (username + password)
- Session data stored client-side in localStorage
- Admin password change functionality with current password verification
- Default admin credentials system with forced password change workflow

**API Design Pattern**
- CRUD operations for products with image upload support
- Order creation and status management workflow
- Customer registration and login endpoints
- Admin authentication with separate login endpoint
- Query parameter filtering for products (by category, search term)

### External Dependencies

**Cloud Services**
- **Cloudinary**: Image hosting and CDN for product images
  - Configuration: cloud_name, api_key, api_secret from environment variables
  - Multer integration for multipart form data handling
  - Buffer-based upload from memory storage

- **Google Workspace APIs**: 
  - Google Sheets API v4 for database operations
  - Google Drive API for spreadsheet creation and file management
  - OAuth 2.0 authentication via Replit connector system
  - Dynamic token refresh with expiration checking

**Replit Integration**
- Replit Connectors for Google services authentication
- Environment-based identity tokens (REPL_IDENTITY, WEB_REPL_RENEWAL)
- Replit-specific Vite plugins for development experience:
  - Runtime error modal overlay
  - Cartographer for code navigation
  - Development banner

**Third-Party Libraries**
- **Validation**: Zod for runtime schema validation with TypeScript inference
- **File Uploads**: Multer for handling multipart/form-data
- **Cryptography**: bcrypt for secure password hashing
- **HTTP Client**: Built-in fetch API for frontend-backend communication
- **UI Components**: Extensive Radix UI primitives for accessible component patterns

**Font Resources**
- Google Fonts CDN for Playfair Display (serif) and Inter (sans-serif)
- Preconnect optimization for faster font loading

### Data Flow Architecture

**Product Management Flow**
1. Admin uploads images via multipart form to `/api/products`
2. Server uploads to Cloudinary and receives public URLs
3. Product data with image URLs stored in Google Sheets
4. Frontend queries products via TanStack Query with caching
5. Product cards rendered with optimistic UI updates

**Order Processing Flow**
1. Customer adds items to cart (localStorage)
2. Checkout form submission with customer details
3. Server creates order record with "Pending" status
4. Order ID returned for confirmation page display
5. Admin updates order status through dashboard

**Session Management Flow**
- Customer/Admin login credentials validated against Google Sheets data
- Bcrypt password comparison for authentication
- Session object (ID, name, phone/username) stored in localStorage
- Client-side session checks for protected routes
- Logout clears localStorage session data
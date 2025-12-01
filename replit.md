# МПТ Therapy Scripts Application

## Overview

This is a professional therapy script library application for Meta-Pattern Therapy (МПТ) practitioners. The application provides a comprehensive, organized collection of therapeutic scripts, practices, and session completion protocols. It features a clean, clinical interface designed for professional use during therapy sessions, with support for session timing, script history tracking, and quick access to therapeutic resources.

The application is built as a full-stack web application with a React frontend and Express backend, currently using in-memory storage for therapy content with the infrastructure ready for database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite for fast development and optimized production builds
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- Tailwind CSS for utility-first styling with custom design system
- Shadcn/ui component library (New York style) for consistent, accessible UI components

**Design System:**
- Custom color palette focused on clinical professionalism (neutral backgrounds with blue accents)
- System fonts (Segoe UI family) for reliability and readability
- Emoji-based navigation icons for visual identification
- Responsive layout with collapsible sidebar navigation
- Support for desktop (>1024px), tablet (768-1024px), and mobile (<768px)

**State Management:**
- React Query for server-side data caching and synchronization
- LocalStorage for client-side persistence of:
  - Expanded/collapsed sidebar categories
  - Session timer state
  - Script viewing history
  - Session completion progress
- React hooks for component-level state

**Key Features:**
- Session timer with pause/resume/reset functionality
- Script history tracking for quick re-access
- Collapsible category navigation
- Breadcrumb navigation
- Print-optimized script views
- Copy-to-clipboard functionality for scripts

### Backend Architecture

**Technology Stack:**
- Node.js with Express for HTTP server
- TypeScript throughout for type safety
- Drizzle ORM configured for PostgreSQL (schema defined but currently using in-memory storage)
- ESBuild for production bundling

**API Design:**
- RESTful endpoints following resource-based patterns:
  - `GET /api/categories` - List all therapy categories
  - `GET /api/categories/:id` - Get single category
  - `GET /api/scripts` - List all scripts (supports ?categoryId filter)
  - `GET /api/scripts/:id` - Get single script with full content
  - `GET /api/practices` - List implementation practices
  - `GET /api/session-completion` - Get session completion steps

**Storage Layer:**
- Interface-based storage abstraction (IStorage) for flexibility
- Current implementation: MemStorage (in-memory)
- Infrastructure ready for database implementation via Drizzle ORM
- Data models defined in shared schema with Zod validation

**Development vs Production:**
- Development: Vite dev server with HMR integrated into Express
- Production: Static file serving of pre-built client bundle
- Unified HTTP server handles both API and static assets

### Data Model

**Core Entities (defined in shared/schema.ts):**

1. **Category** - Therapy script categories
   - id, title, emoji, description, order
   - Examples: "Foundations", "Diagnostics", "Strategies", "Emotions"

2. **TherapyScript** - Individual therapy scripts
   - id, categoryId, title, description, difficulty level
   - blocks: Array of structured content blocks
   - Each block has type (heading, question, instruction, note, step, theory, practice, text, list)

3. **Practice** - Implementation practices
   - Techniques for reinforcing therapy results
   - Examples: "Quick Switch", "Analytical Switch", "Power Dance"

4. **SessionCompletionStep** - Session closure protocol
   - Steps for properly concluding therapy sessions
   - Includes summaries, homework assignments, integration checks

**Data Validation:**
- Zod schemas for runtime type validation
- TypeScript types derived from Zod schemas for compile-time safety
- Shared schema between client and server ensures consistency

### Build and Deployment

**Build Process:**
1. Client: Vite builds React app to `dist/public`
2. Server: ESBuild bundles server code to `dist/index.cjs`
3. Dependencies: Allowlist approach bundles critical dependencies, externalizes others

**Script Commands:**
- `dev`: Development mode with tsx and Vite HMR
- `build`: Production build of both client and server
- `start`: Production server from built artifacts
- `db:push`: Drizzle schema push to database (when database is configured)

**Environment Configuration:**
- Database URL expected via DATABASE_URL environment variable
- Drizzle configured for PostgreSQL dialect
- Development mode detection via NODE_ENV

## External Dependencies

### UI Component Libraries
- **Radix UI**: Headless accessible components for complex interactions (dialogs, dropdowns, accordions, etc.)
- **Shadcn/ui**: Pre-styled Radix components following New York design system
- **Lucide React**: Icon library for consistent iconography

### Data & State Management
- **TanStack Query v5**: Server state management, caching, and data synchronization
- **React Hook Form**: Form state management (with @hookform/resolvers for validation)
- **Zod**: Schema validation library used throughout for data integrity

### Database & ORM
- **Drizzle ORM**: Type-safe SQL query builder configured for PostgreSQL
- **@neondatabase/serverless**: Serverless PostgreSQL driver (infrastructure ready)
- **Drizzle Kit**: Database migration and schema management tools

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling utility
- **tailwind-merge**: Intelligent Tailwind class merging via clsx

### Utilities
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **wouter**: Lightweight routing library (alternative to React Router)

### Development Tools
- **TypeScript**: Static typing throughout the application
- **Vite**: Frontend build tool and development server
- **ESBuild**: Server-side bundler for production
- **tsx**: TypeScript execution for development server

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Code navigation (dev only)
- **@replit/vite-plugin-dev-banner**: Development environment banner

### Notable Architecture Decisions

1. **In-Memory Storage with Database-Ready Structure**: Currently uses in-memory data storage for simplicity, but the architecture (IStorage interface, Drizzle schema, database configuration) is fully prepared for PostgreSQL integration when needed.

2. **Shared Schema Pattern**: TypeScript types and Zod schemas are defined once in `shared/schema.ts` and imported by both client and server, ensuring type safety across the full stack.

3. **Component Library Choice**: Shadcn/ui was chosen over traditional component libraries because it provides copy-paste components that can be customized while maintaining accessibility through Radix UI primitives.

4. **Lightweight Routing**: Wouter was chosen over React Router for its minimal bundle size and simpler API, appropriate for the application's straightforward routing needs.

5. **LocalStorage for User Preferences**: Session state, navigation preferences, and history are stored client-side to provide instant access and reduce server load, with graceful fallbacks for storage failures.
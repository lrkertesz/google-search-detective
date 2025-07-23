# Keyword Research Tool

## Overview

This is a full-stack web application built for keyword research in service industries like HVAC, plumbing, electrical, and digital marketing. The application generates keyword research reports with metrics like search volume, CPC, competition scores, and business-focused opportunity rankings for specified cities and industries. The opportunity scoring prioritizes cost-effectiveness (low CPC) combined with viable search volume for practical PPC campaign planning.

## User Preferences

Preferred communication style: Simple, everyday language.
PPC Campaign Experience: User has discovered through testing that $0.00 CPC keywords often don't perform as expected in Google Ads due to Google's "similar keyword" matching showing higher-bid competing ads instead of exact matches.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and build processes
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Admin Panel**: Dedicated admin page for managing industries, keywords, and API configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with admin endpoints
- **Data Storage**: PostgreSQL database with persistent storage for all data
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Built-in Express session handling
- **API Integration**: Keywords Everywhere API with fallback to mock data

### Key Components

#### Database Schema
- **Users Table**: Basic user authentication with username/password
- **Keyword Researches Table**: Stores research results with industry, cities, and keyword data as JSON
- **Shared Types**: Common TypeScript interfaces between client and server

#### API Endpoints
- `GET /api/industries/:industry/keywords` - Retrieve industry-specific keyword lists
- `POST /api/keyword-research` - Start new keyword research
- `GET /api/keyword-research` - Retrieve research history
- `GET /api/keyword-research/:id` - Get specific research results

#### Frontend Features
- Industry selection (HVAC, Plumbing, Electrical, Digital Marketing)
- Multi-city keyword research
- Real-time progress tracking during research
- CSV export functionality
- Research history with detailed results viewing
- Responsive design with mobile support

### Data Flow

1. **Research Initiation**: User selects industry and enters cities
2. **Keyword Generation**: Server generates industry-specific keywords for each city
3. **Data Processing**: Simulated keyword metrics (search volume, CPC, competition)
4. **Result Storage**: Research saved to database with structured results
5. **Export Options**: Users can export results to CSV format

### External Dependencies

#### Frontend Libraries
- **UI Components**: Comprehensive Radix UI component library
- **Utilities**: clsx, tailwind-merge for className management
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation
- **Carousel**: Embla Carousel for image/content sliders

#### Backend Libraries
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **Schema Validation**: Zod for runtime type checking
- **Session Storage**: connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution in development

### Deployment Strategy

#### Development Setup
- **Development Server**: Vite dev server with HMR for frontend
- **Backend Server**: tsx with nodemon-like functionality for TypeScript execution
- **Database**: Drizzle Kit for schema management and migrations
- **Environment**: Environment variables for database configuration

#### Production Build
- **Frontend**: Vite production build with optimized bundles
- **Backend**: esbuild for server-side bundling
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Node.js server serving static files and API routes

#### Configuration Notes
- Database URL required via environment variables
- Drizzle configured for PostgreSQL dialect
- Migrations stored in `./migrations` directory
- Shared schema definitions in `./shared/schema.ts`

The application follows a monorepo structure with clear separation between client, server, and shared code, making it maintainable and scalable for future enhancements.
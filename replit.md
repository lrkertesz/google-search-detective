# Google Search Detective

## Overview

This is a full-stack keyword research application that serves as one component of a comprehensive business intelligence suite for service industries. The application generates geo-targeted keyword research reports with real-time metrics including search volume, CPC, competition scores, and business-focused opportunity rankings for HVAC, plumbing, electrical, and digital marketing industries.

**ACCURACY BREAKTHROUGH (August 2025):** Resolved critical underreporting issue identified through manual validation testing. Enhanced keyword generation algorithm with natural language variations (case sensitivity, equipment terminology) now captures 86% more keywords with volume (65 vs 35). GSD algorithm now matches manual Perplexity + Keywords Everywhere approach effectiveness, finding high-value keywords like "HVAC repair Palm Springs" (390 searches) that were previously missed due to oversimplified keyword combination logic.

The opportunity scoring prioritizes cost-effectiveness (non-zero CPC values) combined with viable search volume for practical PPC campaign planning, accounting for Google's broad matching behavior that can override low-cost keywords with higher-bid alternatives.

**Business Intelligence Suite Integration (August 2025):**
Successfully integrated as the keyword research component within a comprehensive 4-app Business Intelligence System (BIS) using the "Orchestra Conductor" pattern. BIS serves as the central orchestrator, making API calls to specialized expert apps:

1. **Google Search Detective (GSD)** - Geo-targeted keyword research with Keywords Everywhere API
2. **Market Revenue Estimator** - TAM calculations by industry for specific cities  
3. **Competition Analyzer** - Business rankings for geo-targeted phrases in Maps 3-Pack and SEO
4. **BIS Central Hub** - Consolidates intelligence from all three apps into comprehensive reports

**API Integration Workflow:**
- BIS → GSD `/api/bis-integration` → GSD `/api/keyword-research` → Keywords Everywhere API
- GSD handles all keyword generation, API authentication, and data processing
- BIS receives standardized formatted results for report generation
- Maintains separation of concerns: GSD remains the keyword research expert, BIS consumes that expertise

**Integration Status:** ✅ Live and ready for testing with proper authentication and error handling

**DELETE Functionality Fixed (August 2025):**
Resolved critical issue where research deletion was failing due to missing CRUD routes in routes-fixed.ts. The frontend was receiving HTML responses instead of JSON when attempting deletions. Fixed by:
- Added missing GET, PUT, DELETE routes to routes-fixed.ts for keyword research management
- Implemented optimistic updates in frontend for immediate visual feedback
- Confirmed all API endpoints now return proper JSON responses with 200 status codes
- Research history management now functions correctly with instant deletion feedback

**TAM Calculator Integration (Added January 2025):**
The application now includes a sophisticated Total Addressable Market calculator specifically for HVAC industry searches. This feature transforms raw keyword data into actionable business intelligence by calculating realistic revenue opportunities available through PPC advertising campaigns. The TAM methodology accounts for the 30% of HVAC customers who have annual maintenance contracts and won't search Google for emergency services.

**TAM Methodology Refinement (August 2025):**
Updated TAM calculation to achieve proper 30% reduction from total market estimates, using conservative service breakdown: 15% system replacements, 35% refrigerant issues, 20% compressor/fan repairs. Enhanced educational content explains "addressable market" concept and positions the natural progression to PPC strategy and competitive analysis tools.

**Keyword Research Strategy Enhancement (January 2025):**
Enhanced keyword generation to capture both geo-targeted and general industry terms. Research now includes base keywords without city modifiers to capture broad industry search volume (like "thermal air conditioning" with 480 searches), alongside traditional geo-targeted combinations. This dual approach maximizes data capture from Keywords Everywhere API and provides comprehensive market coverage.

**HVAC Keyword List Expansion (January 2025):**
Added 14 high-value keyword phrases to HVAC industry list based on bulk Keywords Everywhere analysis and market research. Key additions include "thermal air conditioning" (480 search volume), "commercial hvac", "hvac financing", and other specialized terms that target specific technology segments and customer needs not covered by the original 85 keywords.

## User Preferences

**CRITICAL REQUIREMENTS:**
- **ABSOLUTELY NO MOCK DATA**: System must never use mock, placeholder, seed, or fallback data under any circumstances. All data must come from authentic API sources only.
- **DATA INTEGRITY**: Every piece of information displayed must be from real external APIs. No simulated or generated data.

Preferred communication style: Simple, everyday language.
PPC Campaign Experience: User has discovered through testing that $0.00 CPC keywords often don't perform as expected in Google Ads due to Google's "similar keyword" matching showing higher-bid competing ads instead of exact matches.
Business Context: User is building a comprehensive business intelligence suite with three interconnected tools for market analysis in service industries.

### Business Model & Strategy
- User is the sole operator using these tools to create market research reports for service business owners
- Report creation workflow: SnagIt screen captures → Word documents → PDF exports (due to better formatting than direct PDF generation)
- Two-website strategy:
  - NextWave-Research.com: Research-focused, less sales-oriented positioning
  - NextWaveDigitalMarketing.com: Agency site (more sales-focused)
- Monetization approach: Tiered offerings from free teasers to premium reports ($49-499 range)
- Value proposition: Providing Fortune 500-level market intelligence tools to small service businesses

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
- **Research Management**: Inline editing for research titles with auto-save functionality

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
- **Keyword Researches Table**: Stores research results with customizable titles, industry, cities, and keyword data as JSON
- **Industries Table**: Configurable industry definitions with keyword lists
- **Settings Table**: API configuration and system settings
- **Shared Types**: Common TypeScript interfaces between client and server

#### API Endpoints
- `GET /api/industries/:industry/keywords` - Retrieve industry-specific keyword lists
- `POST /api/keyword-research` - Start new keyword research
- `GET /api/keyword-research` - Retrieve research history
- `GET /api/keyword-research/:id` - Get specific research results
- `PUT /api/keyword-research/:id` - Update research title for better organization
- `DELETE /api/keyword-research/:id` - Delete research records

#### Frontend Features
- Industry selection (HVAC, Plumbing, Electrical, Digital Marketing)
- Multi-city keyword research with dual keyword variations (city-first and keyword-first)
- Real-time progress tracking during research
- Separated results sections: PPC Keywords (with volume) and SEO Content Targets (zero volume)
- Multiple CSV export options: PPC Keywords, SEO Targets, and All Keywords
- Research history with detailed results viewing and inline title editing
- Responsive design with mobile support

### Data Flow

1. **Research Initiation**: User selects industry and enters cities
2. **Keyword Generation**: Server generates both "keyword city" and "city keyword" variations for comprehensive coverage
3. **API Integration**: Real keyword data retrieved from Keywords Everywhere API (no mock data)
4. **Results Processing**: Keywords separated into PPC opportunities (with volume) and SEO targets (zero volume)
5. **Result Storage**: Research saved to database with customizable titles for organization
6. **Export Options**: Single-click "Download All Reports" plus individual CSV export formats for comprehensive data delivery

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
# Google Search Detective - Development Principles & Working Agreements

## Core Data Integrity Principles

### Critical Requirements
- **ABSOLUTELY NO MOCK DATA**: System must never use mock, placeholder, seed, or fallback data under any circumstances
- **DATA INTEGRITY**: Every piece of information displayed must be from real external APIs only
- **API-First Approach**: All data must come from authentic API sources (Keywords Everywhere API)
- **Error Handling**: Display explicit error messages when data cannot be retrieved from authentic sources

### PPC Campaign Intelligence
- $0.00 CPC keywords often don't perform as expected in Google Ads due to Google's "similar keyword" matching
- Opportunity scoring prioritizes cost-effectiveness (non-zero CPC values) combined with viable search volume
- Account for Google's broad matching behavior that can override low-cost keywords with higher-bid alternatives

## Business Context & Strategy

### User Profile
- **Sole Operator**: Building comprehensive business intelligence suite for service industry market analysis
- **Target Market**: Service business owners (HVAC, plumbing, electrical, digital marketing)
- **Value Proposition**: Fortune 500-level market intelligence tools for small service businesses

### Business Model
- **Report Creation Workflow**: SnagIt screen captures → Word documents → PDF exports
- **Two-Website Strategy**:
  - NextWave-Research.com: Research-focused, less sales-oriented
  - NextWaveDigitalMarketing.com: Agency site (more sales-focused)
- **Monetization**: Tiered offerings from free teasers to premium reports ($49-499 range)

### Strategic Positioning
- Educational approach that builds credibility and positions consulting expertise
- Natural progression from data delivery to full digital marketing consulting services
- TAM methodology creates bridge to PPC opportunities and competitive analysis tools

## Technical Architecture Standards

### Frontend Principles
- **Framework**: React 18 with TypeScript (no vanilla JavaScript)
- **UI Standards**: shadcn/ui components on Radix UI primitives
- **Styling**: Tailwind CSS with consistent design system
- **State Management**: TanStack Query for all server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Responsive Design**: Mobile-first approach with desktop enhancements

### Backend Principles
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules (no JavaScript)
- **API Pattern**: RESTful design with clear endpoint structure
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: PostgreSQL-backed sessions (never memory store)
- **Error Handling**: Comprehensive logging and user-friendly error messages

### Code Quality Standards
- **Type Safety**: Full TypeScript coverage, no `any` types
- **Schema Validation**: Zod for runtime validation
- **Shared Types**: Common interfaces between client and server in `shared/schema.ts`
- **API Integration**: Keywords Everywhere API only (no fallback data)

## User Experience Principles

### Educational First Approach
- **Content Strategy**: Explain concepts before showing data
- **Video Integration**: Professional Vimeo embeds for complex explanations
- **Visual Hierarchy**: Clear section separators between education and data
- **Strategic Flow**: Learn → See Data → Understand Implementation → Consider Services

### Data Presentation Standards
- **TAM Section**: Education + video → data visualization → strategic insights
- **Keyword Section**: Strategy explanation + video → actionable targeting data
- **Export Options**: Multiple formats (PPC, SEO, Complete) for different use cases
- **Research History**: Inline editing with auto-save for organization

### Communication Style
- **Simple Language**: Everyday language, avoid technical jargon
- **Non-Technical User Focus**: Business owners without coding knowledge
- **Educational Tone**: Build understanding rather than overwhelm with data
- **Strategic Bridge**: Connect data insights to business growth opportunities

## Development Workflow Standards

### Data Flow Requirements
1. **Research Initiation**: Industry selection + city input
2. **Keyword Generation**: Dual variations (city-first + keyword-first)
3. **API Integration**: Real-time Keywords Everywhere data retrieval
4. **Results Processing**: Separate PPC opportunities from SEO targets
5. **Storage**: PostgreSQL with customizable research titles
6. **Export**: Comprehensive reporting in multiple formats

### Quality Assurance
- **Real Data Testing**: All features tested with authentic API responses
- **Error State Handling**: Graceful failures with actionable user guidance
- **Performance**: Optimized video sizing and responsive design
- **Accessibility**: Proper iframe attributes and screen reader support

### Debugging Standards
- **No Speculation**: Do not "speculate" about the cause of a problem. Refer to the debugging system for identification of the problem's cause
- **Robust Debugging Required**: If a robust debugging system is not present, install one immediately
- **Evidence-Based Diagnosis**: Use server logs, browser console, network traces, and error messages to identify root causes
- **Systematic Problem Solving**: Follow debugging output rather than assumptions about potential issues

### Feature Integration
- **TAM Calculator**: HVAC-specific revenue calculations with 30% market reduction
- **Keyword Research**: Geo-targeted with search volume and CPC data
- **Competition Analysis**: Future integration for complete market intelligence
- **Admin Panel**: Industry and keyword management capabilities

## Content & Messaging Standards

### TAM Education
- Explain "addressable market" concept clearly
- Address annual inspection contract impact
- Position digital marketing opportunity naturally
- Create educational bridge to implementation needs

### PPC Strategy Content
- Address technical complexity concerns
- Explain data value and business application
- Soft introduction to done-for-you services
- Maintain educational tone while building trust

### Strategic Positioning
- Build authority through data quality
- Educational content that naturally leads to consulting
- Professional presentation without overwhelming users
- Clear progression from intelligence to implementation services

## Technology Constraints & Preferences

### Required Libraries
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: Express, TypeScript, Drizzle ORM, PostgreSQL
- **External**: Keywords Everywhere API, Vimeo for video hosting

### Deployment Standards
- **Database**: PostgreSQL with persistent storage
- **Environment**: Environment variables for API configuration
- **Migrations**: Drizzle Kit for schema management
- **Build**: Vite for frontend, esbuild for backend optimization

### Documentation Maintenance
- **replit.md**: Primary source of truth for project context
- **Architecture Changes**: Document with dates and rationale
- **User Preferences**: Update immediately when expressed
- **Feature Progress**: Track completion and next steps

---

*Last Updated: August 2025*
*Version: 1.0*
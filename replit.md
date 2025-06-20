# Terrin - Construction Project Management Platform

## Overview

Terrin is a modern full-stack web application built to connect homeowners with trusted construction professionals. The platform allows users to post construction projects, get AI-powered cost estimates, and match with verified contractors. Built with React, Express, PostgreSQL, and integrated with OpenAI for intelligent cost estimation.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and brand colors
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL store
- **API Integration**: OpenAI API for cost estimation

### Database Design
- **Database**: Firebase Firestore (NoSQL document database)
- **Collections**:
  - `users` - User profiles with role assignments (homeowner/contractor/both/visitor)
  - `projects` - Construction project details posted by homeowners
  - `contractors` - Verified contractor profiles with photos and business info
- **Storage**: Firebase Storage for contractor profile photos and project images

## Key Components

### Authentication System
- **Provider**: Firebase Authentication with email/password and Google OAuth
- **User Management**: Firestore-based user profiles with role-based access
- **Role System**: Homeowner, Contractor, Both, or Visitor roles stored in Firestore
- **Profile Photos**: Firebase Storage for contractor profile image uploads

### AI-Powered Cost Estimation
- **Engine**: OpenAI GPT-4o-mini for cost-effective intelligent cost analysis
- **Input Processing**: Structured project data with validation
- **Output Format**: Detailed cost breakdown including materials, labor, permits, and contingency
- **Regional Pricing**: Location-aware estimates with regional cost multipliers
- **Project-Specific Analysis**: Accurate estimates based on project type and scope
- **Error Handling**: Enhanced validation without fallback defaults

### Project Management
- **CRUD Operations**: Full project lifecycle management
- **Validation**: Zod schemas for type-safe data handling
- **Status Tracking**: Project status management and updates
- **User Association**: Projects linked to authenticated users

### Contractor Matching
- **Discovery**: Contractor search by specialty and location
- **Profiles**: Detailed contractor information with ratings
- **Contact System**: Secure contractor-client communication

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Project Creation**: Users submit project details through validated forms
3. **AI Estimation**: Project data sent to OpenAI API for cost analysis
4. **Contractor Matching**: System matches projects with suitable contractors
5. **Real-time Updates**: TanStack Query provides real-time data synchronization

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless** - Serverless PostgreSQL connection
- **@tanstack/react-query** - Server state management
- **drizzle-orm** - Type-safe database operations
- **openai** - AI-powered cost estimation
- **express-session** - Session management
- **passport** - Authentication middleware

### UI Dependencies
- **@radix-ui/react-*** - Accessible UI primitives
- **tailwindcss** - Utility-first CSS framework
- **react-hook-form** - Form handling and validation
- **zod** - Runtime type validation

## Deployment Strategy

### Development Environment
- **Platform**: Replit with auto-reload and hot module replacement
- **Database**: Neon PostgreSQL with connection pooling
- **Build Process**: Vite dev server with Express backend
- **Port Configuration**: Frontend (5000) with backend API routes

### Production Build
- **Frontend**: Vite build with optimized bundles
- **Backend**: esbuild for Node.js bundle optimization
- **Deployment**: Replit autoscale deployment
- **Environment**: NODE_ENV=production with optimized settings

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API authentication
- `SESSION_SECRET` - Session encryption key
- `REPLIT_DOMAINS` - Allowed domains for OIDC
- `ISSUER_URL` - OpenID Connect issuer URL

## Changelog

```
Changelog:
- June 17, 2025. Initial setup
- June 17, 2025. Firebase role switching implemented and working
  * Fixed Firebase Firestore connection issues
  * Implemented user role management with setDoc instead of updateDoc
  * Users can now successfully change roles between visitor, homeowner, contractor, and both
  * Enhanced error handling for Firebase operations
- June 18, 2025. Enhanced Project Management & Real-time Messaging System
  * Added comprehensive project timeline tracking with status changes, progress updates, and milestone management
  * Implemented real-time messaging system for contractor-homeowner communication
  * Enhanced database schema with project updates, conversations, and messages tables
  * Created interactive dashboard with tabbed interface (Timeline, Messages, Overview)
  * Added project status management (planning, active, in_progress, completed, cancelled)
  * Implemented priority levels and completion percentage tracking
  * Built messaging interface with conversation management and message threading
  * Added project update history and automated status change logging
- June 18, 2025. Functional Landing Page Navigation & Inclusive Professional Requirements
  * Created comprehensive "How it Works" page with AI estimate demo and platform benefits
  * Built "Find Contractors" page with sample contractor profiles and verification process
  * Developed "For Professionals" page with inclusive requirements for all contractor sizes
  * Updated header navigation to link to functional preview pages instead of anchors
  * Made contractor requirements welcoming to freelancers and small businesses
  * Added mentorship program support for new professionals entering the industry
  * Fixed projects page 404 error with full project management functionality
- June 18, 2025. Comprehensive Project Management with Cost Tracking & Timeline Features
  * Fixed critical project posting bug - PostProjectFirebase was saving to Firestore instead of PostgreSQL
  * Implemented comprehensive cost tracking with categories (materials, labor, permits, equipment)
  * Added project milestone management with status tracking and completion dates
  * Built photo upload system with categorization (before, progress, after, materials, issues)
  * Created enhanced project management interface with tabbed navigation (Overview, Costs, Timeline, Photos, Documents)
  * Added real-time cost summaries and progress tracking with completion percentages
  * Implemented project filtering and enhanced project cards with "Manage" button navigation
  * Enhanced database schema with projectCosts, projectMilestones, and projectPhotos tables
  * Added comprehensive API endpoints for cost tracking, milestone management, and photo uploads
- June 18, 2025. Database Connection & Milestone Management Fixes
  * Fixed critical database connection issues with improved Neon configuration and connection pooling
  * Resolved timestamp handling bugs in cost tracking and milestone API endpoints
  * Added complete milestone management functionality (create, toggle completion, delete)
  * Fixed date conversion issues where strings weren't properly converted to Date objects
  * Application now runs reliably with full CRUD operations for costs and milestones
- June 18, 2025. Advanced Progress Tracking & Photo Management
  * Implemented weighted milestone progress tracking with construction-specific presets
  * Added automatic project completion percentage calculation based on milestone weights
  * Created 15 realistic construction phase presets (Foundation 15%, Framing 20%, etc.)
  * Enhanced milestone interface with progress weight badges and visual feedback
  * Added comprehensive photo deletion functionality with backend API and frontend interface
  * Progress bar now accurately reflects real construction phase completion
- June 19, 2025. UI/UX Button Visibility Fixes
  * Fixed "Browse Contractors" button text visibility issues on How It Works and Find Contractors pages
  * Resolved white-on-white text problem by adding proper hover state color definitions
  * Enhanced button accessibility across all landing page components
  * Improved user experience with consistent button styling and visibility
- June 19, 2025. Inclusive Professional Platform Language
  * Removed exclusive "pre-screened" and "verified" language throughout the platform
  * Updated all pages to welcome contractors, freelancers, and specialists of all sizes
  * Changed "Find Verified Contractors" to "Find Construction Professionals"
  * Replaced verification process with user choice and profile browsing features
  * Made platform messaging inclusive of solo experts and established companies
  * Updated professional onboarding to focus on profile creation rather than verification requirements
- June 19, 2025. Complete Navigation & Missing Pages Implementation
  * Built comprehensive messaging system with real-time conversations and message threading
  * Created detailed contractor profile pages with portfolios, reviews, and quote request functionality
  * Added public gallery page for browsing construction project photos across all users
  * Fixed all broken navigation buttons - "View Profile", "Get Quote", "Browse Contractors" now work properly
  * Added Messages link to authenticated navigation header for easy access
  * Updated footer links to point to actual functional pages instead of anchor fragments
  * Implemented backend API routes for conversations, messages, contractor profiles, and quote requests
  * All major user flows now have complete end-to-end functionality from landing page through project completion
- June 19, 2025. Comprehensive Inclusive Professional Terminology Implementation
  * Updated all user-facing terminology from "contractor" to "professional" throughout the platform
  * Changed navigation menu text: "Find Contractors" → "Find Professionals", "Contractor Portal" → "Professional Portal"
  * Updated landing page statistics: "Verified Contractors" → "Construction Professionals"
  * Modified error messages and UI text to use inclusive professional language
  * Maintained database table structure as "contractors" while updating all user-facing terminology
  * Fixed routing and component reference issues caused by global terminology changes
  * Platform now welcomes all types of construction professionals: contractors, freelancers, specialists, and independent experts
- June 19, 2025. Custom Budget Input Implementation for Project Creation
  * Added custom budget range functionality to both project creation forms (PostProjectFirebase.jsx and post-project.tsx)
  * Enhanced budget options with additional ranges: $100,000 - $250,000 and Over $250,000
  * Implemented "Type Custom Budget..." option with dynamic text input field
  * Users can now enter any custom budget range (e.g., "$85,000 - $120,000" or "Budget flexible")
  * Added custom budget category input to cost tracking system within project management
  * Expanded cost tracking categories: materials, labor, permits, equipment, utilities, inspection, transportation, tools
  * Both project creation and cost tracking now support unlimited custom categories and budget ranges
- June 19, 2025. AI Estimate Title Generation & Project Creation Streamlining
  * Removed AI estimate functionality from project creation forms to streamline the interface
  * Updated AI estimate title generation to use project descriptions instead of "Other - City, State"
  * Enhanced estimate titles to show meaningful descriptions like "Bedroom renovation from 900 square..."
  * Fixed frontend display of estimate titles on both home page and estimates page
  * Simplified project creation to focus on single "Post Project" button workflow
- June 19, 2025. Comprehensive Cost Tracking with Receipt Attachments & Real-time Progress Updates
  * Enhanced project header to display both budget range and actual costs side-by-side
  * Added receipt photo attachment functionality to cost entry system
  * Users can now upload receipt photos for each expense with base64 storage
  * Cost list displays receipt thumbnails with click-to-expand functionality
  * Implemented milestone inline editing with save/cancel functionality for title, description, and progress weight
  * Fixed progress bar to automatically refresh when milestones are toggled or edited without page reload
  * Added real-time calculation of completion percentage based on weighted milestone completion
  * Enhanced cost tracking interface with receipt indicators and visual receipt management
- June 19, 2025. Cache Invalidation Fixes & Professional Portal Implementation
  * Fixed cache invalidation issues preventing automatic UI refreshes after estimate generation and document uploads
  * Added custom event dispatch in EstimateForm component with proper queryClient.invalidateQueries
  * Enhanced document upload and deletion mutations with comprehensive cache invalidation
  * Created comprehensive Professional Portal (/professional-portal) with profile management, project discovery, and analytics
  * Built Find Professionals page (/find-professionals) with search filters, specialty filtering, and professional contact system
  * Updated header navigation to properly link to new Professional Portal and Find Professionals pages
  * Fixed routing issues and ensured all navigation buttons lead to functional pages
  * Both estimate generation and document operations now refresh UI automatically without manual page refreshes
- June 19, 2025. Professional Profile Database & Navigation Fixes
  * Fixed "Browse Professionals" button on home page - changed from broken /contractors route to /find-professionals
  * Resolved Select component runtime error by changing empty string value to "all" for specialty filter
  * Created comprehensive Terrin Construction Solutions profile for Juan Lara-Trejo as platform owner/developer
  * Added 10 realistic contractor profiles across multiple specialties (Kitchen/Bath, Roofing, Electrical, Plumbing, etc.)
  * Platform now has complete professional directory with verified contractors and ratings
  * All navigation from home page to Find Professionals page works without errors
- June 19, 2025. Platform Owner Profile Editing Permissions & Contractor Profile Display Fixes
  * Fixed contractor profile display issues by updating field mappings to match actual database schema
  * Removed references to non-existent database fields (phone, email, website, profilePhoto) from ContractorProfile component
  * Added proper null safety checks and type conversion for rating display and loading states
  * Implemented role-based editing permissions for Terrin Construction Solutions profile
  * Only platform owner (user ID: IE5CjY6AxYZAHjfFB6OLLCnn5dF2) can edit the Terrin profile in Professional Portal
  * Non-platform owners see "Platform Owner Profile" badge instead of edit button for Terrin profile
  * Added access control validation to prevent unauthorized editing attempts
- June 19, 2025. Professional Portal Save Functionality & Messaging System Fixes
  * Added missing PATCH endpoint for contractor profile updates in backend API
  * Fixed data mapping between form specialties array and database specialty string field
  * Added proper access control for platform owner and profile owner permissions
  * Fixed messaging system authentication by adding Firebase tokens to all API calls
  * Corrected API endpoint mapping to use proper conversation-based message routes
  * Added sample conversations and messages for testing functionality
  * Fixed landing page routing logic to properly handle authentication states for first-time vs returning users
- June 20, 2025. Footer Updates & Gallery Preparation
  * Updated copyright date from 2024 to 2025 in footer
  * Fixed all footer navigation links to point to functional pages
  * Prepared gallery infrastructure for future photo uploads by users
  * Gallery currently displays empty state with proper messaging and UI structure
  * All footer links now connect correctly: Post Project, Get Estimates, Find Professionals, Project Gallery
  * Professional links updated: Join Terrin, Find Jobs (via Find Professionals), Build Profile (Professional Portal)
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
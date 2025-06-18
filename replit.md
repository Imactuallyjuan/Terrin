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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
# Terrin - Construction Project Management Platform

## Overview

Terrin is a full-stack web application connecting homeowners with construction professionals. It enables users to post projects, receive AI-powered cost estimates, and match with verified contractors. The platform aims to streamline construction project initiation and management, facilitating efficient connections and transparent dealings between parties.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Components**: Shadcn/ui built on Radix UI
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database ORM**: Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **API Integration**: OpenAI API

### Database Design
- **Database**: PostgreSQL (for core data) and Firebase Firestore (for user profiles, projects, contractors).
- **Collections**: `users` (with roles: homeowner/contractor/both/visitor), `projects`, `contractors`.
- **Storage**: Firebase Storage for contractor profile photos and project images.

### Key Features
- **Authentication System**: Firebase Authentication with email/password and Google OAuth; Firestore-based user profiles with role-based access.
- **AI-Powered Cost Estimation**: Uses OpenAI GPT-4o-mini for detailed cost breakdowns including materials, labor, permits, and contingency, with location-aware estimates.
- **AI Scope Generator**: Generates comprehensive project scopes from descriptions, with detailed task breakdowns and requirements.
- **AI Change Order Generator**: Creates formal change orders comparing original scope to requested changes with cost impact analysis.
- **Project Management**: Full CRUD operations for projects, including status tracking, cost tracking (with receipt attachments), milestone management, and photo uploads.
- **Contractor Matching**: Allows search by specialty and location, detailed contractor profiles, and secure communication.
- **Messaging System**: Real-time messaging with conversation management, including payment integration. Polling optimized to 10 seconds for production.
- **Payment System**: Integrated Stripe Connect Express for direct contractor payouts, supporting deposits, milestones, and custom amounts with a platform fee.
- **Professional Portal**: Comprehensive portal for professionals to manage profiles, discover projects, and track earnings.
- **Photo Gallery**: Dedicated gallery for project photos with editing and deletion capabilities.
- **Tutorial Page**: Step-by-step guides for both homeowners and professionals.

### System Design Choices
- **UI/UX**: Emphasis on accessible UI components, consistent styling with Tailwind CSS, and intuitive workflows.
- **Scalability**: Designed for multi-user production with proper user data segregation and optimized database interactions.
- **Security**: Robust authentication with user data isolation via user-scoped queries and token verification.
- **Real-time Capabilities**: Utilizes WebSockets for real-time messaging and TanStack Query for data synchronization.
- **Inclusive Language**: Adopted "professional" terminology throughout the platform to include various types of construction experts.

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection.
- **@tanstack/react-query**: Server state management.
- **drizzle-orm**: Type-safe database operations.
- **openai**: AI-powered cost estimation.
- **express-session**: Session management.
- **passport**: Authentication middleware.
- **Stripe**: Payment processing and marketplace functionality.
- **Firebase**: Authentication, Firestore (database), and Storage.

### UI Dependencies
- **@radix-ui/react-***: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **react-hook-form**: Form handling and validation.
- **zod**: Runtime type validation.
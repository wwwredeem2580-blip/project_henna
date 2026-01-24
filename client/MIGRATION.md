# Migration Guide

This document outlines the migration process for the Zenvy frontend client.

## Overview

The Zenvy frontend has been restructured to follow a modern, scalable architecture with clear separation of concerns.

## Key Changes

### 1. Route Organization
- Implemented route groups for better organization
- Moved from pages router to app router
- Added dynamic routes for events, orders, etc.

### 2. Component Structure
- Organized components by feature rather than type
- Created dedicated directories for admin, host, auth components
- Added shared components for cross-feature usage

### 3. API Integration
- Centralized API client in `lib/api/`
- Added proper error handling and validation
- Implemented React Query for state management

### 4. Styling
- Updated to use CSS variables for theming
- Added Tailwind configuration with custom design tokens
- Implemented consistent color palette

## Migration Steps

1. Update imports to use new paths
2. Move components to appropriate directories
3. Update API calls to use new client
4. Update styling to use new design tokens

## Breaking Changes

- Component import paths have changed
- API client interface has been updated
- Some utility functions have been moved

## Support

For questions about the migration, please refer to the README or contact the development team.

# Astro Portfolio Project - Copilot Instructions

## Project Overview

This is a modern portfolio website built with Astro and Tailwind CSS, using Notion as a headless CMS. The project follows a component-based architecture with a focus on performance, accessibility, and responsive design.

## Key Technologies & Libraries

- **Astro**: Core framework for building the site
- **Tailwind CSS**: For styling
- **Notion API**: Used as a headless CMS
- **TypeScript**: For type safety
- **Lucide Icons**: For UI icons

## Project Structure

- `src/components/`: Reusable UI components
  - `sidebar/`: Sidebar components for navigation
- `src/layouts/`: Page layout templates
- `src/lib/`: Utility functions and services
  - `services/`: API integration (Notion)
  - `types/`: TypeScript type definitions
  - `utils/`: Helper functions for UI, theming, etc.
- `src/pages/`: Astro page components (file-based routing)
- `src/styles/`: Global CSS styles

## Coding Patterns & Preferences

### Component Structure

- Astro components (.astro) are used for UI elements
- TypeScript (.ts) files for utilities and services

### Theme System

- Custom CSS variables for theming (light/dark/system modes)
- Theme toggle functionality in `src/lib/utils/theme.ts`
- Color variables follow this pattern:
  ```css
  --text-color: #1a202c;
  --bg-color: #fff;
  ```

### Notion Integration

- Notion API client in `src/lib/services/notion.ts`
- Type definitions in `src/lib/types/notion.ts`
- Products are fetched from a Notion database

### Responsive Design

- Mobile-first approach with Tailwind breakpoints
- Responsive sidebar that collapses on mobile
- Utility functions in `src/lib/utils/responsive.ts`

### CSS Conventions

- CSS variables for theming
- Tailwind utility classes for layout and styling
- BEM-like naming when custom CSS is needed

## Best Practices to Follow

1. Use TypeScript types for all function parameters and return values
2. Prefer component composition over complex single components
3. Keep business logic separate from UI components
4. Maintain accessibility standards (ARIA attributes, semantic HTML)
5. Follow the established theming system using CSS variables
6. Add JSDoc comments for complex functions
7. Use Astro's built-in features (like client directives) appropriately

## Environment Variables

- `PUBLIC_NOTION_TOKEN`: Notion API token
- `PUBLIC_NOTION_DATABASE_ID`: Notion database ID for products

## Common Tasks

- **Adding a new page**: Create a new .astro file in src/pages/
- **Creating components**: Add .astro files to src/components/
- **Styling**: Use Tailwind classes and CSS variables defined in global.css
- **Data fetching**: Use the Notion service for content management

## Additional Notes

- The sidebar has both mobile and desktop views with different behaviors
- Theme preferences are stored in localStorage
- The project uses a responsive layout with different behaviors based on viewport size

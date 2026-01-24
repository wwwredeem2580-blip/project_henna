# Zenvy - Frontend Client

A modern, scalable Next.js frontend built with TypeScript, Tailwind CSS, and industry-standard architecture.

## 🏗️ Architecture Overview

### Complete Folder Structure

```
client/
├── src/
│   ├── app/                                    # Next.js 13+ App Router
│   │   ├── (auth)/                             # Authentication Route Group
│   │   │   ├── auth/
│   │   │   │   └── callback/
│   │   │   └── page.tsx
│   │   │
│   │   ├── (dashboard)/                        # Dashboard Route Group
│   │   │   ├── admin/
│   │   │   │   ├── events/
│   │   │   │   │   └── [id]/
│   │   │   │   ├── payouts/
│   │   │   │   │   └── [id]/
│   │   │   │   └── support/
│   │   │   ├── host-analytics/
│   │   │   ├── host-dashboard/
│   │   │   ├── host-events/
│   │   │   │   └── [id]/
│   │   │   │       ├── manage/
│   │   │   │       └── update/
│   │   │   ├── host-orders/
│   │   │   └── host-settings/
│   │   │
│   │   ├── (events)/                           # Events Route Group
│   │   │   ├── create-event/
│   │   │   ├── events/
│   │   │   │   └── [id]/
│   │   │   └── page.tsx
│   │   │
│   │   ├── checkout/
│   │   │   └── [orderId]/
│   │   ├── host/
│   │   │   └── [hostId]/
│   │   ├── landing/
│   │   ├── my-events/
│   │   ├── verify-email/
│   │   ├── wallet/
│   │   │
│   │   ├── api/                                # API Routes
│   │   │   ├── [...proxy]/
│   │   │   └── generate-pdf/
│   │   │
│   │   ├── layout.tsx                          # Root Layout
│   │   ├── page.tsx                            # Home Page
│   │   ├── globals.css                         # Global Styles
│   │   ├── providers.tsx                       # App Providers
│   │   └── next-env.d.ts
│   │
│   ├── components/                             # Reusable Components
│   │   ├── admin/                              # Admin-specific components
│   │   │   └── ui/
│   │   ├── auth/                               # Auth-specific components
│   │   ├── host/                               # Host/Dashboard components
│   │   │   ├── analytics/
│   │   │   ├── create/
│   │   │   │   ├── steps/
│   │   │   │   └── ui/
│   │   │   ├── dashboard/
│   │   │   ├── events/
│   │   │   │   ├── manage/
│   │   │   │   │   └── tabs/
│   │   │   │   └── manage/
│   │   │   │       └── ui/
│   │   │   ├── orders/
│   │   │   └── settings/
│   │   │       └── ui/
│   │   ├── layout/                             # Layout components
│   │   ├── map/                                # Map-related components
│   │   ├── reviews/                            # Review components
│   │   ├── shared/                             # Shared feature components
│   │   │   └── cards/
│   │   ├── support/                            # Support components
│   │   ├── ui/                                 # Base UI primitives
│   │   ├── wallet/                             # Wallet components
│   │   └── TicketPDF.tsx                       # PDF generation
│   │
│   ├── lib/                                    # Shared Utilities & Logic
│   │   ├── api/                                # API client & configurations
│   │   ├── auth/                               # Authentication utilities
│   │   ├── create-event/                       # Event creation logic
│   │   ├── map/                                # Map utilities
│   │   ├── notifications/                      # Notification handling
│   │   ├── support/                            # Support utilities
│   │   ├── validations/                        # Zod schemas & validation
│   │   ├── utils.ts                            # General utilities
│   │   └── pdfGenerator.ts                     # PDF generation utilities
│   │
│   └── next-env.d.ts
│
├── public/                                     # Static Assets
│   ├── font/
│   │   └── index.ts
│   └── logo/
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.mjs
├── next.config.ts
├── components.json                             # Shadcn/ui config
├── eslint.config.mjs
├── .env.local                                  # Local environment
├── .env.production                             # Production environment
├── .gitignore
├── MIGRATION.md                                # Migration guide
└── README.md
```

### Organization Benefits

#### ✅ **Route Grouping with `()`**
Route groups like `(auth)`, `(dashboard)`, `(events)` organize related routes without affecting URLs:
- Cleaner URL structure
- Logical feature grouping
- Shared layouts per group

#### ✅ **Feature-Based Component Organization**
Components are organized by feature (`host/`, `admin/`, `auth/`) rather than by type:
- Easy to find related components
- Self-contained feature modules
- Facilitates feature extraction/removal

#### ✅ **Shared vs Feature-Specific**
- **`components/ui/`**: Generic, reusable UI primitives (Button, Input, Card, etc.)
- **`components/{feature}/`**: Feature-specific components
- **`components/shared/`**: Shared feature components across multiple features
- **`components/layout/`**: App-wide layout components

#### ✅ **Centralized Utilities**
- **`lib/api/`**: All backend communication
- **`lib/auth/`**: Authentication logic
- **`lib/validations/`**: Zod schemas (single source of truth)
- **`lib/{feature}/`**: Feature-specific utilities

#### ✅ **Clear Separation of Concerns**
- Routes handle navigation & data fetching
- Components handle presentation & UI logic
- Lib handles business logic & API calls
- Validation schemas are centralized

#### ✅ **Dynamic Routes with `[]` Convention**
- `[id]` - Dynamic route segments
- `[...proxy]` - Catch-all routes for API proxying
- Enables flexible URL patterns without code duplication

## 📋 Rules & Guidelines

### 1. **Component Organization**
- **Base UI Components** (`components/ui/`): Only generic, reusable primitives (Button, Input, Card, etc.)
- **Feature Components** (`app/*/components/`): Feature-specific components that belong to routes
- **Layout Components** (`components/layout/`): App-wide layout elements (Header, Footer, Sidebar)

### 2. **File Naming**
- Components: `PascalCase.tsx` (Button.tsx, UserCard.tsx)
- Hooks: `useCamelCase.ts` (useAuth.ts, useEvents.ts)
- Utils: `camelCase.ts` (formatDate.ts, validateEmail.ts)
- Types: `PascalCase.ts` (User.ts, EventTypes.ts)

### 3. **Import Rules**
- Use absolute imports with `'`' (see below for file content) prefix
- Group imports: React/external libs, then internal modules
- No relative imports beyond parent directory

```typescript
// ✅ Good
import { useState } from 'react';
import { apiClient } from ''lib/api'' (see below for file content);
import { Button } from ''components/ui/Button'' (see below for file content);
import { useAuth } from '../hooks/useAuth';

// ❌ Bad
import { apiClient } from '../../../lib/api';
import Button from ''components/ui/Button'' (see below for file content); // Missing export consistency
```

### 4. **API Usage**
- All backend calls go through `lib/api/client.ts`
- Use schema validation for requests/responses
- Never call APIs directly in components - use hooks

```typescript
// ✅ Good - in a hook
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => apiClient.get('/events'),
  });
};

// ❌ Bad - direct API call in component
const EventsPage = () => {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetch('/api/events').then(setEvents);
  }, []);
};
```

### 5. **State Management**
- Component state: `useState` for local state
- Server state: React Query for API data
- Global state: Context + hooks for app-wide state
- Form state: React Hook Form with Zod validation

### 6. **Error Handling**
- API errors: Handled in API client with user-friendly messages
- Form errors: Validation errors from Zod schemas
- Runtime errors: Error boundaries for graceful degradation

## 🎨 Theming & Design System

### Color Palette

#### Primary (Indigo)
- **Interactive elements**: Buttons, links, focus states
- **Brand colors**: Primary buttons, active states
- **Usage**: `bg-primary`, `text-primary`, `border-primary`

```css
primary: {
  50: '#eef2ff',   /* Very light indigo */
  500: '#6366f1',  /* Main indigo */
  600: '#4f46e5',  /* Darker indigo for hovers */
  700: '#4338ca',  /* Even darker for pressed states */
}
```

#### Secondary (Slate)
- **Neutral elements**: Borders, backgrounds, text
- **Subtle UI**: Cards, dividers, muted text
- **Usage**: `bg-secondary`, `text-secondary`, `border-secondary`

```css
secondary: {
  50: '#f8fafc',   /* Off-white backgrounds */
  100: '#f1f5f9',  /* Light gray backgrounds */
  500: '#64748b',  /* Medium gray text */
  600: '#475569',  /* Darker gray text */
  900: '#0f172a',  /* Very dark gray text */
}
```

#### Background (White & Slate)
- **Page backgrounds**: Always white (`#ffffff`)
- **Card backgrounds**: Slate-50 (`#f8fafc`) or white
- **Component backgrounds**: Use appropriate contrast

### Design Tokens

```css
/* Text Colors */
text-foreground: #0f172a    /* Primary text */
text-muted-foreground: #64748b  /* Secondary text */
text-accent-foreground: #0f172a /* Accent text */

/* Background Colors */
bg-background: #ffffff      /* Main background */
bg-muted: #f1f5f9          /* Muted background */
bg-accent: #f1f5f9         /* Accent background */

/* Border Colors */
border: #e2e8f0           /* Default borders */
border-input: #e2e8f0     /* Input borders */

/* Focus States */
ring: #6366f1             /* Focus ring color */
```

### Typography
- **Sans-serif**: Geist Sans (system fallback)
- **Mono**: Geist Mono for code
- **Scale**: Consistent heading hierarchy

### Spacing
- Use Tailwind spacing scale (`space-*`, `p-*`, `m-*`)
- Consistent padding: `p-4`, `p-6`, `p-8`
- Component spacing: `space-y-4`, `gap-4`

### Component Guidelines

#### Buttons
```tsx
// Primary actions
<Button>Primary Action</Button>

// Secondary actions
<Button variant="secondary">Secondary Action</Button>

// Destructive actions
<Button variant="destructive">Delete</Button>

// Outline style
<Button variant="outline">Outline</Button>
```

#### Cards
```tsx
<div className="bg-card border border-border rounded-lg p-6">
  {/* Card content */}
</div>
```

#### Forms
```tsx
<div className="space-y-4">
  <div>
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      className="mt-1"
      placeholder="Enter your email"
    />
  </div>
</div>
```

## 🔧 Development Workflow

### 1. **Creating a New Feature**
```bash
# 1. Create route directory
mkdir -p src/app/(dashboard)/new-feature

# 2. Create feature structure
mkdir -p src/app/(dashboard)/new-feature/{components,hooks,types,utils}

# 3. Add page
touch src/app/(dashboard)/new-feature/page.tsx

# 4. Add components, hooks, etc.
```

### 2. **Adding API Integration**
```typescript
// 1. Define types (if needed)
export interface NewFeature {
  id: string;
  name: string;
}

// 2. Create API hooks
export const useNewFeature = (id: string) => {
  return useQuery({
    queryKey: ['new-feature', id],
    queryFn: () => apiClient.get<NewFeature>(`/new-feature/${id}`),
  });
};

// 3. Use in components
const NewFeaturePage = ({ id }: { id: string }) => {
  const { data, isLoading } = useNewFeature(id);
  // ... component logic
};
```

### 3. **Component Creation**
```typescript
// 1. Base UI component (components/ui/)
export const NewButton = ({ children, ...props }) => {
  return (
    <button
      className="bg-primary text-primary-foreground px-4 py-2 rounded"
      {...props}
    >
      {children}
    </button>
  );
};

// 2. Feature component (app/*/components/)
export const FeatureCard = ({ feature }) => {
  return (
    <Card>
      <h3>{feature.name}</h3>
      <p>{feature.description}</p>
    </Card>
  );
};
```

## 🚀 Deployment

### Environment Variables
```bash
# Required
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Optional
NEXT_PUBLIC_APP_ENV=production
```

### Build Process
```bash
npm run build
npm start
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Zod Validation](https://zod.dev/)

---

**Remember**: Consistency is key. Follow these guidelines to maintain a clean, scalable, and maintainable codebase.

# Storybook — Complete Guide

## Table of Contents

- [1. What is Storybook?](#1-what-is-storybook)
- [2. Setup](#2-setup)
- [3. Writing Stories](#3-writing-stories)
- [4. Args and Controls](#4-args-and-controls)
- [5. Decorators](#5-decorators)
- [6. Play Functions (Interaction Testing)](#6-play-functions-interaction-testing)
- [7. Addons](#7-addons)
- [8. Documentation (Autodocs)](#8-documentation-autodocs)
- [9. Component Patterns](#9-component-patterns)
- [10. Theming and Styling](#10-theming-and-styling)
- [11. Visual Testing](#11-visual-testing)
- [12. Configuration](#12-configuration)
- [13. Best Practices](#13-best-practices)
- [14. Interview Questions & Answers](#14-interview-questions--answers)

---

## 1. What is Storybook?

Storybook is an **open-source tool for building UI components in isolation**. It provides a sandbox to develop, test, and document components independently from the main application — outside the business logic, data fetching, and routing.

Key benefits:
- **Isolation** — develop components without running the full app
- **Documentation** — auto-generated docs from component props
- **Visual testing** — catch visual regressions
- **Interaction testing** — simulate user behavior in stories
- **Component catalog** — browse all components in one place
- **Design system** — single source of truth for UI components

### Who Uses Storybook

Used by teams at GitHub, Airbnb, Mozilla, BBC, Shopify, and thousands of others. It's the most popular tool for component-driven development.

---

## 2. Setup

### 2.1 Installation

```bash
# Initialize Storybook in an existing project (auto-detects framework)
npx storybook@latest init

# Or install manually
npm install -D @storybook/react-vite storybook

# Start Storybook dev server
npm run storybook
# Opens on http://localhost:6006
```

### 2.2 Project Structure

```
.storybook/
  main.ts           # Storybook configuration (addons, framework, stories glob)
  preview.ts         # Global decorators, parameters, theme setup
src/
  components/
    ui/
      button.tsx
      button.stories.tsx    # co-located story file
      card.tsx
      card.stories.tsx
```

### 2.3 Configuration (.storybook/main.ts)

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Where to find stories
  stories: ['../src/**/*.stories.@(ts|tsx|js|jsx)'],

  // Addons
  addons: [
    '@storybook/addon-essentials',      // controls, actions, viewport, backgrounds, docs
    '@storybook/addon-themes',          // dark/light mode toggle
    '@storybook/addon-a11y',            // accessibility checks
    '@storybook/addon-interactions',    // interaction testing panel
  ],

  // Framework
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  // Vite config customization
  viteFinal: async (config) => {
    // Add path aliases, plugins, etc.
    return config;
  },

  // Enable autodocs for all stories
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

### 2.4 Preview Configuration (.storybook/preview.ts)

```ts
import type { Preview } from '@storybook/react';
import '../src/app/globals.css';             // import your app styles

const preview: Preview = {
  parameters: {
    // Default controls behavior
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Default layout
    layout: 'centered',                      // 'centered' | 'fullscreen' | 'padded'
  },
  // Global decorators
  decorators: [],
  // Tags for autodocs
  tags: ['autodocs'],
};

export default preview;
```

---

## 3. Writing Stories

### 3.1 Basic Story (CSF3 — Component Story Format)

```tsx
// button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

// Meta: component-level configuration
const meta: Meta<typeof Button> = {
  title: 'UI/Button',                      // sidebar path
  component: Button,
  tags: ['autodocs'],                       // auto-generate docs page
};

export default meta;
type Story = StoryObj<typeof Button>;

// Stories: individual states of the component
export const Default: Story = {
  args: {
    children: 'Click me',
  },
};

export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};
```

### 3.2 Story with Render Function

For composed components (Dialog, Dropdown, etc.) that need wrapper/trigger:

```tsx
// dialog.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { Button } from './button';

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <input className="w-full border p-2 rounded" placeholder="Name" />
          <input className="w-full border p-2 rounded" placeholder="Email" />
        </div>
        <DialogFooter>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
```

### 3.3 Story with Args and Render

```tsx
// badge.stories.tsx
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const WithArgs: Story = {
  args: {
    variant: 'default',
    children: 'Badge Text',
  },
  // args are passed to the component automatically
  // users can modify them via the Controls panel
};
```

---

## 4. Args and Controls

### 4.1 ArgTypes (Control Configuration)

```tsx
const meta: Meta<typeof MyComponent> = {
  title: 'UI/MyComponent',
  component: MyComponent,
  argTypes: {
    // Dropdown select
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive'],
      description: 'Visual style of the component',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    // Radio buttons
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    // Boolean toggle
    disabled: {
      control: 'boolean',
    },
    // Text input
    label: {
      control: 'text',
    },
    // Number slider
    count: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    // Color picker
    color: {
      control: 'color',
    },
    // Date picker
    startDate: {
      control: 'date',
    },
    // Object editor
    config: {
      control: 'object',
    },
    // Hide from controls
    className: {
      table: { disable: true },
    },
    // Disable control (show but not editable)
    id: {
      control: false,
    },
  },
};
```

### 4.2 Control Types

| Control | Data Type | Usage |
|---------|-----------|-------|
| `boolean` | boolean | Toggle switch |
| `text` | string | Text input |
| `number` | number | Number input |
| `range` | number | Slider |
| `color` | string | Color picker |
| `date` | Date | Date picker |
| `select` | string/number | Dropdown |
| `radio` | string/number | Radio buttons |
| `inline-radio` | string/number | Inline radio buttons |
| `check` | string[] | Checkboxes |
| `inline-check` | string[] | Inline checkboxes |
| `object` | object | JSON editor |
| `file` | file | File input |

### 4.3 Actions (Event Handlers)

```tsx
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    onClick: { action: 'clicked' },       // logs to Actions panel
  },
};

// Or use the fn() helper
import { fn } from '@storybook/test';

export const WithAction: Story = {
  args: {
    onClick: fn(),                         // creates a spy function
    children: 'Click me',
  },
};
```

---

## 5. Decorators

Decorators wrap stories with additional rendering context (providers, layout, theme).

### 5.1 Story-Level Decorator

```tsx
export const InDarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark bg-gray-900 p-4">
        <Story />
      </div>
    ),
  ],
  args: { children: 'Dark Button' },
};
```

### 5.2 Component-Level Decorator

```tsx
const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};
```

### 5.3 Global Decorators (preview.ts)

```tsx
// .storybook/preview.ts
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { TooltipProvider } from '../src/components/ui/tooltip';

const queryClient = new QueryClient();

const preview: Preview = {
  decorators: [
    // Redux Provider
    (Story) => (
      <Provider store={store}>
        <Story />
      </Provider>
    ),
    // React Query Provider
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
    // Router (for components using Link, useNavigate)
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    // Tooltip Provider (shadcn)
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};
```

---

## 6. Play Functions (Interaction Testing)

Play functions simulate user interactions directly in Storybook.

```tsx
import { expect, fn, userEvent, within } from '@storybook/test';

export const FilledForm: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Type into inputs
    await userEvent.type(canvas.getByLabelText('Name'), 'Alice');
    await userEvent.type(canvas.getByLabelText('Email'), 'alice@example.com');

    // Select a dropdown option
    await userEvent.click(canvas.getByRole('combobox'));
    await userEvent.click(canvas.getByText('Admin'));

    // Click submit
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));

    // Assert
    await expect(args.onSubmit).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      role: 'admin',
    });
  },
};

export const Toggleable: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole('switch');
    await expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
  },
};

export const Search: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByPlaceholderText('Search...');
    await userEvent.type(input, 'react');

    // Wait for debounced results
    await expect(canvas.findByText('React')).resolves.toBeInTheDocument();
  },
};
```

---

## 7. Addons

### 7.1 Essential Addons (Included by Default)

```
@storybook/addon-essentials includes:
  - Controls:     edit props dynamically in the sidebar
  - Actions:      log event handlers in the panel
  - Viewport:     test responsive breakpoints
  - Backgrounds:  switch background colors
  - Docs:         auto-generated documentation
  - Measure:      measure spacing/dimensions
  - Outline:      show component outlines
```

### 7.2 Popular Addons

```bash
# Accessibility
npm install -D @storybook/addon-a11y
# Adds a11y panel with WCAG violation checks

# Themes (dark mode toggle)
npm install -D @storybook/addon-themes

# Interactions (play function testing panel)
npm install -D @storybook/addon-interactions

# Design tokens
npm install -D @storybook/addon-designs
# Link Figma designs to stories

# Storybook Test Runner (run play functions as tests)
npm install -D @storybook/test-runner
```

### 7.3 Accessibility Addon

```tsx
// Automatically checks every story for a11y violations
// Shows in a panel with severity and fix suggestions

// Override per story
export const AccessibleButton: Story = {
  args: { children: 'Click me' },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'label', enabled: true },
        ],
      },
    },
  },
};

// Disable for a specific story
export const Decorative: Story = {
  parameters: {
    a11y: { disable: true },
  },
};
```

### 7.4 Viewport Addon

```tsx
// Test responsive behavior
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'iphone14',
    },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'ipad',
    },
  },
};

// Custom viewports in preview.ts
const customViewports = {
  smallMobile: {
    name: 'Small Mobile',
    styles: { width: '320px', height: '568px' },
  },
  largeMobile: {
    name: 'Large Mobile',
    styles: { width: '414px', height: '896px' },
  },
};
```

---

## 8. Documentation (Autodocs)

### 8.1 Enable Autodocs

```tsx
// Per component (add 'autodocs' tag)
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],                       // generates a Docs page
};

// Or globally in preview.ts
const preview: Preview = {
  tags: ['autodocs'],                       // all stories get docs
};
```

### 8.2 Custom Documentation (MDX)

```mdx
{/* button.mdx */}
import { Meta, Story, Canvas, Controls, ArgTypes } from '@storybook/blocks';
import * as ButtonStories from './button.stories';

<Meta of={ButtonStories} />

# Button

A versatile button component that supports multiple variants and sizes.

## Usage

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="md">Click me</Button>
```

## Variants

<Canvas of={ButtonStories.Primary} />
<Canvas of={ButtonStories.Secondary} />
<Canvas of={ButtonStories.Destructive} />

## All Props

<ArgTypes of={ButtonStories} />

## Interactive Demo

<Canvas of={ButtonStories.Default} />
<Controls of={ButtonStories.Default} />
```

### 8.3 JSDoc for Auto-Docs

```tsx
interface ButtonProps {
  /** Visual style of the button */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  /** Size of the button */
  size?: 'sm' | 'default' | 'lg' | 'icon';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Button content */
  children: React.ReactNode;
}
```

JSDoc comments on props automatically appear in the docs table.

---

## 9. Component Patterns

### 9.1 Simple Component (Args-based)

```tsx
// For components with straightforward props
export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Button',
  },
};
```

### 9.2 Composed Component (Render-based)

```tsx
// For components that require composition (Dialog, Dropdown, Tabs)
export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
```

### 9.3 Data-Driven Component

```tsx
// For components that display data (tables, lists, cards)
const mockUsers = [
  { id: '1', name: 'Alice', email: 'alice@example.com', role: 'Admin' },
  { id: '2', name: 'Bob', email: 'bob@example.com', role: 'User' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com', role: 'User' },
];

export const WithData: Story = {
  args: {
    users: mockUsers,
    onEdit: fn(),
    onDelete: fn(),
  },
};

export const Empty: Story = {
  args: {
    users: [],
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
```

### 9.4 Form Component

```tsx
export const EmptyForm: Story = {
  args: {
    onSubmit: fn(),
  },
};

export const PrefilledForm: Story = {
  args: {
    defaultValues: {
      name: 'Alice',
      email: 'alice@example.com',
    },
    onSubmit: fn(),
  },
};

export const WithValidationErrors: Story = {
  args: {
    errors: {
      name: 'Name is required',
      email: 'Invalid email format',
    },
    onSubmit: fn(),
  },
};
```

### 9.5 Showcase All Variants

```tsx
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon"><PlusIcon /></Button>
      </div>
    </div>
  ),
};
```

---

## 10. Theming and Styling

### 10.1 Dark Mode Toggle

```ts
// .storybook/preview.ts
import { withThemeByClassName } from '@storybook/addon-themes';

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
};
```

### 10.2 Tailwind CSS with Storybook

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // ... other config
  viteFinal: async (config) => {
    // Tailwind v4 with Lightning CSS (auto-detected by Vite)
    return config;
  },
};

// .storybook/preview.ts
import '../src/app/globals.css';           // import Tailwind styles
```

### 10.3 Custom Storybook Theme

```ts
// .storybook/manager.ts
import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

const theme = create({
  base: 'dark',
  brandTitle: 'My Design System',
  brandUrl: 'https://example.com',
  brandImage: '/logo.svg',

  // Colors
  colorPrimary: '#10b981',
  colorSecondary: '#6366f1',

  // UI
  appBg: '#0f172a',
  appContentBg: '#1e293b',
  appBorderColor: '#334155',
  appBorderRadius: 8,

  // Typography
  fontBase: '"Inter", sans-serif',
  fontCode: '"Fira Code", monospace',
});

addons.setConfig({ theme });
```

---

## 11. Visual Testing

### 11.1 Chromatic (Official Visual Testing)

```bash
npm install -D chromatic

# Run visual tests (captures screenshots, compares with baseline)
npx chromatic --project-token=<token>
```

### 11.2 Storybook Test Runner

```bash
npm install -D @storybook/test-runner

# Run all stories as tests (checks for rendering errors + play functions)
npx test-storybook

# With coverage
npx test-storybook --coverage
```

### 11.3 Snapshot Testing

```ts
// Using test-runner, stories are automatically snapshot tested
// Or manually with a test file:

import { composeStories } from '@storybook/react';
import { render } from '@testing-library/react';
import * as stories from './button.stories';

const { Primary, Secondary, Disabled } = composeStories(stories);

test('Primary renders correctly', () => {
  const { container } = render(<Primary />);
  expect(container).toMatchSnapshot();
});
```

---

## 12. Configuration

### 12.1 Static Assets

```ts
// .storybook/main.ts
const config: StorybookConfig = {
  staticDirs: ['../public'],               // serve files from public/
};
```

### 12.2 Webpack/Vite Aliases

```ts
// .storybook/main.ts (Vite)
viteFinal: async (config) => {
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '../src'),
  };
  return config;
};
```

### 12.3 Build Storybook

```bash
# Build static site
npm run build-storybook

# Output: storybook-static/
# Deploy to any static host (S3, Netlify, Vercel, GitHub Pages)
```

---

## 13. Best Practices

### 13.1 Story Organization

```
src/components/ui/
  button.tsx
  button.stories.tsx           # co-located with component

Sidebar hierarchy:
  UI/
    Button
    Card
    Dialog
    Input
  Layout/
    Sidebar
    Header
  Features/
    UserCard
    JobList
```

### 13.2 Naming Stories

```tsx
// Use descriptive names that explain the STATE, not the implementation
export const Default: Story = {};
export const WithIcon: Story = {};
export const Disabled: Story = {};
export const Loading: Story = {};
export const Empty: Story = {};
export const WithLongContent: Story = {};
export const OnDarkBackground: Story = {};
export const Mobile: Story = {};
```

### 13.3 Coverage Checklist

```
For every component, cover:
  1. Default state
  2. All variants/sizes
  3. Disabled state
  4. Loading state
  5. Empty state
  6. Error state
  7. Edge cases (long text, missing data)
  8. Responsive (mobile viewport)
  9. Dark mode
  10. Interactions (if applicable)
```

### 13.4 Do's and Don'ts

```
DO:
  - Co-locate stories with components
  - Use args for simple props, render for composition
  - Add autodocs tag for documentation
  - Test interactions with play functions
  - Keep stories focused on single states

DON'T:
  - Don't import app-level state/API in stories
  - Don't create stories for page-level components (too complex)
  - Don't duplicate logic — use decorators for shared setup
  - Don't skip edge cases (empty, error, loading)
```

---

## 14. Interview Questions & Answers

### Beginner

---

**Q1: What is Storybook and why would you use it?**

Storybook is a tool for developing UI components in isolation, outside the main application. You'd use it to:
- Develop components without running the full app (no backend needed)
- Document all component variants visually
- Test edge cases (empty states, errors, long content)
- Enable designers and devs to review components together
- Create a living component library / design system
- Catch visual regressions with visual testing

---

**Q2: What is a story?**

A story captures a single rendered state of a component. Each story represents one visual scenario — like "Primary Button", "Disabled Button", "Loading Button". Stories are defined in `.stories.tsx` files using Component Story Format (CSF):

```tsx
export const Primary: Story = {
  args: { variant: 'primary', children: 'Click' },
};
```

---

**Q3: What is CSF (Component Story Format)?**

CSF is the standard format for writing stories. A file has:
1. A **default export** (meta) — component-level config (title, component, argTypes)
2. **Named exports** — individual stories (each is a visual state)

```tsx
export default { title: 'UI/Button', component: Button };  // meta
export const Primary: Story = { args: { ... } };            // story
export const Disabled: Story = { args: { disabled: true } }; // story
```

---

**Q4: What are controls in Storybook?**

Controls are interactive UI widgets in the Storybook sidebar that let you dynamically change a component's props. They're auto-generated from TypeScript types / PropTypes. You can customize control types (select, radio, slider, color picker) via `argTypes`.

---

**Q5: What are decorators?**

Decorators are wrapper functions that provide additional context to stories — like a theme provider, Redux store, router, or layout container. They can be applied at story, component, or global level.

```tsx
decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>]
```

---

### Intermediate

---

**Q6: How do you test interactions in Storybook?**

Using **play functions** — async functions that simulate user behavior:

```tsx
export const FilledForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Name'), 'Alice');
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await expect(canvas.getByText('Success')).toBeInTheDocument();
  },
};
```

Play functions use the same `@testing-library` API as unit tests. The Interactions addon shows a step-by-step panel. The test runner can execute play functions as CI tests.

---

**Q7: How do you handle components that need providers (Redux, Router, Theme)?**

Use **decorators** at the appropriate level:
- **Global** (preview.ts): For providers every component needs (theme, tooltip)
- **Component** (meta): For providers specific to a feature
- **Story**: For unique per-story context

```tsx
// Global: .storybook/preview.ts
decorators: [
  (Story) => <Provider store={store}><Story /></Provider>,
  (Story) => <MemoryRouter><Story /></MemoryRouter>,
]
```

---

**Q8: How do you document components with Storybook?**

Three approaches:
1. **Autodocs** — add `tags: ['autodocs']` and Storybook generates a docs page from stories + TypeScript types
2. **JSDoc** — add comments to prop interfaces for descriptions
3. **MDX** — write custom documentation pages mixing markdown with live component examples

Autodocs is the fastest. MDX gives full control for design system documentation.

---

**Q9: How does Storybook fit into a CI/CD pipeline?**

1. **Build check**: `npm run build-storybook` — verifies all stories compile
2. **Test runner**: `npx test-storybook` — runs play functions as tests
3. **Visual testing**: Chromatic captures screenshots, compares with baseline, flags visual changes
4. **Deploy**: Build static Storybook, deploy to S3/Netlify for team access

```yaml
# GitHub Actions
- run: npm run build-storybook
- run: npx test-storybook
- run: npx chromatic --project-token=${{ secrets.CHROMATIC_TOKEN }}
```

---

**Q10: What is the difference between args-based and render-based stories?**

- **Args-based**: Simple — pass props via `args` object. Storybook renders the component automatically. Best for leaf components (Button, Input, Badge).
- **Render-based**: Custom — provide a `render` function that returns JSX. Required for composed components (Dialog with trigger, Dropdown with items, Tabs with panels).

Use args when possible (enables Controls panel). Use render when composition is needed.

---

### Advanced

---

**Q11: How do you implement visual regression testing with Storybook?**

1. **Chromatic** (official): Captures screenshots of every story on every PR. Compares with baseline. Shows pixel diffs for review and approval. Integrates with GitHub PRs.

2. **Percy**: Similar to Chromatic, integrates with BrowserStack.

3. **Playwright + Storybook**: Custom approach — navigate to each story URL, take screenshot, compare:
   ```ts
   test('button', async ({ page }) => {
     await page.goto('/iframe.html?id=ui-button--primary');
     await expect(page).toHaveScreenshot();
   });
   ```

Chromatic is the easiest — it's built by the Storybook team and requires minimal setup.

---

**Q12: How do you use Storybook for a design system?**

1. **Component catalog**: Every UI primitive has stories covering all variants
2. **Autodocs**: Auto-generated prop tables and usage examples
3. **Design tokens**: Document colors, spacing, typography in dedicated stories
4. **Composition examples**: Show how primitives compose into patterns
5. **Accessibility**: a11y addon checks every story automatically
6. **Versioned deployment**: Build and deploy Storybook per release
7. **Figma integration**: Link designs to stories with `@storybook/addon-designs`
8. **Publish as npm package**: Consumers reference the Storybook for documentation

---

**Q13: How do you handle mock data and API calls in stories?**

1. **Static mock data**: Define mock objects in the story file
2. **MSW (Mock Service Worker)**: Intercept API calls at the network level
   ```tsx
   export const WithData: Story = {
     parameters: {
       msw: {
         handlers: [
           rest.get('/api/users', (req, res, ctx) => {
             return res(ctx.json([{ id: 1, name: 'Alice' }]));
           }),
         ],
       },
     },
   };
   ```
3. **Decorators**: Wrap with mocked providers
4. **Loaders**: Fetch data before story renders:
   ```tsx
   export const WithData: Story = {
     loaders: [async () => ({ users: await fetchMockUsers() })],
     render: (args, { loaded: { users } }) => <UserList users={users} />,
   };
   ```

---

## References

- [Storybook Documentation](https://storybook.js.org/docs) — Official docs and tutorials
- [Storybook Addons](https://storybook.js.org/addons) — Browse the addon ecosystem
- [Storybook GitHub](https://github.com/storybookjs/storybook) — Source code and community

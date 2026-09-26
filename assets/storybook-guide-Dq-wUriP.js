const n=`# Storybook — Complete Guide

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
- [14. Interview Questions & Answers](#14-interview-questions-answers)

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

### Why Isolation Matters — Component-Driven Development

Storybook is the canonical implementation of **Component-Driven Development (CDD)**, an architectural philosophy that flips the traditional UI workflow. Instead of building features top-down (page → sections → components), CDD builds bottom-up: write the smallest reusable components first, compose them into larger ones, then assemble pages from those compositions. The premise: components built in isolation are intrinsically more reusable, more testable, and more visually consistent than components extracted retroactively from feature code.

Three structural problems CDD solves:

1. **The "running the whole app to see one button" problem.** Without isolation, modifying a button means firing up the dev server, signing in, navigating to the page that uses the button, and waiting for hot-reload — for every visual tweak. With Storybook, you have the button on screen with all its variants in two seconds.

2. **The "works in this context, breaks in that one" bug.** A modal that's tested only via the checkout flow may behave differently when used in settings. Storybook forces every component to render *outside* its primary context, surfacing assumptions baked into the surrounding code (parent CSS, redux providers, route params).

3. **The visual-design / engineering handoff.** Designers can review the same component the engineer is building, without a staging environment, without authentication, without a database. The static Storybook build is a deployable artifact that doubles as a design review tool.

### Who Uses Storybook

Used by teams at GitHub, Airbnb, Mozilla, BBC, Shopify, and thousands of others. It's the most popular tool for component-driven development.

### Storybook in the broader testing stack

Storybook is not a replacement for testing — it's a development environment that *also* enables testing patterns that are hard without isolation. The mature setup has four layers:

\`\`\`
| Layer                  | Tool                       | What it catches                          |
|------------------------|----------------------------|------------------------------------------|
| Unit tests             | Jest / Vitest + RTL        | Logic, prop handling, conditional render |
| Component tests        | Storybook + play()         | Interaction flows in isolation           |
| Visual regression      | Chromatic / Percy / Loki   | Pixel-level UI changes                   |
| End-to-end             | Playwright / Cypress       | Full user flows, authentication, routes  |
\`\`\`

Storybook sits at layers 2 and 3. The play function (§6) drives interaction tests against rendered components; tools like Chromatic compare snapshots of every story across PRs to catch unintended visual changes. Visual regression at the *component* level is much faster and more deterministic than at the *page* level — you're snapshotting one button, not a whole flow.

---

## 2. Setup

### 2.1 Installation

\`\`\`bash
# Initialize Storybook in an existing project (auto-detects framework)
npx storybook@latest init

# Or install manually
npm install -D @storybook/react-vite storybook

# Start Storybook dev server
npm run storybook
# Opens on http://localhost:6006
\`\`\`

### 2.2 Project Structure

\`\`\`
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
\`\`\`

### 2.3 Configuration (.storybook/main.ts)

The examples in this guide follow Storybook 9 and later. Version 9 folded most of the old add-on packages into the main \`storybook\` package: controls, actions, viewport, backgrounds and the interactions panel are now built in, so \`@storybook/addon-essentials\` and \`@storybook/addon-interactions\` no longer exist, and testing helpers are imported from \`storybook/test\` instead of \`@storybook/test\`. If you see those old package names in a tutorial, it was written for Storybook 8 or earlier.

\`\`\`ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Where to find stories
  stories: ['../src/**/*.stories.@(ts|tsx|js|jsx)'],

  // Addons
  addons: [
    '@storybook/addon-docs',            // autodocs + MDX pages
    '@storybook/addon-themes',          // dark/light mode toggle
    '@storybook/addon-a11y',            // accessibility checks
    // controls, actions, viewport, backgrounds and interactions are built in
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

  // Autodocs is switched on with the 'autodocs' tag (see preview.ts), not here
};

export default config;
\`\`\`

### 2.4 Preview Configuration (.storybook/preview.ts)

\`\`\`ts
import type { Preview } from '@storybook/react-vite';
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
\`\`\`

---

## 3. Writing Stories

### 3.1 Basic Story (CSF3 — Component Story Format)

A **story** is one named state of a component — "the disabled button", "the button with a long label". A stories file is an ordinary ES module: its **default export** (called \`meta\`) says which component the file is about and where it appears in the sidebar, and every **named export** is one story. Most stories are just an \`args\` object — the props to render the component with — which is why they are so short: Storybook renders \`<Button {...args} />\` for you.

\`\`\`tsx
// button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
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
\`\`\`

### 3.2 Story with Render Function

For composed components (Dialog, Dropdown, etc.) that need wrapper/trigger:

\`\`\`tsx
// dialog.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
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
\`\`\`

### 3.3 Story with Args and Render

\`\`\`tsx
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
\`\`\`

---

## 4. Args and Controls

### 4.1 ArgTypes (Control Configuration)

\`\`\`tsx
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
\`\`\`

### 4.2 Control Types

| Control | Data Type | Usage |
|---------|-----------|-------|
| \`boolean\` | boolean | Toggle switch |
| \`text\` | string | Text input |
| \`number\` | number | Number input |
| \`range\` | number | Slider |
| \`color\` | string | Color picker |
| \`date\` | Date | Date picker |
| \`select\` | string/number | Dropdown |
| \`radio\` | string/number | Radio buttons |
| \`inline-radio\` | string/number | Inline radio buttons |
| \`check\` | string[] | Checkboxes |
| \`inline-check\` | string[] | Inline checkboxes |
| \`object\` | object | JSON editor |
| \`file\` | file | File input |

### 4.3 Actions (Event Handlers)

\`\`\`tsx
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    onClick: { action: 'clicked' },       // logs to Actions panel
  },
};

// Or use the fn() helper
import { fn } from 'storybook/test';

export const WithAction: Story = {
  args: {
    onClick: fn(),                         // creates a spy function
    children: 'Click me',
  },
};
\`\`\`

---

## 5. Decorators

Decorators wrap stories with additional rendering context (providers, layout, theme). You need them because a component rendered in isolation has lost everything its real parents gave it: a component that calls \`useNavigate()\` throws without a router above it, and one that reads a Redux store throws without a \`<Provider>\`. A decorator is a function that receives the story as \`Story\` and returns it wrapped in whatever it needs. Apply it on one story, on every story of a component (in \`meta\`), or on every story in the project (in \`preview.ts\`) — pick the narrowest level that covers the components that need it.

### 5.1 Story-Level Decorator

\`\`\`tsx
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
\`\`\`

### 5.2 Component-Level Decorator

\`\`\`tsx
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
\`\`\`

### 5.3 Global Decorators (preview.ts)

\`\`\`tsx
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
\`\`\`

---

## 6. Play Functions (Interaction Testing)

A **play function** is an async function attached to a story that Storybook runs right after the story renders. Inside it you drive the component like a user would — type, click, select — using the same Testing Library queries (\`getByRole\`, \`getByLabelText\`) and \`expect\` assertions you would write in a unit test. The point is that the story becomes a test without a second copy of the setup: the same rendered state you look at in the browser is the one the assertions run against, and the test runner (§11.2) can execute every play function in CI.

\`\`\`tsx
import { expect, fn, userEvent, within } from 'storybook/test';

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
\`\`\`

---

## 7. Addons

### 7.1 Essential Addons (Included by Default)

\`\`\`
Built into Storybook 9+ (nothing to install):
  - Controls:      edit props dynamically in the sidebar
  - Actions:       log event handlers in the panel
  - Viewport:      test responsive breakpoints
  - Backgrounds:   switch background colors
  - Interactions:  step through play functions
  - Measure:       measure spacing/dimensions
  - Outline:       show component outlines

Installed separately:
  - @storybook/addon-docs:  autodocs + MDX pages
\`\`\`

### 7.2 Popular Addons

\`\`\`bash
# Accessibility
npm install -D @storybook/addon-a11y
# Adds a11y panel with WCAG violation checks

# Themes (dark mode toggle)
npm install -D @storybook/addon-themes

# Design tokens
npm install -D @storybook/addon-designs
# Link Figma designs to stories

# Storybook Test Runner (run play functions as tests)
npm install -D @storybook/test-runner

# Or the newer Vitest-based Storybook Test (runs stories as Vitest tests)
npx storybook@latest add @storybook/addon-vitest
\`\`\`

### 7.3 Accessibility Addon

\`\`\`tsx
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
\`\`\`

### 7.4 Viewport Addon

\`\`\`tsx
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
\`\`\`

---

## 8. Documentation (Autodocs)

### 8.1 Enable Autodocs

\`\`\`tsx
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
\`\`\`

### 8.2 Custom Documentation (MDX)

\`\`\`mdx
{/* button.mdx */}
import { Meta, Story, Canvas, Controls, ArgTypes } from '@storybook/addon-docs/blocks';
import * as ButtonStories from './button.stories';

<Meta of={ButtonStories} />

# Button

A versatile button component that supports multiple variants and sizes.

## Usage

\`\`\`tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="md">Click me</Button>
\`\`\`

## Variants

<Canvas of={ButtonStories.Primary} />
<Canvas of={ButtonStories.Secondary} />
<Canvas of={ButtonStories.Destructive} />

## All Props

<ArgTypes of={ButtonStories} />

## Interactive Demo

<Canvas of={ButtonStories.Default} />
<Controls of={ButtonStories.Default} />
\`\`\`

### 8.3 JSDoc for Auto-Docs

\`\`\`tsx
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
\`\`\`

JSDoc comments on props automatically appear in the docs table.

---

## 9. Component Patterns

### 9.1 Simple Component (Args-based)

\`\`\`tsx
// For components with straightforward props
export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Button',
  },
};
\`\`\`

### 9.2 Composed Component (Render-based)

\`\`\`tsx
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
\`\`\`

### 9.3 Data-Driven Component

\`\`\`tsx
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
\`\`\`

### 9.4 Form Component

\`\`\`tsx
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
\`\`\`

### 9.5 Showcase All Variants

\`\`\`tsx
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
\`\`\`

---

## 10. Theming and Styling

### 10.1 Dark Mode Toggle

\`\`\`ts
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
\`\`\`

### 10.2 Tailwind CSS with Storybook

\`\`\`ts
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
\`\`\`

### 10.3 Custom Storybook Theme

\`\`\`ts
// .storybook/manager.ts
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

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
\`\`\`

---

## 11. Visual Testing

Visual testing answers a question unit tests cannot: *does it still look right?* A tool takes a screenshot of every story, compares it with the approved screenshot from before (the **baseline**), and flags any story whose pixels changed so a human can accept or reject the change. Stories make this cheap because each one is already a fixed, reproducible state of one component.

### 11.1 Chromatic (Official Visual Testing)

\`\`\`bash
npm install -D chromatic

# Run visual tests (captures screenshots, compares with baseline)
npx chromatic --project-token=<token>
\`\`\`

### 11.2 Storybook Test Runner

\`\`\`bash
npm install -D @storybook/test-runner

# Run all stories as tests (checks for rendering errors + play functions)
npx test-storybook

# With coverage
npx test-storybook --coverage
\`\`\`

### 11.3 Snapshot Testing

\`\`\`tsx
// Using test-runner, stories are automatically snapshot tested
// Or manually with a test file:

import { composeStories } from '@storybook/react-vite';
import { render } from '@testing-library/react';
import * as stories from './button.stories';

const { Primary, Secondary, Disabled } = composeStories(stories);

test('Primary renders correctly', () => {
  const { container } = render(<Primary />);
  expect(container).toMatchSnapshot();
});
\`\`\`

---

## 12. Configuration

### 12.1 Static Assets

\`\`\`ts
// .storybook/main.ts
const config: StorybookConfig = {
  staticDirs: ['../public'],               // serve files from public/
};
\`\`\`

### 12.2 Webpack/Vite Aliases

\`\`\`ts
// .storybook/main.ts (Vite)
viteFinal: async (config) => {
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '../src'),
  };
  return config;
};
\`\`\`

### 12.3 Build Storybook

\`\`\`bash
# Build static site
npm run build-storybook

# Output: storybook-static/
# Deploy to any static host (S3, Netlify, Vercel, GitHub Pages)
\`\`\`

---

## 13. Best Practices

### 13.1 Story Organization

\`\`\`
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
\`\`\`

### 13.2 Naming Stories

\`\`\`tsx
// Use descriptive names that explain the STATE, not the implementation
export const Default: Story = {};
export const WithIcon: Story = {};
export const Disabled: Story = {};
export const Loading: Story = {};
export const Empty: Story = {};
export const WithLongContent: Story = {};
export const OnDarkBackground: Story = {};
export const Mobile: Story = {};
\`\`\`

### 13.3 Coverage Checklist

\`\`\`
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
\`\`\`

### 13.4 Do's and Don'ts

Most of these come down to one idea: a story should be one small, reproducible state of one component, set up the same way every time.

**Do:**
- **Co-locate stories with components** (\`button.tsx\` beside \`button.stories.tsx\`), so a change to the component and its stories lands in the same review, and a deleted component takes its stories with it.
- **Use args for simple props, render for composition** — args are what Controls edits and autodocs lists; a \`render\` function is only needed when the component needs children or siblings to make sense (see Q10).
- **Add the \`autodocs\` tag**, so the docs page is generated from the stories and types and cannot drift from the code.
- **Test interactions with play functions**, so the state you look at is also the state the assertions run against (§6).
- **Keep each story to a single state** — "Disabled", "Loading", "Empty". A story that shows several states at once gives a visual diff that points at nothing in particular.

**Don't:**
- **Don't import app-level state or the real API** into stories. A story that depends on the real store or backend breaks when they change, and shows whatever data happens to be there. Pass mock data as args, or fake the network with MSW (Q13).
- **Don't start with page-level stories.** A page needs every provider and every API call mocked before it renders, so it is expensive to write and brittle to keep. Cover the components first; add a page story only when the page's layout itself needs review.
- **Don't repeat setup in every story** — put shared providers in a decorator (§5) at the narrowest level that covers the components that need them.
- **Don't skip the edge cases** (empty, error, loading, long text). They are the states the real app reaches least often in development, so they are where bugs survive.

---

## 14. Interview Questions & Answers

### Beginner

---

**Q1: What is Storybook and why would you use it?**

Short answer: Storybook is a separate dev server that renders your UI components one at a time, outside the main application, with each interesting state saved as a "story". You use it because seeing and testing one component inside the real app is slow and incomplete.

What that buys you, and why:
- **Speed** — to see a button's error state you open its story, instead of starting the backend, logging in and navigating to a page that happens to show it.
- **Edge cases get looked at** — an empty list, an error, a 200-character name are hard to reproduce in the running app, so nobody checks them. A story makes each one a click away.
- **Living documentation** — the component catalog is generated from the same stories developers use, so it cannot drift from the code the way a wiki page does.
- **Designer review without an environment** — the static build is a website designers can open, with no login or database.
- **Tests for free** — every story is a fixed state, so it can be screenshot-compared (visual regression) or driven by a play function (interaction test).

---

**Q2: What is a story?**

A story captures a single rendered state of a component. Each story represents one visual scenario — like "Primary Button", "Disabled Button", "Loading Button". Stories are defined in \`.stories.tsx\` files using Component Story Format (CSF):

\`\`\`tsx
export const Primary: Story = {
  args: { variant: 'primary', children: 'Click' },
};
\`\`\`

---

**Q3: What is CSF (Component Story Format)?**

CSF is the standard format for writing stories. A file has:
1. A **default export** (meta) — component-level config (title, component, argTypes)
2. **Named exports** — individual stories (each is a visual state)

\`\`\`tsx
export default { title: 'UI/Button', component: Button };  // meta
export const Primary: Story = { args: { /* … */ } };            // story
export const Disabled: Story = { args: { disabled: true } }; // story
\`\`\`

---

**Q4: What are controls in Storybook?**

Controls are form widgets in the Storybook panel that edit a story's \`args\` (its props) live, so you can try a new label, toggle \`disabled\` or switch variants without editing code. Storybook infers a sensible widget from each prop's TypeScript type or PropTypes — a boolean gets a toggle, a string union gets a dropdown — and you override the choice through \`argTypes\` when the guess is wrong (for example, a string prop that is really a colour should get a colour picker). They only work for args-based stories: if a story ignores \`args\` and hard-codes its JSX in \`render\`, there is nothing for the controls to change.

---

**Q5: What are decorators?**

Decorators are wrapper functions around a story. They exist because a component rendered on its own has lost the providers its real parents supplied — a theme, a Redux store, a router — and will often crash without them. A decorator receives the story and returns it wrapped in whatever it needs (or in a layout container, such as a fixed-height box for a sidebar). They can be applied to one story, to every story of a component, or globally.

\`\`\`tsx
decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>]
\`\`\`

---

### Intermediate

---

**Q6: How do you test interactions in Storybook?**

Using **play functions** — async functions attached to a story that Storybook runs right after it renders, to act like a user and then assert on the result:

\`\`\`tsx
export const FilledForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Name'), 'Alice');
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await expect(canvas.getByText('Success')).toBeInTheDocument();
  },
};
\`\`\`

Play functions use the same \`@testing-library\` API as unit tests, so there is nothing new to learn. The advantage over a separate test file is that the story *is* the setup: the state you look at in the browser is the one the assertions run against. The Interactions panel (built into Storybook since version 9) replays the steps one by one in the browser, which makes a failure easy to see, and the test runner executes every play function headlessly so they gate CI.

---

**Q7: How do you handle components that need providers (Redux, Router, Theme)?**

Use **decorators** — wrappers that render the story inside the providers it expects — at the narrowest level that covers the components that need them:
- **Global** (preview.ts): For providers every component needs (theme, tooltip). Put them here once rather than repeating them in every file.
- **Component** (meta): For providers specific to a feature, such as a store only the checkout components read.
- **Story**: For context unique to one state — for example, a router starting at a particular URL so the "active link" styling shows.

Wrapping everything globally is tempting, but it hides which components actually depend on which providers, and a real store can leak app state into stories that should be isolated. For Redux, prefer a small store built with mock state over the app's real store.

\`\`\`tsx
// Global: .storybook/preview.ts
decorators: [
  (Story) => <Provider store={store}><Story /></Provider>,
  (Story) => <MemoryRouter><Story /></MemoryRouter>,
]
\`\`\`

---

**Q8: How do you document components with Storybook?**

Three approaches:
1. **Autodocs** — add \`tags: ['autodocs']\` and Storybook generates a docs page from stories + TypeScript types
2. **JSDoc** — add comments to prop interfaces for descriptions
3. **MDX** — write custom documentation pages mixing markdown with live component examples

Autodocs is the fastest. MDX gives full control for design system documentation.

---

**Q9: How does Storybook fit into a CI/CD pipeline?**

Short answer: every pull request builds Storybook, runs its stories as tests, and publishes it, so a broken or visually changed component is caught before merge.

1. **Build check**: \`npm run build-storybook\` — verifies all stories compile. A story that imports a renamed prop or a deleted component fails here even if no test covers it.
2. **Test runner**: \`npx test-storybook\` — renders every story in a headless browser, fails on any render error, and runs the play functions' assertions.
3. **Visual testing**: Chromatic screenshots every story, compares it with the last approved screenshot (the baseline), and blocks the PR until someone accepts or rejects each visual change.
4. **Deploy**: build the static Storybook and host it (S3/Netlify) so reviewers and designers can open the PR's version without running anything.

\`\`\`yaml
# GitHub Actions
- run: npm run build-storybook
- run: npx test-storybook
- run: npx chromatic --project-token=\${{ secrets.CHROMATIC_TOKEN }}
\`\`\`

---

**Q10: What is the difference between args-based and render-based stories?**

- **Args-based**: Simple — pass props via \`args\` object. Storybook renders the component automatically. Best for leaf components (Button, Input, Badge).
- **Render-based**: Custom — provide a \`render\` function that returns JSX. Required for composed components (Dialog with trigger, Dropdown with items, Tabs with panels).

Use args when possible, because args are what the Controls panel edits and what autodocs lists — a \`render\` function that hard-codes its JSX gives the reader nothing to play with. Use render when composition is needed, and even then you can pass \`args\` through to the root component inside it to keep some controls working.

---

### Advanced

---

**Q11: How do you implement visual regression testing with Storybook?**

Short answer: screenshot every story, compare each screenshot with the last approved one (the **baseline**), and make a human accept or reject every difference. Stories suit this well because each is a fixed, reproducible state of one component, so a diff points at exactly one thing rather than a whole page.

1. **Chromatic** (official): Captures screenshots of every story on every PR. Compares with baseline. Shows pixel diffs for review and approval. Integrates with GitHub PRs.

2. **Percy**: Similar to Chromatic, integrates with BrowserStack.

3. **Playwright + Storybook**: Custom approach — navigate to each story URL, take screenshot, compare:
   \`\`\`ts
   test('button', async ({ page }) => {
     await page.goto('/iframe.html?id=ui-button--primary');
     await expect(page).toHaveScreenshot();
   });
   \`\`\`

Chromatic is the easiest — it's built by the Storybook team and requires minimal setup. The part to volunteer is flakiness: animations, the current date, random data and web fonts that load late all produce diffs that are not real changes, so freeze them in the stories (fixed dates, seeded data, animations disabled) or reviewers learn to click "accept" without looking.

---

**Q12: How do you use Storybook for a design system?**

Short answer: Storybook becomes the design system's public website — the place consuming teams go to see what exists, how to use it, and what each prop does — and its stories double as the system's test suite.

1. **Component catalog**: Every UI primitive has stories covering all variants, so a consuming team checks here before building a duplicate.
2. **Autodocs**: Prop tables and usage examples generated from the stories and types, so the docs cannot fall out of date with the code.
3. **Design tokens** (the named values for colour, spacing and type, such as \`color.primary\`): document them in dedicated stories so people use the token rather than a hard-coded hex value.
4. **Composition examples**: Show how primitives combine into patterns (a form row, a card list), because "how do I put these together" is the question a prop table does not answer.
5. **Accessibility**: the a11y addon runs automated checks on every story, catching issues like missing labels or low contrast in the shared component once instead of in every app.
6. **Versioned deployment**: Build and deploy Storybook per release, so a team still on v2 can read the v2 docs.
7. **Figma integration**: Link designs to stories with \`@storybook/addon-designs\`, so the design and the implementation sit side by side in review.
8. **Publish the components as an npm package** alongside it; the Storybook is the documentation consumers read for that package.

---

**Q13: How do you handle mock data and API calls in stories?**

Short answer: keep presentational components fed by props with static mock data, and for components that fetch their own data, intercept the network with MSW rather than mocking your own modules.

1. **Static mock data**: Define mock objects in the story file and pass them as args. This is the simplest option and works for any component that receives its data as props.
2. **MSW (Mock Service Worker)**: a library that registers a service worker to intercept \`fetch\` calls and answer them with mock responses. The component runs its real data-fetching code unchanged; only the network is fake, so the story exercises the same code path as production:
   \`\`\`tsx
   import { http, HttpResponse } from 'msw';

   export const WithData: Story = {
     parameters: {
       msw: {
         handlers: [
           http.get('/api/users', () => {
             return HttpResponse.json([{ id: 1, name: 'Alice' }]);
           }),
         ],
       },
     },
   };
   \`\`\`

   This is the MSW 2 API (\`http\` and \`HttpResponse\`). Older examples use \`rest.get(url, (req, res, ctx) => …)\`, which MSW 2 removed.
3. **Decorators**: Wrap with mocked providers — for example a React Query client or store pre-filled with data, so the component finds its data already cached.
4. **Loaders**: async functions that run before the story renders; their result is passed to \`render\` as \`loaded\`. Useful when mock data must be built asynchronously:
   \`\`\`tsx
   export const WithData: Story = {
     loaders: [async () => ({ users: await fetchMockUsers() })],
     render: (args, { loaded: { users } }) => <UserList users={users} />,
   };
   \`\`\`

---

## References

- [Storybook Documentation](https://storybook.js.org/docs) — Official docs and tutorials
- [Storybook Addons](https://storybook.js.org/addons) — Browse the addon ecosystem
- [Storybook GitHub](https://github.com/storybookjs/storybook) — Source code and community
`;export{n as default};

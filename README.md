# TaskFlow

TaskFlow is a modern, full-featured task management web application built with Next.js and Supabase. It helps you organize work across multiple workspaces, track due dates, prioritize important tasks, and keep everything in sync through a clean, responsive interface with dark mode support.

## Features

- **Dashboard** — Overview cards for total, completed, pending, and overdue tasks, plus a daily progress bar and quick-glance sections for Today, Important, Overdue, and Upcoming tasks.
- **Main Views** — Dedicated pages for Inbox, Today, Upcoming, Overdue, Completed, Important, Recurring, and Archived tasks.
- **Workspaces** — Eight built-in workspaces (Today, Work & Office, Personal Tasks, Study & Learning, Home & Errands, Health & Fitness, Finance & Bills, Travel & Events) plus unlimited custom workspaces with your own name, description, and icon.
- **Task Management** — Create, complete, star, edit, archive, restore, and permanently delete tasks.
- **Due Dates & Recurrence** — Date-based due tracking with smart labels (Today, Tomorrow, Upcoming, Overdue) and daily/weekly/monthly recurring tasks.
- **Archive & Restore** — Deleting a task or workspace moves it to the Archive, where it can be restored or permanently removed.
- **Dark / Light Theme** — System-aware theming with a `D` keyboard shortcut to toggle.
- **Responsive Sidebar** — Collapsible navigation with mobile sheet support and a `B` keyboard shortcut.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, shadcn/ui (Base Nova), Tailwind CSS 4 |
| Primitives | @base-ui/react |
| Backend | Supabase (PostgreSQL) |
| Icons | lucide-react |
| Theming | next-themes |
| Tooling | TypeScript, ESLint, Prettier |

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm
- A Supabase project with the tables described in [Database Schema](#database-schema)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd task-manager
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the project root with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |

## Database Schema

TaskFlow uses the following Supabase tables:

### `tasks`

Active tasks.

| Column | Type | Description |
| --- | --- | --- |
| `id` | number | Primary key (auto-generated) |
| `title` | string | Task title |
| `workspace` | string | Workspace name the task belongs to |
| `due` | string | Due date (`YYYY-MM-DD`) or empty |
| `completed` | boolean | Completion status |
| `starred` | boolean | Important / starred flag |
| `recurring` | string | Recurrence rule (`daily`, `weekly`, `monthly`, or empty) |
| `created_at` | timestamp | Creation time |

### `workspaces`

Built-in and custom workspaces.

| Column | Type | Description |
| --- | --- | --- |
| `id` | string | URL-safe identifier |
| `title` | string | Display name |
| `desc` | string | Description |
| `icon_name` | string | Lucide icon key |
| `is_custom` | boolean | Whether the workspace was user-created |

### `archived_tasks`

Soft-deleted tasks, restorable from the Archived view.

| Column | Type | Description |
| --- | --- | --- |
| `id` | number | Original task ID |
| `title`, `workspace`, `due`, `completed`, `starred`, `recurring` | — | Mirrored task fields |
| `deleted_at` | timestamp | Archive time |

### `archived_workspaces`

Soft-deleted workspaces, restorable from the Archived view.

| Column | Type | Description |
| --- | --- | --- |
| `id`, `title`, `desc`, `icon_name`, `is_custom` | — | Mirrored workspace fields |
| `deleted_at` | timestamp | Archive time |

### `mainview_tasks`

Tasks belonging to a specific main view (Inbox, Today, Upcoming, etc.).

| Column | Type | Description |
| --- | --- | --- |
| `id` | number | Primary key (auto-generated) |
| `title` | string | Task title |
| `view` | string | Main view identifier |
| `workspace` | string | Workspace name |
| `due` | string | Due date |
| `completed` | boolean | Completion status |
| `starred` | boolean | Starred flag |
| `recurring` | string | Recurrence rule |
| `created_at` | timestamp | Creation time |

## Project Structure

```
task-manager/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx            # Root layout (sidebar, theme, fonts)
│   ├── page.tsx              # Dashboard home page
│   ├── mainviews/            # Main views (inbox, today, upcoming, ...)
│   │   ├── inbox/page.tsx
│   │   ├── upcoming/page.tsx
│   │   ├── overdue/page.tsx
│   │   ├── completed/page.tsx
│   │   ├── important/page.tsx
│   │   ├── recurring/page.tsx
│   │   └── archived/page.tsx
│   └── workspace/[id]/       # Dynamic workspace pages
│       └── page.tsx
├── components/
│   ├── app-sidebar.tsx       # Navigation sidebar + workspace creation
│   ├── theme-provider.tsx    # Dark/light theme with "D" hotkey
│   └── ui/                   # shadcn/ui components
├── hooks/
│   └── use-mobile.ts         # Mobile breakpoint hook
├── lib/
│   ├── db.ts                 # All Supabase data operations
│   ├── supabase.ts           # Supabase client
│   ├── due.ts                # Due-date helpers and labels
│   ├── navigation.tsx        # Views, workspaces, icons
│   └── utils.ts              # cn() class utility
├── public/                   # Static assets
└── package.json
```

## Usage

- **Add a task** — Click **Add Task** on the dashboard or any workspace, fill in the title, due date, and repeat option, then submit.
- **Complete or star a task** — Use the checkbox to mark a task done, or the star icon to mark it important.
- **Create a workspace** — In the sidebar, click **Create Workspace**, choose a name, description, and icon, then create it. You are taken directly to the new workspace.
- **Archive** — The trash icon moves a task or workspace to the Archived view instead of deleting it permanently.
- **Restore or delete forever** — Open the Archived view and use **Restore** to bring items back, or the trash icon to permanently delete them.
- **Toggle theme** — Press `D` anywhere outside an input field.
- **Toggle sidebar** — Press `B` or use the sidebar trigger button.

## License

Private project. All rights reserved.

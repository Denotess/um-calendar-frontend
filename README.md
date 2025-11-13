# UM Calendar

A calendar viewer for University of Maribor class schedules. Browse your lectures, exams, and other events in an easy-to-use interface.

## Features

- Month and day views
- Dark mode support
- Responsive design that works on phones and desktops
- Color-coded event types (lectures, exams, exercises, e-learning)
- Quick navigation between dates

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Tech Stack

- Vue 3 with TypeScript
- Vite
- Tailwind CSS
- Pinia for state management

## How It Works

The app fetches `.ics` calendar files from the backend API and parses them to display events. Select your calendar from the dropdown to load your schedule.

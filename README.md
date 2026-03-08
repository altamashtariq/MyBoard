# MyBoard - Fully Functional Kanban Task Management App

A modern, responsive, and fully functional Kanban board built with React, TypeScript, and Tailwind CSS. Features drag-and-drop, dark mode, and local storage persistence.

## Features

- **Drag and Drop**: Move tasks between columns and reorder them with smooth animations (powered by `@dnd-kit`).
- **Dark Mode**: Seamless toggle between light and dark themes.
- **Task Management**: Create, edit, and delete tasks with titles, descriptions, and priority levels.
- **Priority Filtering**: Filter tasks by priority (Urgent, High, Medium, Low).
- **Progress Tracking**: Visual progress bar and task statistics.
- **Persistence**: Automatically saves your board state to `localStorage`.
- **Responsive Design**: Works on desktop, tablet, and mobile.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Drag & Drop**: [@dnd-kit](https://dnd-kit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/myboard.git
   cd myboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000` (or the port shown in your terminal).

## Deployment

To build the project for production:

```bash
npm run build
```

The output will be in the `dist/` folder, which can be hosted on platforms like Vercel, Netlify, or GitHub Pages.

## License

MIT License - feel free to use this project for your own purposes!

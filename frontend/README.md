# AI Animate Frontend

Frontend application for AI Anime Generation System built with Next.js 15 and shadcn/ui.

## Features

- ✅ Next.js 15 with App Router
- ✅ TypeScript support
- ✅ shadcn/ui component library
- ✅ Tailwind CSS styling
- ✅ Real-time WebSocket updates
- ✅ Responsive design

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Home page (novel input)
│   ├── characters/           # Character confirmation page
│   ├── scenes/               # Progress tracking page
│   ├── preview/              # Video preview page
│   └── globals.css           # Global styles
├── components/
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── api.ts                # API client
│   └── utils.ts              # Utility functions
└── package.json              # Dependencies
```

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env.local` from the example:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
npm start
```

## User Workflow

1. **Home Page (`/`)** - Input novel text
2. **Characters Page (`/characters`)** - Review and confirm generated characters
3. **Scenes Page (`/scenes`)** - Monitor generation progress in real-time
4. **Preview Page (`/preview`)** - View final generated video

## API Integration

The frontend communicates with the backend API through:

- **REST endpoints** for CRUD operations
- **WebSocket** for real-time progress updates

See `lib/api.ts` for API client implementation.

## Styling

The project uses:

- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for pre-built accessible components
- **CSS Variables** for theming (light/dark mode support)

## Development

### Adding New Components

Use shadcn/ui CLI to add components:

```bash
npx shadcn-ui@latest add [component-name]
```

### Code Quality

```bash
npm run lint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Copyright © 2025 AI Animate Team

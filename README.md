# Beat Map Dashboard

A personal dashboard for analyzing audio locally in the browser and storing rhythm fingerprints in Supabase.

## Setup

1. Copy `.env.example` to `.env.local` and adjust values if needed.
2. Install dependencies with `npm install` (or `pnpm install`).
3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000/beat-map](http://localhost:3000/beat-map) to use the interface.

## Features

- Upload an audio file and analyze its BPM and groove vector entirely client side.
- Save extracted pattern data to Supabase without uploading the audio file.
- View all stored patterns from the dashboard.

This project uses [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/).

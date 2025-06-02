# Beat Fingerprint Dashboard

A personal dashboard for analyzing audio files in the browser to extract beat structures, generate beat pattern "fingerprints," and categorize grooves. All processing is done locally in the browser - no audio files are uploaded or stored. Only the metadata (BPM, pattern vectors, labels) is saved to Supabase.

## Features

- Upload or drag-and-drop audio tracks for analysis
- Analyze each song's beat structure (BPM, groove vector) locally in-browser
- Automatically assign groove labels using similarity detection
- Store only the extracted pattern vector, BPM, and label metadata in Supabase
- Search and filter patterns by BPM, label, or date
- View detailed information about each pattern
- Edit pattern labels and manage your pattern database

## Privacy & Security

- No audio files are ever uploaded or persisted - all processing happens locally
- Only beat metadata is stored in the database
- Fast, efficient in-browser processing

## Technologies Used

- **Frontend**: Next.js (App Router) with TypeScript + Tailwind CSS
- **In-browser DSP**: Custom Web Audio API implementation for beat detection and pattern extraction
- **Database**: Supabase (PostgreSQL + REST API)
- **State Management**: React hooks

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy `.env.local.example` to `.env.local` and update with your Supabase credentials
4. Create the required table in your Supabase database (SQL in `.env.local.example`)
5. Run the development server: `pnpm run dev`
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Supabase Setup

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Run the SQL in `.env.local.example` in the Supabase SQL editor to create the necessary table
3. Copy your project URL and anon key to `.env.local`

## Local Development

```bash
pnpm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## How It Works

1. Audio is analyzed in the browser using the Web Audio API
2. Beat detection algorithms extract the tempo and rhythm patterns
3. Pattern vectors are compared to existing patterns to find similarities
4. Patterns are labeled automatically or manually by the user
5. Only metadata is stored in Supabase for future reference and search

## Future Improvements

- Improved beat detection algorithms
- Machine learning for groove categorization
- Visual similarity maps using UMAP or t-SNE
- Section-level groove detection (intro, verse, chorus, etc.)
- User accounts and sharing capabilities

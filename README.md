# Eloquent - AI Speech Coach

A zero-cost MVP for an AI-powered speech coach that reduces word repetition through real-time feedback and practice drills.

## Features

### Core Features
- **60-second Practice Drills** - Timed speaking exercises with live transcription
- **Word Repetition Detection** - Real-time analysis of repeated words
- **Progress Dashboard** - Track fluency scores and improvement over time
- **User Authentication** - Secure user profiles with Supabase Auth
- **Speech Recognition** - Browser-native Web Speech API (Chrome/Edge/Safari)

### SaaS Features
- **Multi-Language Support** - English, Urdu, Arabic, Spanish, French, German, Hindi, Chinese, Japanese, Korean
- **Tiered Pricing Plans** - Free, Pro ($9.99/month), Team ($29.99/month)
- **AI-Powered Insights** - Gemini AI analysis for advanced speech coaching
- **Usage Tracking & Limits** - Smart usage management with upgrade prompts
- **Advanced Analytics** - Detailed progress tracking and personalized insights
- **Custom Practice Topics** - AI-generated topics based on difficulty and category
- **Team Management** - Multi-user accounts for organizations
- **Export Features** - PDF/CSV progress reports
- **RTL Language Support** - Proper right-to-left text rendering for Arabic/Urdu

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Speech-to-Text**: Web Speech API (free, browser-native)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Netlify (free tier)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd eloquent-app
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env` and add your credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_free_gemini_api_key
```

4. Get your free Gemini API key:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a free API key
   - Add it to your `.env` file

### 3. Set up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL to create the database schema

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## Browser Compatibility

The app uses the Web Speech API which requires:
- **Chrome** (recommended)
- **Edge** 
- **Safari** (limited support)
- **Firefox** (not supported)

## Deployment

### Netlify (Free)

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard
4. Enable continuous deployment from your Git repository

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Usage

1. **Sign Up/Sign In** - Create an account or log in
2. **Start Practice** - Click "Practice" and begin a 60-second drill
3. **Speak Naturally** - Talk about any topic while the app transcribes
4. **View Results** - See your repetition analysis and fluency score
5. **Track Progress** - Monitor improvement over time in the dashboard

## Key Metrics

- **Fluency Score**: 0-100 based on repetition rate (higher is better)
- **Repetition Rate**: Percentage of words that are repeated
- **Word Count**: Total words spoken in the session
- **Trend Analysis**: Improvement tracking over multiple sessions

## Cost Breakdown (Free Tier Limits)

- **Netlify**: 100GB bandwidth, 300 build minutes/month
- **Supabase**: 500MB database, 50K users, 1GB storage
- **Web Speech API**: Completely free (browser-native)
- **Total Monthly Cost**: $0

## Development Roadmap

### Phase 1 ✅ (Weeks 1-2)
- [x] Basic recording interface with Web Speech API
- [x] Word repetition detection algorithm
- [x] Supabase auth and user profiles
- [x] Practice drill component

### Phase 2 🚧 (Weeks 3-4)
- [x] Progress dashboard with charts
- [x] Practice history and analytics
- [ ] Enhanced transcription accuracy
- [ ] Mobile responsiveness improvements

### Future Enhancements
- Real-time repetition highlighting during speech
- Custom practice topics and prompts
- Export progress reports
- Social features and challenges
- Advanced speech analysis (pace, pauses, filler words)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project as a starting point for your own speech coaching app!
# 🚀 NextGenLAB Space Bio Explorer (NASA 2025 Challenge)

> Standalone Next.js application for exploring NASA Space Bioscience publications with AI-powered summarization and Q&A.

## ✨ Features

- 🔍 **Search 608 Publications**: Semantic search across NASA space bioscience research
- 🤖 **AI-Powered Summaries**: Generate structured summaries with AI
- 💬 **Q&A System**: Ask questions about specific publications
- 🕸️ **Knowledge Graph**: Interactive visualization (3,107 nodes, 40,967 edges)
- 📊 **Analytics Dashboard**: Trends, gaps, and consensus analysis
- 🌍 **Multi-Language Support**: Turkish and English interface

## 🏗️ Architecture

### Frontend (Next.js 15 + React 19)
- **Location**: `/ui` directory
- **Framework**: Next.js 15 with Turbopack
- **Deployment**: Vercel (standalone, no backend required)
- **API Routes**: 8 serverless endpoints

### Data Sources
- **Publications**: 608 NASA space bioscience papers from [SB_publications](https://github.com/jgalazka/SB_publications)
- **Knowledge Graph**: Pre-built graph data (nodes.json, edges.json)
- **External APIs**: OSDR, NSLSL, Task Book (linked)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API Key

### Local Development

1. **Clone and Install**
```bash
git clone https://github.com/RiosenBeq/NASA.git
cd NASA/ui
npm install
```

2. **Configure Environment**
```bash
# Create .env.local file
echo "OPENAI_API_KEY=your_key_here" > .env.local
```

3. **Run Development Server**
```bash
npm run dev
# Open http://localhost:3000
```

### Build for Production
```bash
npm run build
npm start
```

## 📦 Vercel Deployment

### One-Time Setup

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Root Directory**: `ui`
3. **Add Environment Variable**:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key from https://platform.openai.com/api-keys

### Deploy
```bash
git push origin main
# Vercel auto-deploys on push
```

## 📁 Project Structure

```
NASA/
├── ui/                           # Next.js application (Vercel root)
│   ├── src/
│   │   ├── app/                  # Pages and API routes
│   │   │   ├── api/              # 8 serverless endpoints
│   │   │   ├── analytics/        # Analytics dashboard
│   │   │   ├── scientist/        # Scientist dashboard
│   │   │   ├── guidelines/       # Search guidelines
│   │   │   └── resources/        # NASA resources
│   │   └── components/           # React components
│   └── public/
│       └── kg_data/              # Knowledge Graph data (916KB)
├── data/                         # Raw data and KG source
├── services/                     # Backend services (optional)
└── README.md                     # This file
```

## 🔌 API Endpoints

| Endpoint | Description | Type |
|----------|-------------|------|
| `/api/search` | Search publications | Dynamic |
| `/api/summarize` | Generate AI summary | Dynamic |
| `/api/qa` | Answer questions | Dynamic |
| `/api/kg/nodes` | KG nodes data | Static (1h cache) |
| `/api/kg/edges` | KG edges data | Static (1h cache) |
| `/api/kg/stats` | KG statistics | Static (1h cache) |
| `/api/kg/year_counts` | Publications by year | Dynamic |
| `/api/health` | Health check | Dynamic |

## 📊 Data Statistics

- **Publications**: 608 NASA space bioscience papers
- **KG Nodes**: 3,107 (Article, Experiment, Project, etc.)
- **KG Edges**: 40,967 (DESCRIBES, INVOLVES, OBSERVES, etc.)
- **Total Size**: 916KB uncompressed, ~48KB gzipped

## 🔗 Resources

- **Publications Source**: [SB_publications](https://github.com/jgalazka/SB_publications)
- **OSDR**: [Open Science Data Repository](https://www.nasa.gov/osdr/)
- **NSLSL**: [NASA Space Life Sciences](https://public.ksc.nasa.gov/nslsl/)
- **Task Book**: [NASA Task Book](https://taskbook.nasaprs.com/tbp/welcome.cfm)

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS (inline styles)
- **AI**: OpenAI GPT-4o-mini
- **Visualization**: Cytoscape.js (Knowledge Graph)
- **Deployment**: Vercel (serverless)
- **Build**: Turbopack

## 📝 Notes

- **Standalone Mode**: No backend required, all features work via serverless functions
- **Data Freshness**: CSV pulled from GitHub on each search
- **Caching**: KG data cached for 1 hour, revalidated as needed
- **Security**: No vulnerabilities (npm audit clean)

## 📄 License

NASA Challenge Project 2025

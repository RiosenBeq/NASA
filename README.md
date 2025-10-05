<div align="center">

# 🚀 NextGenLAB Space Bioscience Explorer

**AI-Powered Research Platform for NASA Space Biology**

[![NASA Space Apps Challenge](https://img.shields.io/badge/NASA-Space%20Apps%202025-0B3D91?style=flat-square&logo=nasa)](https://www.spaceappschallenge.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=flat-square&logo=vercel)](https://nasa-hazel.vercel.app/)

**[🌐 Live Demo](https://nasa-hazel.vercel.app/)**

Transforming 608 NASA space biology publications into actionable insights through AI-powered analysis, semantic search, and interactive knowledge graphs.

</div>

---

## ⚡ Overview

AI-powered platform that makes NASA's space biology research accessible and understandable. Search 608 publications, generate comprehensive AI summaries, ask questions, and explore connections through an interactive knowledge graph.

## ✨ Features

- **🔍 Semantic Search** - Search 608 NASA publications with natural language queries
- **🤖 AI Summaries** - Generate 600-1000 word summaries using GPT-4o-mini
- **💬 Q&A System** - Ask questions about publications with full article analysis
- **🕸️ Knowledge Graph** - Explore 3,107 nodes and 40,967 connections interactively
- **📊 Analytics** - Research trends, gaps, and consensus analysis
- **🌍 Multi-language** - Full Turkish and English support
- **🤖 AI Assistant** - Floating chatbot to help navigate the platform
- **📱 Mobile Responsive** - Optimized for all devices

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/RiosenBeq/NASA.git
cd NASA/ui

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Add your OpenAI API key to .env.local

# Run development server
npm run dev
# Open http://localhost:3000
```

**Requirements**: Node.js 18+, OpenAI API Key ([get one](https://platform.openai.com/api-keys))

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Custom CSS with Glassmorphism
- **AI**: OpenAI GPT-4o-mini
- **Visualization**: Cytoscape.js, Cola.js
- **Deployment**: Vercel (Serverless)
- **Data**: NASA OSDR, NCBI PMC, Task Book

## 📊 Data

- **608 Publications** - NASA space biology research (1970-2024)
- **3,107 Knowledge Graph Nodes** - Publications, Experiments, Organisms, Projects
- **40,967 Knowledge Graph Edges** - Entity relationships
- **143 OSDR Links** - Open Science Data Repository integration
- **89 TaskBook Links** - Funded NASA projects

**Sources**: [NASA OSDR](https://osdr.nasa.gov/) • [NCBI PMC](https://www.ncbi.nlm.nih.gov/pmc/) • [Task Book](https://taskbook.nasaprs.com/) • [SB_publications](https://github.com/jgalazka/SB_publications)

## 🚀 Deployment

### Vercel (Recommended)

1. Import repository to [Vercel](https://vercel.com/)
2. Set root directory to `ui`
3. Add `OPENAI_API_KEY` environment variable
4. Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for other platforms.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for NASA Space Apps Challenge 2025**

[🌐 Live Demo](https://nasa-hazel.vercel.app/) • [📖 Documentation](DEPLOYMENT.md) • [🐛 Issues](https://github.com/RiosenBeq/NASA/issues)

</div>

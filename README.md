# NextGenLAB Space Bio Explorer (NASA 2025 Challenge)

Klasor yapisi:

- `data/` – CSV/PDF/JSON gibi ham/veri dosyalari
- `services/` – Backend ve yardimci servisler
- `frontend/` – React (dashboard) arayuzu
- `ui/` – Next.js 15 uygulamasi (Vercel root burasi)

Kaynaklar:
- 608 yayin: https://github.com/jgalazka/SB_publications/tree/main
- OSDR: https://www.nasa.gov/osdr/
- NSLSL: https://public.ksc.nasa.gov/nslsl/
- Task Book: https://taskbook.nasaprs.com/tbp/welcome.cfm

Plan (sirayla):
1) CSV indirme ve `data/` altina kaydetme
2) Metin isleme ve embedding (FAISS veya pgvector alternatifi)
3) FastAPI backend (arama + ChatGPT ile ozet)
4) Frontend (React dashboard)

Durum:
- Vercel icin monorepo root: `ui`
- UI icinde serverless API endpoint’leri mevcut: `/api/health`, `/api/search`, `/api/summarize`, `/api/qa`
- Backend icin Render blueprint: `render.yaml`

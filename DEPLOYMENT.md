# 🚀 Deployment Bilgileri

## ✅ Aktif Deployment

**Production URL:** https://nasa-space-bio.vercel.app

**Vercel Dashboard:** https://vercel.com/okans-projects-fcf7250e/nasa-space-bio

**GitHub Repository:** https://github.com/RiosenBeq/NASA

## 📊 Deployment Durumu

- ✅ Build: Başarılı
- ✅ Deploy: Production'da canlı
- ✅ Routes: Tüm route'lar çalışıyor
- ✅ API Endpoints: 8/8 aktif
- ✅ SSL: Otomatik (Vercel)

## 🔄 Otomatik Deploy

Her `main` branch'e push yapıldığında Vercel otomatik olarak deploy eder.

```bash
git add .
git commit -m "chore: Update"
git push origin main
# Vercel otomatik deploy başlatır
```

## 🔧 Manuel Deploy (Gerekirse)

```bash
cd ui
vercel --prod
```

## 📝 Environment Variables

Vercel Dashboard'da ayarlanması gereken:

- `OPENAI_API_KEY`: OpenAI API anahtarınız (https://platform.openai.com/api-keys)

**Ayarlama Adımları:**
1. https://vercel.com/okans-projects-fcf7250e/nasa-space-bio/settings/environment-variables
2. "Add New" tıklayın
3. Key: `OPENAI_API_KEY`
4. Value: API anahtarınızı girin
5. Environment: Production seçin
6. Save

## 📦 Project Details

- **Project ID:** prj_khjFlBq1MY70J8SltvziAhbTlTSM
- **Organization:** team_O68Gg1d3sCARq0v1ojLSthxH
- **Framework:** Next.js 15.5.3
- **Node Version:** 18.18.0+
- **Build Command:** `npm run build`
- **Root Directory:** `ui`

## 🔗 Önemli URL'ler

- **Ana Sayfa:** https://nasa-space-bio.vercel.app
- **Analytics:** https://nasa-space-bio.vercel.app/analytics
- **Guidelines:** https://nasa-space-bio.vercel.app/guidelines
- **Resources:** https://nasa-space-bio.vercel.app/resources
- **Health Check:** https://nasa-space-bio.vercel.app/api/health

## 📊 API Endpoints

| Endpoint | Durum | Açıklama |
|----------|-------|----------|
| `/api/search` | ✅ | Publikasyon arama |
| `/api/summarize` | ✅ | AI özet oluşturma |
| `/api/qa` | ✅ | Soru-cevap sistemi |
| `/api/kg/nodes` | ✅ | Knowledge Graph düğümleri |
| `/api/kg/edges` | ✅ | Knowledge Graph kenarları |
| `/api/kg/stats` | ✅ | İstatistikler |
| `/api/kg/year_counts` | ✅ | Yıllara göre sayım |
| `/api/health` | ✅ | Sistem sağlık kontrolü |

## 🎯 Son Deploy Bilgileri

- **Tarih:** 2 Ekim 2025
- **Build Süresi:** 45 saniye
- **Deploy Süresi:** 8 saniye
- **Total Size:** 115 KB (First Load JS)
- **Statik Sayfalar:** 13/13 başarılı

## 🔍 Sorun Giderme

### Build Başarısız Olursa:

```bash
cd ui
npm install
npm run build
# Hataları kontrol edin
```

### Environment Variables Eksikse:

1. Vercel Dashboard → Settings → Environment Variables
2. `OPENAI_API_KEY` ekleyin
3. Redeploy yapın

### Cache Sorunları:

```bash
cd ui
rm -rf .next node_modules .vercel
npm install
vercel --prod
```

## 📞 Destek

Sorun yaşarsanız:
1. Build loglarını kontrol edin: https://vercel.com/okans-projects-fcf7250e/nasa-space-bio
2. GitHub Issues açın: https://github.com/RiosenBeq/NASA/issues
3. Vercel Support: https://vercel.com/support


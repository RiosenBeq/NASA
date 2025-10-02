"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function FAQPage() {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = {
    tr: [
      {
        question: "NextGenLAB Space Bioscience Explorer nedir?",
        answer: "NextGenLAB, NASA uzay biyobilim araştırmalarını keşfetmek için tasarlanmış yapay zeka destekli bir platformdur. 608 bilimsel yayını semantik arama, otomatik özetleme ve soru-cevap özellikleriyle erişilebilir hale getirir."
      },
      {
        question: "Platform nasıl çalışır?",
        answer: "Platform, doğal dil işleme ve semantik arama teknolojileri kullanarak NASA'nın uzay biyobilim yayınlarını analiz eder. Anahtar kelimelerinize göre ilgili makaleleri bulur, yapay zeka ile özetler oluşturur ve sorularınızı makale bazlı olarak yanıtlar."
      },
      {
        question: "Kaç adet yayın mevcut?",
        answer: "Platformda toplam 608 NASA uzay biyobilim yayını bulunmaktadır. Tüm yayınlar PubMed Central (PMC) veritabanından alınmıştır ve sürekli güncellenmektedir."
      },
      {
        question: "Yapay zeka özelliklerini nasıl kullanabilirim?",
        answer: "İki temel AI özelliğimiz var:\n\n1. **Özetle**: Bir veya birden fazla makaleyi seçip 'Özetle' butonuna tıklayarak kapsamlı bir özet alabilirsiniz.\n\n2. **Soru-Cevap**: Makale kartlarında soru kutusuna sorunuzu yazıp Enter'a basarak o makale hakkında spesifik sorular sorabilirsiniz. 'Tek cümleyle özetle' veya 'kısaca açıkla' gibi talimatlar verebilirsiniz."
      },
      {
        question: "Soru-cevap özelliği nasıl çalışır?",
        answer: "Soru-cevap sistemi, seçtiğiniz makaleye özel olarak çalışır. Sorunuzu yazdığınızda, yapay zeka o makalenin başlığını ve içeriğini analiz ederek size spesifik bir cevap verir. 'Kısa', 'özetle' veya 'tek cümle' gibi ifadeler kullanırsanız kısa cevap, detaylı sorular sorarsanız kapsamlı açıklama alırsınız."
      },
      {
        question: "Knowledge Graph nedir?",
        answer: "Knowledge Graph (Bilgi Grafiği), yayınlar arasındaki ilişkileri görselleştirir. 3,107 düğüm (node) ve 40,967 bağlantı (edge) ile makaleler, deneyler, organizmalar ve projeler arasındaki bağlantıları keşfedebilirsiniz."
      },
      {
        question: "Analytics sayfasında ne gibi bilgiler bulabilirim?",
        answer: "Analytics sayfası, veri setimiz hakkında kapsamlı istatistikler sunar:\n- Toplam düğüm ve bağlantı sayıları\n- Düğüm tipi dağılımları\n- Bağlantı türleri\n- Yıllara göre yayın sayıları\n- Zaman çizelgesi analizi"
      },
      {
        question: "Arama sonuçları nasıl sıralanır?",
        answer: "Arama sonuçları, semantik benzerlik skoruna göre sıralanır. Sistem, anahtar kelimelerinizle en alakalı makaleleri önce gösterir. Yüksek skor değeri, sorgunuzla makalenin daha yüksek ilişkisi olduğunu gösterir."
      },
      {
        question: "Dil değiştirme özelliği var mı?",
        answer: "Evet! Tüm sayfalarda header'da bulunan dil seçiciden Türkçe (🇹🇷) ve İngilizce (🇬🇧) arasında geçiş yapabilirsiniz. Dil değişikliği anında tüm sayfayı etkiler."
      },
      {
        question: "Makalelere nasıl erişebilirim?",
        answer: "Her makale kartında 'PMC Source' butonu bulunur. Bu butona tıklayarak makalenin orijinal PubMed Central sayfasına gidebilirsiniz. Ayrıca OSDR, Task Book ve NSLSL gibi NASA kaynaklarına da hızlı erişim linkleri sunuyoruz."
      },
      {
        question: "Platform mobil uyumlu mu?",
        answer: "Evet, platform responsive tasarıma sahiptir ve tüm cihazlarda (masaüstü, tablet, mobil) sorunsuz çalışır."
      },
      {
        question: "Veri kaynağı nedir?",
        answer: "Tüm yayın verileri NASA'nın resmi kaynaklarından ve PubMed Central (PMC) veritabanından alınmaktadır. Yayın yılları PubMed E-utilities API kullanılarak otomatik olarak güncellenir."
      },
      {
        question: "Hangi teknolojiler kullanılıyor?",
        answer: "Platform şu teknolojilerle geliştirilmiştir:\n- **Frontend**: Next.js 15, React 19, TypeScript\n- **AI**: OpenAI GPT-3.5-turbo\n- **Search**: Semantik arama, pgvector\n- **Deployment**: Vercel\n- **Data**: PubMed Central, NASA OSDR"
      },
      {
        question: "Özetle özelliği ne kadar makaleyi destekler?",
        answer: "Tek seferde birden fazla makaleyi seçerek toplu özet alabilirsiniz. Sistem, seçtiğiniz makaleleri analiz ederek kapsamlı bir karşılaştırmalı özet oluşturur."
      },
      {
        question: "API erişimi mevcut mu?",
        answer: "Şu anda public API erişimi sunulmamaktadır. Platform, web arayüzü üzerinden kullanılmak üzere tasarlanmıştır."
      }
    ],
    en: [
      {
        question: "What is NextGenLAB Space Bioscience Explorer?",
        answer: "NextGenLAB is an AI-powered platform designed to explore NASA space bioscience research. It makes 608 scientific publications accessible through semantic search, automatic summarization, and Q&A features."
      },
      {
        question: "How does the platform work?",
        answer: "The platform uses natural language processing and semantic search technologies to analyze NASA's space bioscience publications. It finds relevant articles based on your keywords, generates AI-powered summaries, and answers your questions on a per-article basis."
      },
      {
        question: "How many publications are available?",
        answer: "The platform contains a total of 608 NASA space bioscience publications. All publications are sourced from PubMed Central (PMC) database and are continuously updated."
      },
      {
        question: "How can I use AI features?",
        answer: "We have two main AI features:\n\n1. **Summarize**: Select one or more articles and click the 'Summarize' button to get a comprehensive summary.\n\n2. **Q&A**: Type your question in the question box on article cards and press Enter to ask specific questions about that article. You can give instructions like 'summarize in one sentence' or 'briefly explain'."
      },
      {
        question: "How does the Q&A feature work?",
        answer: "The Q&A system works specifically for the article you select. When you type your question, the AI analyzes that article's title and content to give you a specific answer. If you use terms like 'brief', 'summarize', or 'one sentence', you get a short answer; for detailed questions, you get comprehensive explanations."
      },
      {
        question: "What is the Knowledge Graph?",
        answer: "The Knowledge Graph visualizes relationships between publications. With 3,107 nodes and 40,967 edges, you can explore connections between articles, experiments, organisms, and projects."
      },
      {
        question: "What information can I find on the Analytics page?",
        answer: "The Analytics page provides comprehensive statistics about our dataset:\n- Total node and edge counts\n- Node type distributions\n- Edge relation types\n- Publication counts by year\n- Timeline analysis"
      },
      {
        question: "How are search results ranked?",
        answer: "Search results are ranked by semantic similarity score. The system shows the most relevant articles first based on your keywords. A higher score value indicates a stronger relationship with your query."
      },
      {
        question: "Is there a language switching feature?",
        answer: "Yes! You can switch between Turkish (🇹🇷) and English (🇬🇧) using the language selector in the header on all pages. Language changes affect the entire page instantly."
      },
      {
        question: "How can I access the articles?",
        answer: "Each article card has a 'PMC Source' button. Click this button to go to the article's original PubMed Central page. We also provide quick access links to NASA resources like OSDR, Task Book, and NSLSL."
      },
      {
        question: "Is the platform mobile-friendly?",
        answer: "Yes, the platform has a responsive design and works seamlessly on all devices (desktop, tablet, mobile)."
      },
      {
        question: "What is the data source?",
        answer: "All publication data is sourced from NASA's official resources and the PubMed Central (PMC) database. Publication years are automatically updated using the PubMed E-utilities API."
      },
      {
        question: "What technologies are used?",
        answer: "The platform is built with:\n- **Frontend**: Next.js 15, React 19, TypeScript\n- **AI**: OpenAI GPT-3.5-turbo\n- **Search**: Semantic search, pgvector\n- **Deployment**: Vercel\n- **Data**: PubMed Central, NASA OSDR"
      },
      {
        question: "How many articles does the Summarize feature support?",
        answer: "You can select multiple articles at once to get a batch summary. The system analyzes your selected articles and creates a comprehensive comparative summary."
      },
      {
        question: "Is API access available?",
        answer: "Public API access is not currently available. The platform is designed to be used through the web interface."
      }
    ]
  };

  const content = lang === "tr" ? faqData.tr : faqData.en;
  const pageTitle = lang === "tr" ? "Sıkça Sorulan Sorular" : "Frequently Asked Questions";
  const pageSubtitle = lang === "tr" ? "PLATFORM HAKKINDA HER ŞEY" : "EVERYTHING ABOUT THE PLATFORM";

  return (
    <>
      <div style={{ minHeight: "100vh", position: "relative", background: "linear-gradient(135deg, #0f0824 0%, #1a0f3d 50%, #0f0824 100%)" }}>
        <div className="starfield" aria-hidden="true" />

        {/* Header */}
        <header className="glass-card" style={{ position: "sticky", top: 0, zIndex: 1000, borderRadius: 0, marginBottom: 0 }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <Image src="/logo.png" alt="NextGenLAB Logo" width={32} height={32} className="glow" />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div className="text-gradient" style={{ fontWeight: 900, fontSize: 22, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
                  {pageTitle}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: 2, fontWeight: 500, whiteSpace: "nowrap" }}>{pageSubtitle}</div>
              </div>
            </Link>

            <nav style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <Link href="/" className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                {lang === "tr" ? "Ana Sayfa" : "Home"}
              </Link>
              <Link href="/analytics" className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                {lang === "tr" ? "Analitik" : "Analytics"}
              </Link>
              <Link href="/guidelines" className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                {lang === "tr" ? "Kılavuz" : "Guidelines"}
              </Link>
              <Link href="/resources" className="btn-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                {lang === "tr" ? "Kaynaklar" : "Resources"}
              </Link>

              <select value={lang} onChange={(e) => setLang(e.target.value as "tr" | "en")} style={{ fontSize: 13, fontWeight: 500, minWidth: 60 }}>
                <option value="tr">🇹🇷</option>
                <option value="en">🇬🇧</option>
              </select>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h1 className="text-gradient" style={{ fontSize: 42, fontWeight: 900, marginBottom: 16 }}>
              {lang === "tr" ? "❓ Sıkça Sorulan Sorular" : "❓ Frequently Asked Questions"}
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto" }}>
              {lang === "tr" 
                ? "Platform hakkında merak ettiğiniz her şey. Sorunuza cevap bulamadıysanız, lütfen bizimle iletişime geçin."
                : "Everything you need to know about the platform. If you can't find an answer, please contact us."}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {content.map((faq, index) => (
              <div 
                key={index} 
                className="glass-card" 
                style={{ 
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: openIndex === index ? "2px solid rgba(167, 139, 250, 0.6)" : "1px solid rgba(167, 139, 250, 0.2)"
                }}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <h3 style={{ 
                    fontSize: 18, 
                    fontWeight: 700, 
                    color: "var(--text-primary)", 
                    margin: 0,
                    flex: 1
                  }}>
                    {faq.question}
                  </h3>
                  <div style={{ 
                    fontSize: 24, 
                    color: "var(--nebula-purple)",
                    transition: "transform 0.3s ease",
                    transform: openIndex === index ? "rotate(180deg)" : "rotate(0deg)"
                  }}>
                    ▼
                  </div>
                </div>

                {openIndex === index && (
                  <div style={{ 
                    padding: "0 24px 24px 24px",
                    borderTop: "1px solid rgba(167, 139, 250, 0.2)",
                    paddingTop: 16
                  }}>
                    <p style={{ 
                      fontSize: 15, 
                      lineHeight: 1.7, 
                      color: "var(--text-secondary)",
                      margin: 0,
                      whiteSpace: "pre-line"
                    }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="glass-card" style={{ marginTop: 48, padding: 32, textAlign: "center" }}>
            <h2 className="text-gradient" style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
              {lang === "tr" ? "Başka Sorularınız mı Var?" : "Have More Questions?"}
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 24 }}>
              {lang === "tr" 
                ? "Cevabını bulamadığınız sorular için bizimle iletişime geçebilirsiniz."
                : "Feel free to contact us if you have any questions that aren't answered here."}
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/" className="btn-primary" style={{ fontSize: 14 }}>
                {lang === "tr" ? "🏠 Ana Sayfaya Dön" : "🏠 Back to Home"}
              </Link>
              <Link href="/guidelines" className="btn-secondary" style={{ fontSize: 14 }}>
                {lang === "tr" ? "📖 Kullanım Kılavuzu" : "📖 User Guide"}
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(167, 139, 250, 0.2)", marginTop: 80 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
              <Image src="/logo.png" alt="NextGenLAB Logo" width={28} height={28} className="glow" />
              <span className="text-gradient" style={{ fontWeight: 700, fontSize: 16 }}>NextGenLAB Space Bioscience Explorer</span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>608 NASA Publications • Real-time AI Analysis • Knowledge Graph Visualization</div>
          </div>
        </footer>
      </div>
    </>
  );
}


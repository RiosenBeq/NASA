"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function FAQPage() {
  const [lang, setLang] = useState<"tr" | "en">("en");
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
        answer: "Platformumuz yapay zeka ile güçlendirilmiştir ve iki temel özellik sunar:\n\n1. **Özetle**: Bir veya birden fazla makaleyi seçip 'Özetle' butonuna tıklayarak yapay zeka destekli kapsamlı özetler alabilirsiniz. AI, makaleleri analiz ederek ana bulguları, metodolojileri ve sonuçları sizin için özetler.\n\n2. **Soru-Cevap**: Makale kartlarında soru kutusuna sorunuzu yazıp Enter'a basarak yapay zeka ile o makale hakkında konuşabilirsiniz. 'Tek cümleyle özetle' veya 'kısaca açıkla' gibi talimatlar verebilirsiniz ve AI buna göre cevap verir."
      },
      {
        question: "Soru-cevap özelliği nasıl çalışır?",
        answer: "Soru-cevap sistemimiz yapay zeka tabanlıdır ve seçtiğiniz makaleye özel olarak çalışır. Sorunuzu yazdığınızda, AI o makalenin başlığını ve içeriğini anlayarak size anlaşılır ve bilgilendirici bir cevap verir. İstediğiniz cevap uzunluğunu belirtebilirsiniz:\n\n- 'Kısa', 'özetle', 'tek cümle' → Kısa ve öz cevap\n- Detaylı soru → Kapsamlı ve derinlemesine açıklama\n\nYapay zeka, bilimsel içeriği herkesin anlayabileceği bir dille sunar."
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
        question: "Yapay zeka nasıl kullanılıyor?",
        answer: "Platform, yapay zeka teknolojisini bilimsel makaleleri anlaşılır hale getirmek için kullanır. AI sistemi:\n\n- Makaleleri okuyup ana bulguları çıkarır\n- Sorularınızı anlayıp ilgili bilgileri bulur\n- Karmaşık bilimsel kavramları basit dille açıklar\n- Birden fazla makaleyi karşılaştırarak kapsamlı özetler oluşturur\n\nYapay zeka, sizin araştırma asistanınız gibi çalışarak zaman kazandırır ve bilimsel içeriği daha erişilebilir kılar."
      },
      {
        question: "Özetle özelliği ne kadar makaleyi destekler?",
        answer: "Tek seferde istediğiniz kadar makaleyi seçerek toplu özet alabilirsiniz. Yapay zeka sistemi, seçtiğiniz tüm makaleleri analiz ederek kapsamlı bir karşılaştırmalı özet oluşturur. Bu sayede birden fazla çalışmayı tek seferde gözden geçirebilir ve aralarındaki bağlantıları görebilirsiniz."
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
        answer: "Our platform is powered by artificial intelligence and offers two main features:\n\n1. **Summarize**: Select one or more articles and click 'Summarize' to get AI-powered comprehensive summaries. The AI analyzes articles and extracts key findings, methodologies, and results for you.\n\n2. **Q&A**: Type your question in the question box on article cards and press Enter to chat with AI about that article. You can give instructions like 'summarize in one sentence' or 'briefly explain', and the AI responds accordingly."
      },
      {
        question: "How does the Q&A feature work?",
        answer: "Our Q&A system is AI-powered and works specifically for the article you select. When you type your question, AI understands that article's title and content to give you clear and informative answers. You can specify your preferred answer length:\n\n- 'Brief', 'summarize', 'one sentence' → Short and concise answer\n- Detailed question → Comprehensive and in-depth explanation\n\nArtificial intelligence presents scientific content in language everyone can understand."
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
        question: "How is artificial intelligence used?",
        answer: "The platform uses artificial intelligence technology to make scientific articles more accessible. The AI system:\n\n- Reads articles and extracts key findings\n- Understands your questions and finds relevant information\n- Explains complex scientific concepts in simple language\n- Creates comprehensive summaries by comparing multiple articles\n\nArtificial intelligence works like your research assistant, saving you time and making scientific content more accessible."
      },
      {
        question: "How many articles does the Summarize feature support?",
        answer: "You can select as many articles as you want at once to get a batch summary. The AI system analyzes all your selected articles and creates a comprehensive comparative summary. This way, you can review multiple studies at once and see the connections between them."
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
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", minWidth: 0, flex: "1 1 auto" }}>
              <Image src="/logo.png" alt="NextGenLAB Logo" width={28} height={28} className="glow" style={{ flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <div className="text-gradient" style={{ fontWeight: 900, fontSize: "clamp(14px, 3vw, 22px)", letterSpacing: 0.3, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {pageTitle}
                </div>
                <div style={{ fontSize: "clamp(9px, 1.8vw, 11px)", color: "var(--text-secondary)", letterSpacing: "clamp(0.5px, 0.3vw, 2px)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>{pageSubtitle}</div>
              </div>
            </Link>

            <nav style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 16px)", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Link href="/" className="btn-secondary" style={{ fontSize: "clamp(11px, 2vw, 13px)", padding: "8px 12px", whiteSpace: "nowrap" }}>
                {lang === "tr" ? "Ana Sayfa" : "Home"}
              </Link>
              <Link href="/analytics" className="btn-secondary" style={{ fontSize: "clamp(11px, 2vw, 13px)", padding: "8px 12px", whiteSpace: "nowrap" }}>
                {lang === "tr" ? "Analitik" : "Analytics"}
              </Link>
              <Link href="/guidelines" className="btn-secondary" style={{ fontSize: "clamp(11px, 2vw, 13px)", padding: "8px 12px", whiteSpace: "nowrap" }}>
                {lang === "tr" ? "Kılavuz" : "Guidelines"}
              </Link>
              <Link href="/resources" className="btn-secondary" style={{ fontSize: "clamp(11px, 2vw, 13px)", padding: "8px 12px", whiteSpace: "nowrap" }}>
                {lang === "tr" ? "Kaynaklar" : "Resources"}
              </Link>

              <select value={lang} onChange={(e) => setLang(e.target.value as "tr" | "en")} style={{ fontSize: "clamp(11px, 2vw, 13px)", fontWeight: 500, minWidth: 60, padding: "6px" }}>
                <option value="tr">🇹🇷</option>
                <option value="en">🇬🇧</option>
              </select>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: 1000, margin: "0 auto", padding: "clamp(24px, 5vw, 48px) clamp(16px, 3vw, 24px)" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(32px, 5vw, 48px)" }}>
            <h1 className="text-gradient" style={{ fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
              {lang === "tr" ? "❓ Sıkça Sorulan Sorular" : "❓ Frequently Asked Questions"}
            </h1>
            <p style={{ fontSize: "clamp(14px, 2.5vw, 16px)", color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto", padding: "0 16px", lineHeight: 1.6 }}>
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
                <div style={{ padding: "clamp(16px, 3vw, 24px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "clamp(12px, 2vw, 16px)" }}>
                  <h3 style={{ 
                    fontSize: "clamp(15px, 2.8vw, 18px)", 
                    fontWeight: 700, 
                    color: "var(--text-primary)", 
                    margin: 0,
                    flex: 1,
                    lineHeight: 1.4
                  }}>
                    {faq.question}
                  </h3>
                  <div style={{ 
                    fontSize: "clamp(18px, 3vw, 24px)", 
                    color: "var(--nebula-purple)",
                    transition: "transform 0.3s ease",
                    transform: openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                    flexShrink: 0
                  }}>
                    ▼
                  </div>
                </div>

                {openIndex === index && (
                  <div style={{ 
                    padding: "0 clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px)",
                    borderTop: "1px solid rgba(167, 139, 250, 0.2)",
                    paddingTop: "clamp(12px, 2vw, 16px)"
                  }}>
                    <p style={{ 
                      fontSize: "clamp(13px, 2.5vw, 15px)", 
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
          <div className="glass-card" style={{ marginTop: "clamp(32px, 5vw, 48px)", padding: "clamp(20px, 4vw, 32px)", textAlign: "center" }}>
            <h2 className="text-gradient" style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 700, marginBottom: "clamp(12px, 2vw, 16px)", lineHeight: 1.3 }}>
              {lang === "tr" ? "Başka Sorularınız mı Var?" : "Have More Questions?"}
            </h2>
            <p style={{ fontSize: "clamp(13px, 2.5vw, 15px)", color: "var(--text-secondary)", marginBottom: "clamp(16px, 3vw, 24px)", lineHeight: 1.6, padding: "0 16px" }}>
              {lang === "tr" 
                ? "Cevabını bulamadığınız sorular için bizimle iletişime geçebilirsiniz."
                : "Feel free to contact us if you have any questions that aren't answered here."}
            </p>
            <div style={{ display: "flex", gap: "clamp(12px, 2vw, 16px)", justifyContent: "center", flexWrap: "wrap", padding: "0 16px" }}>
              <Link href="/" className="btn-primary" style={{ fontSize: "clamp(12px, 2.2vw, 14px)", padding: "clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)" }}>
                {lang === "tr" ? "🏠 Ana Sayfaya Dön" : "🏠 Back to Home"}
              </Link>
              <Link href="/guidelines" className="btn-secondary" style={{ fontSize: "clamp(12px, 2.2vw, 14px)", padding: "clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)" }}>
                {lang === "tr" ? "📖 Kullanım Kılavuzu" : "📖 User Guide"}
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(167, 139, 250, 0.2)", marginTop: "clamp(48px, 8vw, 80px)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(24px, 4vw, 32px) clamp(16px, 3vw, 24px)", textAlign: "center", fontSize: "clamp(12px, 2vw, 14px)", color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(10px, 2vw, 14px)", marginBottom: "clamp(12px, 2vw, 16px)", flexWrap: "wrap" }}>
              <Image src="/logo.png" alt="NextGenLAB Logo" width={28} height={28} className="glow" />
              <span className="text-gradient" style={{ fontWeight: 700, fontSize: "clamp(14px, 2.5vw, 16px)" }}>NextGenLAB Space Bioscience Explorer</span>
            </div>
            <div style={{ fontSize: "clamp(11px, 2vw, 13px)", opacity: 0.7, lineHeight: 1.6, padding: "0 16px" }}>608 NASA Publications • Real-time AI Analysis • Knowledge Graph Visualization</div>
          </div>
        </footer>
      </div>
    </>
  );
}


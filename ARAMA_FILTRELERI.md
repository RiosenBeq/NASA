# 🔍 NASA Space Bioscience Explorer - Arama Filtreleri Rehberi

## 📋 Genel Bakış

NASA Space Bioscience Explorer'da **5 farklı filtre** bulunmaktadır. Bu filtreler, 608 uzay biyolojisi yayını arasında daha spesifik arama yapmanızı sağlar.

---

## 🎯 Filtreler ve Açıklamaları

### 1. 🔍 **Ana Arama Kutusu**
**Ne İşe Yarar:**
- Makale başlıklarında semantik arama yapar
- Anahtar kelimelerle alakalı yayınları bulur
- Skorlama sistemi ile en alakalı sonuçları üstte gösterir

**Nasıl Kullanılır:**
- Örnek: `"mikro yerçekimsizlikte bitki kök gelişimi"`
- Örnek: `"stem cell microgravity"`
- Örnek: `"radiation effects space"`

**Özellikler:**
- ✅ Büyük/küçük harf duyarsız
- ✅ Türkçe ve İngilizce destekli
- ✅ Skorlama: %0-100 arası alakalılık puanı
- ✅ En fazla 20 sonuç gösterir

---

### 2. 📅 **Yıl Filtresi**
**Ne İşe Yarar:**
- Belirli bir yılda yayınlanan makaleleri filtreler
- Yıl aralığı belirleyerek zaman dilimi sınırlaması yapar

**Nasıl Kullanılır:**
- Tek yıl: `2020` (sadece 2020 yılındaki yayınlar)
- Yıl aralığı: `2018-2022` (2018-2022 arası yayınlar)

**Geçerli Değerler:**
- ✅ 1950-2030 arası yıllar
- ❌ Geçersiz formatlar reddedilir
- ⚠️ Hata durumunda uyarı mesajı gösterilir

**Örnek Kullanım:**
```
Arama: "microgravity"
Yıl: "2020"
Sonuç: 2020 yılında yayınlanan mikro yerçekim makaleleri
```

---

### 3. 🧬 **Organizma Filtresi**
**Ne İşe Yarar:**
- Belirli organizma türlerini araştıran makaleleri filtreler
- Hangi canlı türü üzerinde çalışma yapıldığını belirtir

**Yaygın Organizma Türleri:**
- `mouse` - Fare çalışmaları
- `rat` - Sıçan çalışmaları  
- `human` - İnsan çalışmaları
- `plant` - Bitki çalışmaları
- `bacteria` - Bakteri çalışmaları
- `yeast` - Maya çalışmaları
- `drosophila` - Meyve sineği çalışmaları
- `arabidopsis` - Arabidopsis bitki çalışmaları

**Örnek Kullanım:**
```
Arama: "space biology"
Organizma: "mouse"
Sonuç: Fareler üzerinde yapılan uzay biyolojisi çalışmaları
```

---

### 4. 🛰️ **Platform Filtresi**
**Ne İşe Yarar:**
- Hangi uzay platformunda/araçta yapılan çalışmaları filtreler
- Deneylerin nerede gerçekleştirildiğini belirtir

**Yaygın Platform Türleri:**
- `ISS` - Uluslararası Uzay İstasyonu
- `Space Shuttle` - Uzay Mekiği
- `Soyuz` - Soyuz uzay aracı
- `Bion` - Bion biyolojik uydu serisi
- `Foton` - Foton uydu serisi
- `ground` - Yer tabanlı simülasyonlar
- `parabolic` - Parabolik uçuş simülasyonları
- `centrifuge` - Santrifüj simülasyonları

**Örnek Kullanım:**
```
Arama: "bone loss"
Platform: "ISS"
Sonuç: ISS'de yapılan kemik kaybı çalışmaları
```

---

### 5. 👤 **Persona Filtresi** (Header'da)
**Ne İşe Yarar:**
- Özetlerin hangi kullanıcı grubuna göre hazırlanacağını belirler
- Özet içeriğini kişiselleştirir

**Seçenekler:**
- `Scientist` - Bilim insanları için
- `Manager` - Program yöneticileri için  
- `Architect` - Misyon mimarları için
- `(Boş)` - Genel kullanıcılar için

**Farklar:**
```
Scientist Seçilirse:
- Deneysel metodoloji vurgulanır
- Hipotez önerileri verilir
- İstatistiksel analizler detaylandırılır

Manager Seçilirse:
- Stratejik önem vurgulanır
- Yatırım fırsatları belirtilir
- Kaynak tahsisi önerileri verilir

Architect Seçilirse:
- Misyon planlama odaklı olur
- Teknoloji gereksinimleri vurgulanır
- Risk azaltma stratejileri verilir
```

---

### 6. 📊 **Section Priority Filtresi** (Header'da)
**Ne İşe Yarar:**
- Özetlerin hangi bölümüne odaklanılacağını belirler
- Makale analizinin hangi kısmının vurgulanacağını seçer

**Seçenekler:**
- `Results` - Deneysel sonuçlar odaklı
- `Discussion` - Yorumlama ve tartışma odaklı
- `Conclusion` - Sonuçlar ve gelecek yönelimler odaklı
- `(Boş)` - Tüm bölümler dengeli

**Farklar:**
```
Results Seçilirse:
- Veri noktaları vurgulanır
- İstatistiksel analizler öncelikli
- Objektif bulgular öne çıkar

Discussion Seçilirse:
- Yorumlama vurgulanır
- Literatürle karşılaştırma öncelikli
- Daha geniş etkiler öne çıkar

Conclusion Seçilirse:
- Gelecek yönelimler vurgulanır
- Uygulamalar öncelikli
- Pratik öneriler öne çıkar
```

---

## 🔧 Teknik Detaylar

### **Filtre Kombinasyonu:**
Tüm filtreler birlikte kullanılabilir:
```
Arama: "stem cell"
Yıl: "2020"
Organizma: "human"
Platform: "ISS"
Persona: "Scientist"
Section: "Results"
```

### **Filtre Temizleme:**
- Aktif filtreler badge olarak gösterilir
- "Temizle" butonu ile tüm filtreler sıfırlanır
- Her filtre ayrı ayrı temizlenebilir

### **Hata Kontrolü:**
- Yıl filtresi: 1950-2030 arası kontrol
- Boş değerler otomatik temizlenir
- Geçersiz formatlar uyarı verir

---

## 📝 Kullanım Örnekleri

### **Örnek 1: Genel Arama**
```
Arama: "microgravity plant"
Sonuç: Mikro yerçekimde bitki çalışmaları
```

### **Örnek 2: Spesifik Filtreli Arama**
```
Arama: "bone loss"
Yıl: "2019"
Organizma: "mouse"
Platform: "ISS"
Sonuç: 2019'da ISS'de farelerde kemik kaybı çalışmaları
```

### **Örnek 3: Persona Odaklı Özet**
```
Arama: "radiation effects"
Persona: "Architect"
Section: "Conclusion"
Sonuç: Misyon planlama odaklı, gelecek yönelimler vurgulu özet
```

---

## ⚠️ Önemli Notlar

### **Mevcut Durum:**
- ✅ Ana arama kutusu çalışıyor
- ✅ Persona ve Section filtreleri çalışıyor (özetler için)
- ⚠️ Yıl, Organizma, Platform filtreleri UI'da var ama backend'de henüz aktif değil

### **Gelecek Geliştirmeler:**
- Yıl filtresi için CSV'ye yıl bilgisi eklenmesi
- Organizma filtresi için makale içeriği analizi
- Platform filtresi için makale başlığı analizi

### **Şu Anda Çalışan:**
- ✅ Semantik arama (ana kutu)
- ✅ Persona bazlı özetler
- ✅ Section odaklı özetler
- ✅ Skorlama sistemi

---

## 🚀 Sonuç

Bu filtreler sistemi, NASA'nın 608 uzay biyolojisi yayını arasında **çok spesifik arama** yapmanızı sağlar. Her filtre farklı bir boyutta daraltma yapar ve birlikte kullanıldığında **çok odaklı sonuçlar** elde edersiniz.

**En etkili kullanım:** Ana arama + Persona + Section kombinasyonu ile **kişiselleştirilmiş, detaylı özetler** alabilirsiniz! 🌌

# 📸 Article Images Directory

Bu klasör makale görselleri için kullanılır.

## 📁 Dosya Adlandırma:
- `space-lab-1.jpg` - `space-lab-10.jpg`
- `research-1.jpg` - `research-10.jpg`
- `experiment-1.jpg` - `experiment-10.jpg`

## 🎯 Önerilen Görseller:
- Uzay laboratuvarları
- Bilimsel deneyler
- Astronotlar
- Uzay istasyonları
- Mars/Moon habitatları
- Bitki yetiştirme sistemleri
- Mikroskop görüntüleri

## 📏 Teknik Özellikler:
- **Format**: JPG, PNG, WebP
- **Boyut**: 800x600px (4:3 ratio)
- **Dosya Boyutu**: < 500KB
- **Optimizasyon**: Web için optimize edilmiş

## 🔄 Otomatik Seçim:
Sistem makale ID'sine göre otomatik olarak görsel seçer:
```javascript
const imageIndex = (articleId % 10) + 1;
const imagePath = `/images/articles/space-lab-${imageIndex}.jpg`;
```

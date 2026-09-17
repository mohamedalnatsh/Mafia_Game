# 🕵️‍♂️ Mafia - The Knights Edition (مافيا الفرسان)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML) [![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS) [![JavaScript ES6+](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=111)](https://developer.mozilla.org/docs/Web/JavaScript) [![GitHub Pages Live](https://img.shields.io/badge/GitHub%20Pages-Live-222?logo=github)](#live-demo)

An offline, browser-based Mafia/Werewolf game for group play without a moderator or Gamemaster. Players pass one device between them while the application manages secret roles, night actions, discussions, voting, and victory conditions through a medieval dark-crimson and metallic-gold interface.

## Features

- ⭕ **Circular Seating Arrangement (`ترتيب الجلسة`):** Displays players clockwise around a dynamic seating diagram to make passing the device easy.
- 🃏 **3D Interactive Card Flip:** Reveals each secret role through a responsive flip animation with `وثيقة سرية` styling, role metadata, and artwork.
- 💾 **Full Session Recovery:** Automatically stores the active game in `localStorage` under `mafia_active_session` so refreshes do not lose progress.
- 📊 **Persistent Leaderboard & Stats:** Tracks player wins, losses, total points, and roles won across sessions using `localStorage`.
- 🎨 **Medieval Dark Aesthetic:** Uses dark crimson gradients, metallic-gold borders, responsive layouts, and custom typography.
- ⚡ **Zero Dependencies:** Built with vanilla HTML5, CSS3, and JavaScript without heavy external libraries.

## Technologies

- **Frontend:** HTML5, CSS3, 3D transforms, Flexbox, and CSS Grid
- **Logic:** Vanilla JavaScript ES6+
- **Storage:** Web Storage API (`localStorage`)
- **Deployment:** GitHub Pages

## Project Structure

```text
├── index.html        # Main web application
├── imges/            # Role and start-menu artwork
└── README.md         # Project documentation
```

> The favicon is referenced from `favicon.ico` when the file is included in the repository.

## Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   cd YOUR_REPOSITORY
   ```

2. Open `index.html` in any modern web browser.

For the most reliable browser behavior, serve the folder with a lightweight local server, such as the VS Code Live Server extension or:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Live Demo

The GitHub Pages deployment will be available here:

**[Open the live demo](https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/)**

Replace `YOUR_USERNAME` and `YOUR_REPOSITORY` with the actual GitHub Pages address.

## Author & Credits

Created by **[Mohammed AL-Natsha](https://mohamedalnatsh.github.io/portfolio/)**.

The game interface, medieval theme, role system, seating flow, session recovery, and persistent player statistics are part of the Mafia - The Knights Edition experience.

---

# 🕵️‍♂️ مافيا الفرسان (Mafia - The Knights Edition)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML) [![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS) [![JavaScript ES6+](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=111)](https://developer.mozilla.org/docs/Web/JavaScript) [![GitHub Pages Live](https://img.shields.io/badge/GitHub%20Pages-Live-222?logo=github)](#العرض-الحي)

## نبذة عن المشروع

لعبة مافيا/ذئاب بشرية تعمل عبر المتصفح وبدون اتصال، مصممة للعب الجماعي دون الحاجة إلى مدير أو حكم. يمرر اللاعبون جهازاً واحداً بينهم، بينما يدير التطبيق الأدوار السرية، أحداث الليل، النقاش، التصويت، وشروط الفوز ضمن هوية بصرية ملكية تجمع بين تدرجات الكريمسون الداكن والذهبي المعدني.

## الميزات

- ⭕ **ترتيب الجلسة (Circular Seating):** مخطط دائري ديناميكي مرتب باتجاه عقارب الساعة لتسهيل تمرير الجهاز.
- 🃏 **كروت 3D كشف الدور (3D Card Flip):** حركة قلب تفاعلية تكشف الدور مع طبقة الوثيقة السرية `وثيقة سرية` وصور وبيانات الأدوار.
- 💾 **حفظ الجلسة تلقائياً (Session Recovery):** استعادة الحالة بعد تحديث الصفحة باستخدام `localStorage` والمفتاح `mafia_active_session`.
- 📊 **جدول النقاط والإحصائيات (Persistent Leaderboard):** تسجيل الانتصارات والخسائر والنقاط والأدوار التي تحقق فيها الفوز عبر الجلسات.
- 🎨 **هوية بصرية ملكية (Medieval Visual Theme):** تدرجات كريمسون داكنة، حدود ذهبية، تخطيط متجاوب، وخطوط مخصصة.
- ⚡ **بدون مكتبات خارجية (Zero Dependencies):** مبنية بالكامل باستخدام HTML5 وCSS3 وJavaScript ES6+.

## التقنيات المستخدمة

- **الواجهة:** HTML5 وCSS3، بما في ذلك التحويلات ثلاثية الأبعاد وFlexbox وCSS Grid
- **المنطق:** JavaScript ES6+ بدون أطر عمل
- **التخزين:** Web Storage API (`localStorage`)
- **النشر:** GitHub Pages

## بنية المشروع

```text
├── index.html        # التطبيق الرئيسي
├── imges/            # صور الأدوار وصورة شاشة البداية
├── favicon.ico       # أيقونة الموقع
└── README.md         # توثيق المشروع
```

## التشغيل محلياً

1. استنسخ المستودع:

   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   cd YOUR_REPOSITORY
   ```

2. افتح `index.html` في أي متصفح حديث.

لأفضل توافق، شغّل خادماً محلياً بسيطاً باستخدام إضافة Live Server في VS Code أو الأمر التالي:

```bash
python -m http.server 8000
```

ثم افتح `http://localhost:8000` في المتصفح.

## العرض الحي

رابط نسخة GitHub Pages:

**[فتح العرض الحي](https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/)**

استبدل `YOUR_USERNAME` و`YOUR_REPOSITORY` بعنوان مستودع GitHub الفعلي.

## المؤلف والاعتمادات

تم إنشاء المشروع بواسطة **[Mohammed AL-Natsha](https://mohamedalnatsh.github.io/portfolio/)**.

تشمل مساهمات المشروع الواجهة الملكية، نظام الأدوار، ترتيب الجلسة، استعادة الجلسة، وإحصائيات اللاعبين الدائمة.
# ⏰ تطبيق إدارة ساعات العمل الإضافي

تطبيق احترافي متكامل لإدارة وتسجيل وحساب ساعات العمل الإضافي (Overtime) بالريال اليمني.

## ✨ المميزات

- ⚡ **إضافة سريعة**: أزرار +1، +2، +3 ساعات
- 🕐 **طرق متعددة**: وقت النهاية، بداية/نهاية، أو إدخال المدة مباشرة
- 📊 **لوحة تحكم**: إحصائيات اليوم والأسبوع والشهر
- 📋 **سجل كامل**: بحث، تصفية، تعديل، حذف مع تأكيد
- 📈 **تقارير**: يومية، أسبوعية، شهرية، فترة مخصصة مع طباعة/PDF
- 📅 **تقويم**: رؤية أيام الإضافي والإجازات
- ⚙️ **إعدادات مرنة**: أوقات الدوام، سعر الساعة، المظهر، الإشعارات
- 💾 **نسخ احتياطي**: تصدير واستيراد JSON
- 🌐 **عمل بدون إنترنت**: PWA + Service Worker + تخزين محلي
- 🔔 **إشعارات**: تذكير يومي قابل للتخصيص
- 🎨 **تخصيص**: وضع فاتح/داكن + ألوان متعددة

## 🛠️ التقنيات المستخدمة

- [Next.js 16](https://nextjs.org/) - إطار العمل
- [React 19](https://react.dev/) - واجهة المستخدم
- [TypeScript](https://www.typescriptlang.org/) - النوعية
- [Tailwind CSS 4](https://tailwindcss.com/) - التصميم
- [Drizzle ORM](https://orm.drizzle.team/) - التعامل مع قاعدة البيانات
- [PostgreSQL](https://www.postgresql.org/) - قاعدة البيانات
- [Sonner](https://sonner.emilkowal.ski/) - الإشعارات
- [Lucide React](https://lucide.dev/) - الأيقونات

## 📦 المتطلبات

- Node.js 18 أو أحدث
- PostgreSQL 14 أو أحدث
- npm أو yarn أو pnpm

## 🚀 التثبيت والتشغيل

### 1. استنساخ المشروع

```bash
git clone https://github.com/USERNAME/overtime-app.git
cd overtime-app
```

### 2. تثبيت الحزم

```bash
npm install
```

### 3. إعداد قاعدة البيانات

تأكد من وجود PostgreSQL ثم أنشئ ملف `.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
```

مثال محلي:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

### 4. تطبيق مخطط قاعدة البيانات

```bash
npx drizzle-kit push
```

### 5. تشغيل التطبيق

```bash
npm run dev
```

افتح المتصفح على: [http://localhost:3000](http://localhost:3000)

## 📂 هيكل المشروع

```
overtime-app/
├── src/
│   ├── app/                 # صفحات Next.js
│   │   ├── api/             # نقاط نهاية API
│   │   ├── calendar/        # صفحة التقويم
│   │   ├── records/         # صفحة السجل
│   │   ├── reports/         # صفحة التقارير
│   │   ├── settings/        # صفحة الإعدادات
│   │   ├── page.tsx         # الصفحة الرئيسية
│   │   ├── layout.tsx       # التخطيط العام
│   │   └── globals.css      # الأنماط العامة
│   ├── components/          # المكونات المشتركة
│   ├── db/                  # إعدادات Drizzle والمخطط
│   └── lib/                 # المساعدات والأنواع
├── public/                  # الملفات العامة والأيقونات
├── .env                     # متغيرات البيئة (لا تُرفع)
├── next.config.ts           # إعدادات Next.js
├── drizzle.config.json      # إعدادات Drizzle
└── package.json
```

## ⚙️ الإعدادات الافتراضية

| اليوم | حالة | انتهاء الدوام | نهاية الإضافي |
|-------|------|---------------|---------------|
| السبت | عمل | 2:00 م | 5:00 م |
| الأحد | عمل | 2:00 م | 5:00 م |
| الاثنين | عمل | 2:00 م | 5:00 م |
| الثلاثاء | عمل | 2:00 م | 5:00 م |
| الأربعاء | عمل | 2:00 م | 5:00 م |
| الخميس | عمل | 1:00 م | 4:00 م |
| الجمعة | إجازة | - | - |

**سعر الساعة الافتراضي:** 1,500 ريال يمني

## 🌐 النشر

### النشر على Vercel

```bash
npm install -g vercel
vercel
```

لا تنس إضافة `DATABASE_URL` في إعدادات المشروع على Vercel.

## 📱 تحويل إلى APK

### الطريقة 1: Trusted Web Activity (TWA) عبر Bubblewrap

1. انشر الموقع أولاً على Vercel
2. ثبّت Bubblewrap:

```bash
npm install -g @bubblewrap/cli
```

3. أنشئ مشروع Android:

```bash
bubblewrap init --manifest https://your-app.vercel.app/manifest.json
```

4. ابنِ ملف APK:

```bash
bubblewrap build
```

### الطريقة 2: Capacitor

1. ثبّت Capacitor:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Overtime" "com.example.overtime" --web-dir .next
```

2. أضف منصة Android:

```bash
npx cap add android
npx cap sync
```

3. افتح المشروع في Android Studio:

```bash
npx cap open android
```

4. من Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**

## 🔄 CI/CD و GitHub Actions

المشروع يتضمن workflows جاهزة في `.github/workflows/`:

### 1. CI (`ci.yml`)
يتم تشغيله تلقائياً عند كل push أو pull request:
- تثبيت الحزم
- توليد أنواع Next.js
- فحص TypeScript
- فحص ESLint
- بناء التطبيق

### 2. النشر على Vercel (`deploy-vercel.yml`)
ينشر التطبيق تلقائياً على Vercel عند push على فرع `main`.

المتطلبات:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

أضفها في **Settings → Secrets and variables → Actions**.

### 3. بناء APK (`android.yml`)
يقوم ببناء ملف APK باستخدام Bubblewrap (Trusted Web Activity).

الخطوات:
1. انشر الموقع أولاً على Vercel
2. اذهب إلى **Actions → Build Android APK → Run workflow**
3. أدخل رابط التطبيق المنشور
4. سيقوم GitHub Actions ببناء APK ورفعه كـ artifact

## 🧪 الاختبار

```bash
# فحص الأنواع
npm run typecheck

# بناء الإنتاج
npm run build

# بدء الإنتاج
npm start
```

## 🤝 المساهمة

نرحب بمساهماتكم! يمكنكم فتح Issue أو Pull Request.

## 📝 الترخيص

هذا المشروع مفتوح المصدر تحت ترخيص MIT.

---

<div align="center">
  <p>بُني بـ ❤️ لإدارة ساعات العمل الإضافي</p>
</div>

# 🔪 JEZAR — نظام إدارة الجزارة

نظام متكامل لإدارة محلات الجزارة: ذبائح، منتجات، مبيعات، مخزون، مصروفات،
ديون، عمال، وتقارير — بواجهة عربية حديثة (RTL) ومزامنة فورية عبر Firebase.

> الألوان: أحمر داكن / أسود / أبيض — مع شعار **JEZAR** (ساطور الجزارة).

---

## 📦 المحتوى

```
JEZAR/
├── web/                  تطبيق لوحة التحكم (React + TypeScript + Tailwind + Firebase)
├── firebase/             قواعد الأمان والفهارس
│   ├── firestore.rules   صلاحيات Firestore حسب الدور
│   ├── storage.rules     صلاحيات تخزين الصور
│   └── firestore.indexes.json
├── firebase.json         ربط القواعد + الاستضافة (Hosting)
└── README.md
```

> تطبيق الأندرويد (Flutter) خطوة لاحقة — انظر قسم [تطبيق الأندرويد](#-تطبيق-الأندرويد-flutter).
> صُمّمت طبقة البيانات لتشترك مع الويب في نفس قاعدة Firestore، فتعمل المزامنة الفورية تلقائياً.

---

## 🚀 التشغيل السريع (وضع تجريبي — بدون أي إعداد)

```bash
cd web
npm install
npm run dev
```

افتح <http://localhost:5173>. يعمل التطبيق فوراً ببيانات تجريبية محلية
(تُحفظ في المتصفح). للدخول السريع استخدم زر **«كمدير»** أو **«كعامل»**، أو:

| الدور | البريد | كلمة المرور |
|------|--------|------------|
| مدير | `admin@jezar.com` | `admin` |
| عامل | `worker@jezar.com` | `worker` |

كل العمليات (بيع، ذبح، مصروف…) تعمل وتُحدّث الشاشات فورياً (مزامنة محاكاة).

---

## ☁️ التفعيل الحقيقي عبر Firebase

### 1) أنشئ مشروع Firebase
- من [console.firebase.google.com](https://console.firebase.google.com) أنشئ مشروعاً.
- فعّل: **Authentication** (Email/Password)، **Cloud Firestore**، **Storage**.

### 2) اربط إعدادات الويب
انسخ `web/.env.example` إلى `web/.env.local` واملأ القيم من
*Project Settings → General → Your apps → SDK setup*:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

بمجرد توفّر هذه القيم يتحوّل التطبيق تلقائياً من الوضع التجريبي إلى Firebase الحقيقي.
(لإجبار الوضع التجريبي رغم وجود الإعدادات: `VITE_DEMO_MODE=true`.)

### 3) أنشئ المستخدمين وحدّد الأدوار
- من تبويب **Authentication** أضِف مستخدمين (بريد + كلمة مرور).
- في **Firestore** أنشئ مجموعة `users`، ولكل مستخدم مستنداً معرّفه = `uid`:

```json
// users/{uid}
{ "name": "المدير", "role": "admin", "email": "admin@jezar.com" }
{ "name": "كريم",  "role": "worker", "email": "worker@jezar.com" }
```

> القيم المسموحة لـ `role`: `admin` أو `worker`.

### 4) انشر قواعد الأمان

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # اختر مشروعك
firebase deploy --only firestore:rules,storage
```

### 5) نشر لوحة التحكم (اختياري)

```bash
cd web && npm run build && cd ..
firebase deploy --only hosting
```

---

## 👥 الأدوار والصلاحيات

| الميزة | المدير | العامل |
|-------|:------:|:------:|
| لوحة التحكم | ✅ كاملة | ✅ مختصرة |
| تسجيل المبيعات وإصدار الفواتير | ✅ | ✅ |
| عرض المنتجات والمخزون | ✅ | ✅ (عرض) |
| إدارة الذبائح ومخرجات الذبح | ✅ | ❌ |
| المصروفات / الديون / العمال | ✅ | ❌ |
| التقارير والتصدير (PDF/Excel) | ✅ | ❌ |

الصلاحيات مطبّقة في الواجهة (إخفاء المسارات) **و** في `firestore.rules`.

---

## 🗃️ نموذج البيانات (مجموعات Firestore)

| المجموعة | الوصف |
|----------|-------|
| `users` | المستخدمون وأدوارهم |
| `slaughters` | الذبائح (شراء + مخرجات الذبح) |
| `products` | المنتجات والفئات |
| `sales` | فواتير البيع (بنود + ربح) |
| `expenses` | المصروفات المصنّفة |
| `parties` | الزبائن والموردون (مع الأرصدة) |
| `ledger` | سجل الديون والدفعات |
| `workers` | العمال |
| `notifications` | الإشعارات (مخزون/بيع/ذبح) |

تفاصيل الحقول في [`web/src/types.ts`](web/src/types.ts).

### المنطق التلقائي
- **عند البيع**: خصم الكمية من المخزون + حساب الربح + تحديث رصيد الزبون (للآجل) + إشعار.
- **عند الذبح**: إدخال المخرجات يُضاف تلقائياً إلى مخزون المنتجات حسب الفئة.
- **تنبيهات المخزون**: تلقائياً عند الوصول لحد التنبيه أو النفاد.

---

## 🧾 التصدير والطباعة

- **Excel**: عبر SheetJS (`xlsx`) في كل الجداول الرئيسية.
- **PDF / الفواتير / التقارير**: نافذة طباعة منسّقة تدعم العربية (RTL) بالكامل
  — اطبع أو احفظ كـ PDF من حوار الطباعة. (أكثر موثوقية للعربية من توليد PDF برمجياً.)

---

## 🛠️ التقنيات

React 18 · TypeScript · Vite · Tailwind CSS · React Router · Recharts ·
Firebase (Auth / Firestore / Storage) · SheetJS · lucide-react · خط Cairo.

دعم العمل دون اتصال (Offline) مفعّل عبر `enableIndexedDbPersistence` ثم المزامنة
تلقائياً عند عودة الإنترنت.

---

## 📱 تطبيق الأندرويد (Flutter)

لم يُبنَ بعد في هذه المرحلة، لكنه مصمّم ليشترك في **نفس** مشروع Firebase
ونفس مجموعات Firestore أعلاه — فتعمل المزامنة الفورية مع الويب تلقائياً.

الخطوات المقترحة:
1. `flutter create jezar_app` ثم إضافة الحزم:
   `firebase_core`, `firebase_auth`, `cloud_firestore`, `firebase_storage`,
   `firebase_messaging` (إشعارات Push), `fl_chart`, `intl`.
2. `flutterfire configure` لربط نفس مشروع Firebase.
3. أعد استخدام نفس نموذج البيانات وقواعد الأمان (تعمل لكل العملاء).
4. للإشعارات الفورية: استخدم **Firebase Cloud Messaging** مع Cloud Function
   تُطلق إشعاراً عند انخفاض المخزون أو تسجيل عملية بيع/ذبح.

> أخبرني عند الرغبة في توليد هيكل تطبيق Flutter كامل (شاشات الدخول، المبيعات،
> المخزون، الإشعارات) وأبدأ به.

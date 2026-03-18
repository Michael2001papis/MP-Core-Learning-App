# Game Hub (GssWuoly) 🎮

פלטפורמת משחקים מבוססת דפדפן בעברית (RTL) – איקס עיגול + נחש – עם מערכת התחברות מקומית, נגישות, PWA ותמיכה Offline חלקית.

---

## 👤 מי המפתח – זכויות יוצרים

**מפתח ובעלים:** מיכאל פפיסמדוב (Michael Papismedov)  
**© 2025–2026 מיכאל פפיסמדוב. כל הזכויות שמורות.**

הפרויקט נבנה, עוצב ופותח במלואו על ידי מיכאל פפיסמדוב. אין להעתיק, לשכפל או להפיץ ללא אישור בכתב מהמחבר.

---

**חשוב:** זהו פרויקט Client-Side בלבד (Demo). **Client-side authentication (Demo only)** – אין צד שרת ואין אבטחת משתמשים "אמיתית". אין להשתמש בסיסמאות אמיתיות.

## קישורים

- **מפתח:** מיכאל פפיסמדוב
- **GitHub Repo:** https://github.com/Michael2001papis/GssWuoly.git
- **אתר חי:** https://gss-wuoly.vercel.app/pages/home/index.html

---

## תקציר יכולות

- ✅ **Multi-page** (לא SPA) – 10 דפים עם Vite entry points
- ✅ **עברית מלאה + RTL** (`lang="he"`, `dir="rtl"`)
- ✅ **נגישות מתקדמת:** טקסט מוגדל, ניגודיות, הפחתת תנועה, פוקוס מקלדת, גופן לדיסלקסיה, סמן מוגדל ועוד
- ✅ **Theme:** Light/Dark (שמור ב־localStorage)
- ✅ **PWA:** manifest.json + Service Worker (Network-First + Offline fallback)
- ✅ **מערכת התחברות מקומית** (localStorage) + timeout לאחר 10 דקות
- ✅ **Snake:** Canvas, רמות מהירות, שמירה/Resume, מובילים, בקרי מגע למובייל
- ✅ **Tic-Tac-Toe:** PvP + PvC (כולל Minimax ברמת "קשה"), סטטיסטיקות ושמירה
- ✅ **בדיקות:** Vitest (Unit) + Playwright E2E (Smoke/Offline/Mobile/Galaxy + dist)

---

## טכנולוגיות

| קטגוריה | טכנולוגיה |
|---------|-----------|
| Frontend | HTML / CSS / Vanilla JS |
| Tooling | Vite |
| Testing | Vitest, Playwright |
| Deploy | Vercel (build סטטי באמצעות build-static.js) |
| PWA | Service Worker + Web App Manifest |
| Audio | Web Audio API (ללא קבצי אודיו) |

---

## מבנה הפרויקט

```
/
├─ index.html
├─ package.json
├─ build-static.js
├─ manifest.json
├─ sw.js
├─ sitemap.xml
├─ js/                 # מודולים משותפים
├─ css/                # עיצוב גלובלי
├─ assets/             # favicon
├─ pages/              # דפים (home/login/about/...)
└─ e2e/                # Playwright tests
```

---

## מודולים משותפים (js/)

| מודול | קובץ | תיאור |
|-------|------|-------|
| **AUTH** | `js/auth.js` | הרשמה/התחברות מקומית + logged user + avatar |
| **APP** | `js/app-common.js` | Theme, שעון, נגישות, תפריט "עוד", session timeout |
| **standalone** | `js/standalone.js` | fallback ל-Theme/נגישות אם APP לא נטען |
| **sounds** | `js/sounds.js` | אפקטים עם Web Audio API |
| **toast** | `js/toast.js` | הודעות מערכת ידידותיות |
| **analytics** | `js/analytics.js` | Analytics (GA/Plausible) לפי הגדרה |

---

## משחקים (pages/games/)

- **tic-tac-toe/** – משחק איקס עיגול (כולל Minimax)
  - `css/style.css`
  - `js/script.js`
- **snake/** – משחק נחש (Canvas, שמירה, מובילים, מובייל)
  - `css/style.css`
  - `js/script.js`

---

## איך מריצים מקומית

### התקנת תלויות

```bash
npm install
```

### מצב פיתוח

```bash
npm run dev
```

### פריוויו (Preview)

```bash
npm run build
npm run preview
```

**הערה:** הפרויקט Multi-page, לכן מומלץ לבדוק ניווט לכל הדפים ולא רק ל־Home.

---

## Build ופריסה

### Build

הפרויקט משתמש ב־`build-static.js` שמעתיק את הקבצים ל־`dist/` (לא build מלא של Vite).  
זה מתאים ל־Vercel ולפריסה כסטטי.

### Vercel

`vercel.json` מוגדר כך ש־Build ייצור `dist` ויפרס אותו.

---

## בדיקות

- **Unit tests (Vitest):** מתמקדות ב־Auth (signup/signin/logout/validations)
- **E2E (Playwright):** smoke לכל הדפים + offline + mobile + Galaxy S22 Ultra + הרצה גם מול dist

```bash
npm test               # Vitest (single run)
npm run test:e2e        # Playwright
npm run test:e2e:dist   # Playwright מול dist build אמיתי
```

### מה חשוב לדעת על הבדיקות

- `auth.test.js` מבוסס על לוגיקה מקבילה ל־`auth.js`, ולכן יש צורך לשמור סנכרון בעת שינויים ב־Auth.
- `vitest.config.js` כרגע מוציא את `pages/**` מכלל הבדיקות – כלומר אין unit tests לסקריפטים של הדפים.

---

## דוח מצב מהיר (TXT)

אפשר לייצר “דוח מצב” מהיר בלחיצה אחת לקובץ `STATUS_REPORT.txt` (נוצר בשורש הפרויקט):

```bash
npm run report:status
```

---

## ניקוי תיקיות ריקות

מחיקה בטוחה של תיקיות ריקות (לא נוגע ב־`node_modules`/`.git`):

```bash
npm run cleanup:empty-dirs
```

---

## PWA ו-Offline

- **manifest.json** מוגדר כ־standalone + RTL + start_url לדף הבית
- **sw.js** מוגדר כ־**Network-First** (מביא גרסה עדכנית אם יש אינטרנט, אחרת נופל לקאש)

**הערה:** כרגע דפי About/Contact/Privacy/Terms/404 אינם כלולים ב-precache.

---

## Analytics

`analytics.js` תומך ב־GA או Plausible, ונפתח רק אם מוגדרת תצורה מתאימה מראש (למשל משתנה גלובלי לפני טעינת הסקריפט).

✅ **עודכן:** קיימת תאימות לאחור כך שמודולים שעדיין מצפים ל־`window.ANALYTICS.track(...)` ימשיכו לעבוד.

---

## localStorage – מפתחות בשימוש

| מפתח | תיאור |
|------|-------|
| `gameHubUsers` | רשימת משתמשים (כולל סיסמאות כטקסט → Demo) |
| `loggedInUser` | משתמש מחובר |
| `gameHubTheme` | מצב תצוגה |
| `gameHubAccessibility` | הגדרות נגישות |
| `gameHubLastActivity` | ניטור פעילות ל־timeout |
| `gameHubMuted` | השתקה |
| `gameHubSnakeState` | שמירת מצב משחק נחש |
| `snakeLeaderboard` | מובילים נחש |

---

## מגבלות ידועות (Known Limitations)

- אין Backend – כל האימות והנתונים נשמרים בדפדפן בלבד.
- סיסמאות נשמרות כטקסט ב־localStorage (רק Demo).
- `sitemap.xml` כולל placeholder `YOUR_DOMAIN` ויש להחליף לפני פריסה.
- `index.html` בשורש מפנה לדף הבית (מומלץ לשמור אסטרטגיית הפניה אחת).
- Service Worker: חסרים דפים ב-precache (About/Contact/Privacy/Terms/404).
- בדיקות Auth דורשות סנכרון ידני עם auth.js.

---

## Checklist לפני Deploy / הגשה ✅

- [ ] להחליף `YOUR_DOMAIN` ב־sitemap.xml לדומיין האמיתי
- [ ] לבחור אסטרטגיית הפניה אחת ב־index.html (meta או JS)
- [ ] לבדוק Console ללא שגיאות (מומלץ Incognito בלי Extensions)
- [ ] לבדוק Mobile (כפתורי מגע, גדלים, RTL)
- [ ] לבדוק Offline: טעינה בסיסית כשאין אינטרנט
- [ ] להריץ בדיקות: Unit + E2E
- [ ] להריץ Build ולוודא שנוצר dist/ תקין

---

## License / Copyright

**© 2025–2026 מיכאל פפיסמדוב. כל הזכויות שמורות.**

פרויקט GssWuoly (Game Hub). אין להעתיק/לשכפל/להפיץ ללא אישור בכתב.

**מה מותר:** צפייה, לימוד, הרצה מקומית לשימוש אישי (בהתאם ל־LICENSE).  
**מה אסור:** העתקה, שכפול, הפצה, הצגה כעבודה של אחר, שימוש מסחרי – ללא רישיון מפורש.

ראה קובץ `LICENSE` לפרטים מלאים. קובץ `CREDITS` מציין את המחבר והמקור.

---

## מסר ללקוח (לגבי חשש העתקה)

מכיוון שזה אתר סטטי, הקוד נשלח לדפדפן ולכן לא ניתן למנוע צפייה מוחלטת. עם זאת, הוספתי שכבות בעלות והרתעה: רישוי (LICENSE), חתימות בקבצים, קרדיט גלוי (CREDITS, Footer), ותיעוד מקור – כך שכל שימוש לא מורשה ניתן לזיהוי ולהוכחה.

---

## קרדיטים

**נבנה ופותח במלואו על ידי מיכאל פפיסמדוב (Michael Papismedov).**

- מפתח: מיכאל פפיסמדוב  
- מקור: https://github.com/Michael2001papis/GssWuoly.git  
- אתר: https://gss-wuoly.vercel.app/pages/home/index.html

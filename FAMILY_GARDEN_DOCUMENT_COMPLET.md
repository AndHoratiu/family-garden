# 📘 Family Garden — Document Complet de Lansare
**familygarden.ro**

> Document confidențial cu toate datele de acces, configurări și flow-uri pentru afacerea online Family Garden. Păstrează în loc sigur (password manager / cloud privat).

**Data creării:** 30 aprilie 2026
**Status site:** 🟢 LIVE la https://familygarden.ro

---

## 1. 🌐 ACCES SITE

| Item | Valoare |
|---|---|
| **URL principal** | https://familygarden.ro |
| **URL alternativ** | https://www.familygarden.ro |
| **URL Emergent (preview/backup)** | https://fresh-harvest-152.preview.emergentagent.com |
| **URL repository GitHub** | https://github.com/vasiandrone-rgb/Family-Garden |
| **Platforma de hosting** | Emergent (https://app.emergent.sh) |
| **Plan curent** | 50 credite/lună |

---

## 2. 🔐 CREDENȚIALE ADMIN

### Admin Dashboard (familygarden.ro/admin)

| Item | Valoare |
|---|---|
| **URL Admin** | https://familygarden.ro/admin |
| **Parolă actuală activă** | `familygarden2025` |
| **Parolă pregătită (după update env în Emergent)** | `ZrpXXDc-ysTaramJztUTt5ii` |

> ⚠️ **NOTĂ**: Parola nouă (`ZrpXXDc-...`) este pregătită în cod dar nu este încă activă pe production. Folosește parola veche (`familygarden2025`) până când actualizezi env vars în panoul Emergent → Settings → Environment Variables.

### Funcționalități admin disponibile:
- `/admin` → Listă comenzi (status, search, filtre, ștergere)
- `/admin/products` → Listă produse + editare stoc rapid
- `/admin/products/new` → Adăugare produs nou
- `/admin/products/[id]/edit` → Editare completă produs (preț, descriere, imagini)
- `/admin/site` → Editare conținut site (hero, contact, social media)
- `/admin/livrare` → Setări livrare + plată
- `/admin/emailuri` → Configurare destinatari email pentru notificări

---

## 3. 📧 EMAIL & RESEND

| Item | Valoare |
|---|---|
| **Provider email** | Resend (https://resend.com) |
| **Domeniu verificat în Resend** | familygarden.ro |
| **Status verificare** | ✅ Verified (DKIM + SPF + DMARC) |
| **Cheie API activă (RESEND_API_KEY)** | `re_ADd2a3VG_GkqHNTMishWmL2aQUL8eiRY5` |
| **Email expeditor (RESEND_FROM_EMAIL)** | `Family Garden <comenzi@familygarden.ro>` |
| **Email-uri admin destinatari** | androne.horatiuro@gmail.com, b.androne@yahoo.com |

### Flow email-uri:
La fiecare comandă plasată pe `/comanda-online`:
1. ✉️ Email către **androne.horatiuro@gmail.com** (admin)
2. ✉️ Email către **b.androne@yahoo.com** (admin)
3. ✉️ Email confirmare către **client** (dacă a completat email)

---

## 4. 💾 BAZA DE DATE

| Item | Valoare |
|---|---|
| **Tip DB** | MongoDB |
| **Numele bazei (DB_NAME)** | `family_garden` |
| **Hosting DB** | Emergent built-in MongoDB (auto-provisionat) |
| **Colecții folosite** | `products`, `orders`, `settings` |
| **Backup automat** | Da, prin Emergent |

### Schema produselor:
```
id, name, category, description, price, unit, stock, minOrder,
featured, season, image, images[], active, sortOrder, createdAt
```

### Schema comenzilor:
```
id, orderNumber (ex: FG835836), customerName, customerPhone,
customerEmail, customerAddress, notes, items[], subtotal,
deliveryFee, total, deliveryMethod, paymentMethod, status, createdAt
```

---

## 5. 🌍 DOMENIU & DNS

| Item | Valoare |
|---|---|
| **Registrar domeniu** | (verifică la cine ai cumpărat familygarden.ro) |
| **DNS Provider** | Cloudflare |
| **A Record / CNAME** | Configurat pentru Emergent IP |
| **SSL/TLS** | Cloudflare Full, certificat auto |
| **Status HTTPS** | ✅ Lacăt verde activ |

### Recommandări DNS:
- Pentru SEO ideal: configurează un Page Rule în Cloudflare pentru `www.familygarden.ro/*` → 301 redirect către `https://familygarden.ro/$1`

---

## 6. ⚙️ ENVIRONMENT VARIABLES (PRODUCTION)

Setate în panoul Emergent → Manage Deployment → Settings → Environment Variables:

```
MONGO_URL=<auto-injectat de Emergent>
DB_NAME=family_garden
NEXT_PUBLIC_BASE_URL=https://familygarden.ro
NEXT_PUBLIC_SITE_URL=https://familygarden.ro
CORS_ORIGINS=*
ADMIN_PASSWORD=familygarden2025  (sau ZrpXXDc-ysTaramJztUTt5ii după update)
RESEND_API_KEY=re_ADd2a3VG_GkqHNTMishWmL2aQUL8eiRY5
RESEND_FROM_EMAIL="Family Garden <comenzi@familygarden.ro>"
ADMIN_EMAILS=androne.horatiuro@gmail.com,b.androne@yahoo.com
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=UNhKl3UHSkxtoF7nnusK+zhrXhPWNkTmSYsQvKVjW80=
```

---

## 7. 🛒 FUNCȚIONALITĂȚI MAGAZIN

### Disponibile:
- ✅ 27 produse (Legume, Fructe, Flori, Răsaduri, Produse artizanale)
- ✅ Filtrare după categorie + sezon
- ✅ Coș de cumpărături cu localStorage
- ✅ Checkout cu validări (telefon obligatoriu, email opțional)
- ✅ Livrare locală (15 lei) sau Ridicare personală (gratuit)
- ✅ Plată: Ramburs activ; Online cu badge „În curând"
- ✅ Stoc auto-decrementat după comandă
- ✅ Status stoc: În stoc / Stoc limitat / Indisponibil
- ✅ Produse inactive nu apar pe site
- ✅ Stoc 0 = nu se poate comanda

### Pagini publice:
- `/` — Homepage cu hero, produse featured, beneficii
- `/comanda-online` — Catalog complet cu coș și checkout
- `/produs/[id]` — Pagina detaliată produs
- `/succes?orderNumber=...` — Confirmare după plasare comandă

---

## 8. 📞 DATE CONTACT AFIȘATE PE SITE

Editabile din `/admin/site`:

| Item | Valoare |
|---|---|
| **Telefon principal** | 0749476386 |
| **Telefon secundar** | 0755736374 |
| **Email contact** | comenzi@familygarden.ro |
| **Adresă** | Vințu de Jos, Telman, nr. 46, Alba, România |
| **Program** | Luni – Sâmbătă · 08:00 – 19:00 |
| **WhatsApp** | https://wa.me/40749476386 |

---

## 9. 🚀 DEPLOY & ACTUALIZĂRI

### Cum se actualizează site-ul:
1. În chat Emergent → modifici cu agentul AI
2. Apesi **„Save to Github"** (sincronizează codul)
3. Mergi în **Manage Deployment**
4. Apesi **„Re-deploy changes"** (durează 2-3 minute)
5. Status revine la **🟢 Live**

### Cum actualizezi parola admin (sau alte env vars):
1. Manage Deployment → **Settings** tab (lângă Database)
2. Caută secțiunea **Environment Variables**
3. Modifici valoarea pentru `ADMIN_PASSWORD`
4. Salvezi + Re-deploy

### Rollback la versiune anterioară:
1. Manage Deployment → listă Deployments
2. Click **„Rollback"** lângă versiunea anterioară
3. Confirmi → revine în 1-2 minute

---

## 10. 🔧 LIMITĂRI ACTUALE & TO-DO

### Funcționalități blocate (necesită chei API):
- 🔴 **Plată online cu cardul** — necesită cheie Stripe sau NETOPIA
- 🟡 **Sticky save bar pe mobil la edit produs** — pregătit în cod, ajunge la următorul deploy

### Recomandări pentru viitor:
- Sistem cupoane reduceri (ex: PRIMACOMANDA10)
- Recenzii produse cu stele
- Newsletter email
- Page Rule Cloudflare pentru www → apex redirect
- Atlas MongoDB dedicat dacă crește traficul mult

---

## 11. 📊 ANALYTICS & MONITORIZARE

| Item | Status |
|---|---|
| **Google Analytics** | ❌ Nu este configurat |
| **Google Search Console** | ❌ Nu este configurat (recomandat să adaugi) |
| **Robots.txt** | ✅ Activ la /robots.txt |
| **Sitemap.xml** | ✅ Activ la /sitemap.xml |
| **SEO meta tags** | ✅ OpenGraph + Twitter Card |

### Pentru Google Search Console:
1. Mergi pe https://search.google.com/search-console
2. Adaugă proprietate `familygarden.ro`
3. Verifică prin DNS TXT record (Cloudflare)
4. Trimite sitemap: `https://familygarden.ro/sitemap.xml`

---

## 12. 💳 EMERGENT — INFO ABONAMENT

| Item | Valoare |
|---|---|
| **Plan curent** | 50 credite/lună |
| **Promoție disponibilă** | 500 credite/an cu 2 luni gratis |
| **Suport** | support@emergent.sh |
| **Documentație** | https://help.emergent.sh |

### Recomandare:
Dacă faci modificări frecvente, consideră upgrade la plan anual (500 credite/an cu 2 luni gratis) pentru cost mai mic per credit.

---

## 13. 🆘 ÎN CAZ DE PROBLEME

### Site-ul nu se încarcă:
1. Verifică status Emergent → Manage Deployment → status badge
2. Verifică DNS în Cloudflare
3. Email: support@emergent.sh

### Email-uri nu ajung:
1. Verifică Resend dashboard: https://resend.com/emails
2. Verifică folder Spam în Gmail/Yahoo
3. Verifică cheia API încă validă în Resend → API Keys

### Comenzi nu se salvează:
1. Test manual prin `/comanda-online`
2. Verifică în `/admin` dacă apar
3. Verifică logs Emergent → Deployment → View Logs

### Pentru recuperare cod / configurări:
Tot codul este salvat pe GitHub: https://github.com/vasiandrone-rgb/Family-Garden

---

## 14. 📜 CONTURI EXTERNE FOLOSITE

| Serviciu | Cont | Scop |
|---|---|---|
| **GitHub** | vasiandrone-rgb | Source code |
| **Cloudflare** | (contul tău) | DNS + SSL |
| **Resend** | (contul tău cu familygarden.ro) | Email |
| **Emergent** | (contul tău) | Hosting + Deploy |
| **MongoDB** | Auto-provisionat de Emergent | Bază de date |
| **Domeniu familygarden.ro** | (contul registrar-ului tău) | Domeniu |

---

## 15. ✅ CHECKLIST FINAL DE LANSARE

- [x] Domeniu cumpărat și conectat
- [x] DNS configurat în Cloudflare
- [x] SSL activ (lacăt verde)
- [x] 27 produse seedate în MongoDB
- [x] Email-uri Resend funcționale (testat live)
- [x] Logo aplicat
- [x] Admin dashboard accesibil
- [x] Comenzi test plasate cu succes
- [x] Stoc auto-decrementat
- [x] Production deploy LIVE
- [ ] Parolă admin nouă activată (necesită update în Settings Emergent)
- [ ] Google Search Console (opțional, pentru SEO)
- [ ] Plată online Stripe/NETOPIA (când vei vrea)

---

## 📌 NOTE FINALE

**Acest document conține informații sensibile (parole, chei API). Nu îl distribui public.**

Recomand să:
1. Faci copie în Google Drive privat sau OneNote
2. Salvezi în password manager (1Password / Bitwarden) toate credențialele
3. Imprimi o versiune și o pui într-un dosar fizic în siguranță
4. Trimiți o copie criptată la Bianca Androne ca backup

**Pentru orice modificare, contactează agentul AI Emergent sau support@emergent.sh.**

---

*Document generat automat de agentul AI Emergent pe 30 aprilie 2026.*
*Versiunea 1.0 — completă pentru lansarea MVP-ului Family Garden.*

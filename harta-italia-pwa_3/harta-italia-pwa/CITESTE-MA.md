# Harta Italia — cum o pui pe telefon

Folderul ăsta e o aplicație web completă. Ca să meargă pe iPhone **trebuie** urcată
pe o adresă `https://` — iOS nu rulează JavaScript din fișiere locale.

Fișiere (nu redenumi nimic, nu le separa):

| fișier | ce face |
|---|---|
| `index.html` | aplicația |
| `sw.js` | ține hărțile și pozele în telefon, pentru offline |
| `manifest.webmanifest` | numele și iconul când o instalezi |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | iconuri |

---

## Varianta 1 — Netlify Drop (cea mai rapidă, ~2 minute)

1. Intră pe **https://app.netlify.com/drop**
2. Trage **tot folderul** în pagină (nu fișierele separat).
3. Primești pe loc un link de forma `https://ceva-random.netlify.app`.
4. Îți cere un cont ca să păstreze site-ul permanent — te loghezi cu Google, e gratuit.
5. Din *Site settings → Change site name* îi pui un nume ușor de reținut.

## Varianta 2 — GitHub Pages (permanentă, fără limite)

1. Cont pe **https://github.com** (gratuit).
2. *New repository* → nume `harta-italia` → **Public** → *Create*.
3. *Add file → Upload files* → trage toate fișierele din folder → *Commit changes*.
4. *Settings → Pages* → la **Source** alege `Deploy from a branch`,
   branch `main`, folder `/ (root)` → *Save*.
5. După 1–2 minute ai linkul: `https://NUMELE-TAU.github.io/harta-italia/`

## Varianta 3 — Cloudflare Pages

Cont gratuit pe **https://pages.cloudflare.com** → *Create a project* →
*Upload assets* → tragi folderul → *Deploy*. Link instant, trafic nelimitat.

---

## Instalarea pe telefon

**iPhone (Safari, obligatoriu Safari):** deschide linkul → butonul **Share** (pătratul
cu săgeată) → **Add to Home Screen** → *Add*.

**Android (Chrome):** deschide linkul → meniul cu trei puncte → **Install app** /
*Adaugă la ecranul principal*.

Apare cu icon propriu, se deschide fără bara de browser și salvează planul normal.

---

## Ca să meargă fără semnal în Italia

Înainte de plecare, cu internet:

1. Deschide aplicația **de pe link**, nu din fișier.
2. Apropie harta pe o zonă care te interesează (de exemplu Cinque Terre).
3. Tab **Export → Hărți offline → Descarcă harta pentru zona vizibilă**.
4. Repetă pentru fiecare zonă: Versilia, Lucca–Pisa, Golful Poeților, Firenze.

Descarcă nivelurile de zoom curent−1 până la curent+3, maximum ~2600 de dale odată
(în jur de 55 MB). Dacă zona e prea mare, îți spune să apropii harta.

Tot ce ai deschis o dată — poze, descrieri — rămâne și el salvat.

**Ce NU merge offline:** căutarea de locuri noi, explorarea unei zone, parcările la
cerere, vremea și calculul rutelor. Astea au nevoie de internet. Restul — hartă,
locuri, zile, buget, navigație, bifat vizitat — merge tot.

## Actualizări

Când vrei o versiune nouă, înlocuiești `index.html` în același loc.
Aplicația se actualizează la următoarea deschidere cu internet.
Hărțile descărcate **nu se pierd** la actualizare.

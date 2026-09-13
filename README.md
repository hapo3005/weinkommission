# Weinkommission Porn · Mosel

Digitale Erstpositionierung und neue Premium-Website für **Weinkommission Porn · Mosel**.

## Projektziel

Die Website soll Weinkommission Porn als seriöse, eigenständige und moderne B2B-Marke im Mosel-Weinmarkt positionieren. Im Mittelpunkt stehen Vertrauen, Marktkenntnis, Produktkenntnis, persönliche Beziehungen und eine klare Vermittlungsfunktion zwischen Erzeugern und Abnehmern.

## Gewählte Designrichtung

**Wine Trade Modernism × Mosel Geography**

Ausgewähltes Hero-Prinzip: **„Wein ist Vertrauenssache.“** mit ruhiger Mosel-Landschaft, präziser B2B-Typografie und klarer Verbindung von Wein, Markt und Menschen.

Die finale Website soll aus der realen Tätigkeit einer Weinkommission entstehen: präzise Geschäftskommunikation, Marktstruktur, Herkunft, Mosel-Geografie und persönliche Beziehungen. Keine generische Weingut-, Luxus- oder KI-Template-Ästhetik.

## Aktueller Status

| Bereich | Status |
|---|---|
| Geschäftsmodell Weinkommission | FULL |
| Mosel-Markt / Wettbewerb | FULL |
| Zielgruppen / Jobs-to-be-Done | FULL |
| Informationsarchitektur | FULL |
| Conversionstrategie | FULL |
| Drei Creative Directions | FULL |
| High-Fidelity Visual Target | FULL – Richtung B ausgewählt |
| Astro-Grundarchitektur | FULL |
| Homepage-Implementierung | PARTIAL – umgesetzt, Live-Build noch nicht verifiziert |
| Responsive CSS | PARTIAL – umgesetzt, Render-QA steht aus |
| 404 | PARTIAL – umgesetzt, Live-Test steht aus |
| Impressum | BLOCKED – reale Unternehmensdaten fehlen |
| Datenschutz | PARTIAL – technische Minimierung umgesetzt, finale Angaben fehlen |
| robots.txt | FULL – Preview blockiert Indexierung |
| Sitemap | PARTIAL – Preview-Sitemap vorhanden |
| GitHub Actions | PARTIAL – Workflow vorhanden, erster Lauf muss noch ausgelöst/verifiziert werden |
| SEO qualitativ | PARTIAL |
| Quantitative Keyworddaten / Semrush | BLOCKED – Plugin nicht verbunden |
| Domainverfügbarkeit | BLOCKED |
| ca. 200 Winzer | ZU VERIFIZIEREN |

## Technische Architektur

- Astro 7.3.2
- statische Auslieferung
- Vanilla CSS
- keine Client-JavaScript-Abhängigkeit für die Homepage
- GitHub Actions für Build und Deployment auf GitHub Pages
- kein Backend / CMS ohne nachgewiesenen Bedarf
- WCAG 2.2 AA als Ziel
- Mobile First
- `noindex` + robots blockiert solange Unternehmensdaten nicht freigegeben sind

## Informationsarchitektur – Arbeitsstand

- Start
- Weinkommission
- Tätigkeit
- Mosel & Netzwerk
- Arbeitsweise
- Kontakt
- Impressum
- Datenschutz
- 404

## Conversion – Arbeitsstand

Primärziel: qualifiziertes persönliches Gespräch / Geschäftsanbahnung.

Konkrete CTA-Varianten wie „Wein anbieten“ oder „Wein suchen“ werden erst aktiviert, wenn bestätigt ist, dass diese Einstiege dem realen Geschäftsmodell entsprechen.

## Faktenregel

Nicht verifizierte Unternehmensinformationen werden niemals als Tatsache veröffentlicht. Insbesondere offen:

- vollständiger Unternehmensname / Rechtsform
- Unternehmenssitz und Anschrift
- Ansprechpartner
- Telefon / E-Mail
- Gründungsjahr / Unternehmensgeschichte
- exaktes Leistungsspektrum
- Kundengruppen
- geografisches Tätigkeitsgebiet
- Struktur und Bedeutung des Netzwerks von ca. 200 Winzern
- Spezialisierungen, Regionen, Lagen
- Partner und Referenzen
- vorhandene Markenassets und reale Unternehmensfotografie

## Bildstatus

Der aktuelle Hero nutzt in der Preview ein frei nutzbares Pexels-Foto der Moselschleife bei Bremm von **tom analogicus**. Es ist ein klar gekennzeichnetes Entwurfsbild und keine Darstellung der Unternehmensrealität von Weinkommission Porn.

## Nächste Verifikation

1. Ersten GitHub-Actions-Lauf auslösen und Build prüfen.
2. Live-Render auf GitHub Pages prüfen.
3. Responsive QA für 320, 360, 375, 390, 412, 430 px sowie Tablet, Notebook und 1440+ durchführen.
4. Danach strukturell nachschärfen, nicht mit CSS-Patches.
5. Reale Unternehmensdaten und Fotografie integrieren.

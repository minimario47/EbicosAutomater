# Ebicos Automater Workbench

Svart/vit React-webbapp för EBICOS-automater med fokus på verkligt operativt arbete.

## Funktioner
- `SKAPA`: Generera ny automat från avsikt.
- `REDIGERA`: Förbättra befintlig automat.
- `FELSÖK`: Hitta syntax- och logikrisker före drift.
- `LADDA PDF`: Ladda ner resultatet som PDF.

## Primär kunskapskälla
Appen hämtar AI-kontext från:
- `public/knowledge/Automater7.txt` (utdrag från `Automater7.pdf`)
- `public/knowledge/Korplan8.txt` (utdrag från `Korplan8.pdf`)

## Säkerhet
GitHub Pages är statisk hosting. GitHub Secrets kan inte användas som hemlig runtime-nyckel i klienten.

- Appen läser `VITE_OPENAI_API_KEY` vid build.
- Sätt repo-secret `OPENAI_API_KEY` för GitHub Actions deploy.
- Om nyckeln saknas visas fel i UI och AI-körning stoppas.

## Lokalt
```bash
npm install
npm run dev
```

## Bygg
```bash
npm run build
npm run preview
```

## Deploy
Deploy-workflow finns i:
- `.github/workflows/deploy.yml`

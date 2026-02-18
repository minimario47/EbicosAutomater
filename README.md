# Ebicos Automater Workbench

Brutal black/white React workbench for EBICOS automations.

## What it does
- `CREATE`: Generate automation from intent.
- `EDIT`: Patch existing automation.
- `DEBUG`: Find syntax/logic risks before runtime.
- Uses `VL_TR_2020-0028` as primary source context (`public/knowledge/VL_TR_2020-0028.txt`).

## Security note (important)
GitHub Pages is static. A secret in GitHub Actions is not available as a secure runtime API for browser users.

- This app keeps API key in `sessionStorage` (browser session only).
- Do **not** inject OpenAI key into frontend build variables.
- Rotate any key that was shared in plaintext.

## Local run
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## GitHub Pages deploy (Actions)
1. Create repo and push:
```bash
git init
git add .
git commit -m "Initial Ebicos workbench"
git branch -M main
git remote add origin git@github.com:<OWNER>/<REPO>.git
git push -u origin main
```

2. Enable Pages with GitHub Actions build type:
```bash
gh api -X POST repos/<OWNER>/<REPO>/pages -f build_type=workflow
```
If Pages already exists:
```bash
gh api -X PUT repos/<OWNER>/<REPO>/pages -f build_type=workflow
```

3. Push to `main` again when needed:
```bash
git add .
git commit -m "Update"
git push
```

Workflow file: `.github/workflows/deploy.yml`

## Model
Default model field is `gpt-5.3-codex` and can be changed in the UI.

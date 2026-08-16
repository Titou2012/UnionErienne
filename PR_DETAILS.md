# PR: Mobile redesign — screenshots & mobile test guide

Merci d'avoir donné carte blanche — cette PR contient un redesign mobile-first, micro-interactions et un nouveau header/navigation. Ci‑dessous tu trouveras :

- Une checklist détaillée de validations
- Emplacements réservés pour captures d'écran before/after (à remplacer par les images générées)
- Un guide de test mobile (iOS/Android)
- Un petit script Node (Puppeteer) pour générer automatiquement des captures d'écran à différentes tailles

---

## Description des changements
- Réorganisation du HTML (header/nav accessible)
- Style mobile‑first, palette colorée, animations tactiles (ripple)
- JS: menu hamburger accessible, toggle thème, ripple sur éléments cliquables
- Suppression de la notion "carte blanche" (remplacée par un visuel original)

## Checklist PR
- [ ] Responsiveness: mobile/tablette/desktop
- [ ] Navigation accessible (aria, keyboard)
- [ ] Tap targets ≥ 44x44px
- [ ] Focus styles visibles pour keyboard navigation
- [ ] Micro‑interactions fonctionnelles (ripple, hover/focus)
- [ ] Images optimisées / lazy-loading si applicable
- [ ] Tests Lighthouse (mobile): score performance / accessibility / best-practices
- [ ] Ajout des captures d'écran before/after dans cette PR

## Captures d'écran (placeholders)
Remplace les images ci‑dessous par les captures réelles (uploader via l'interface GitHub ou générer avec `tools/screenshot.js` et glisser/déposer dans la PR).

### Before (ancienne branche `main`)

![](screenshots/before-320x568.png)
![](screenshots/before-375x812.png)
![](screenshots/before-768x1024.png)

### After (this branch `mobile-redesign`)

![](screenshots/after-320x568.png)
![](screenshots/after-375x812.png)
![](screenshots/after-768x1024.png)

---

## Comment générer les captures automatiquement (voir `docs/mobile_test_guide.md`)

1. Installer les dépendances: `npm install puppeteer --save-dev`
2. Démarrer un serveur statique pour la branche à tester (ex: `python3 -m http.server 8000`)
3. Lancer: `node tools/screenshot.js --url http://localhost:8000 --out screenshots/after`



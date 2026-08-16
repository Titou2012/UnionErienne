# Guide de test mobile (iOS / Android / Desktop)

Ce guide explique comment tester manuellement et automatiquement le rendu mobile et collecter des captures d'écran pour la PR.

## Objectifs de test
- Vérifier l'adaptabilité du design (responsive)
- Vérifier la navigation (menu hamburger, liens, clavier)
- Tester les micro‑interactions (ripple, hover, focus)
- Vérifier performance et accessibilité (Lighthouse)

## Viewports recommandés
- Mobile petit (iPhone SE / 320×568)
- Mobile standard (iPhone 12/13/14 — 375×812)
- Tablet portrait (768×1024)
- Desktop small (1366×768)

## Tests manuels rapides
1. Ouvrir la page sur un mobile réel ou dans l'inspecteur Responsive de Chrome/Firefox.
2. Vérifier le menu hamburger :
   - L'ouverture/fermeture fonctionne
   - Les liens sont accessibles au clavier (Tab)
   - `aria-expanded` se met à jour
3. Tester boutons et tuiles :
   - Toucher / cliquer — la micro‑interaction (ripple) apparaît
   - Focus visible au clavier
4. Vérifier les cibles tactiles (>=44×44px)
5. Vérifier contraste : textes lisibles (AA minimum)

## Génération automatique de captures (script Puppeteer)
Nous fournissons `tools/screenshot.js` pour capturer automatiquement à plusieurs tailles.

Prerequis:
- Node.js (14+)
- `npm install puppeteer --save-dev`

Usage:

1. Servir la branche à tester localement (exemple):
   - `git checkout main` (pour 'before')
   - `python3 -m http.server 8000`
   - Dans un nouveau terminal exécuter: `node tools/screenshot.js --url http://localhost:8000 --out screenshots/before`
2. Ensuite tester la branche `mobile-redesign`:
   - `git checkout mobile-redesign`
   - `python3 -m http.server 8000`
   - `node tools/screenshot.js --url http://localhost:8000 --out screenshots/after`

Les images seront enregistrées dans le dossier `screenshots/` avec des noms `viewport-WxH.png`.

## Lighthouse (optionnel) — audit rapide
Installer lighthouse ou utiliser Chrome DevTools > Lighthouse

Ex: en CLI (npm install -g lighthouse) :
```
lighthouse http://localhost:8000 --preset=mobile --output=json --output-path=./lighthouse-mobile.json
```

Vérifier les résultats dans `lighthouse-mobile.json` et corriger les items de performance/accessibilité.

## Comment ajouter les captures à la PR
- Captures manuelles : drag & drop directement dans le corps de la PR sur GitHub
- Captures automatiques : 
  - Générer localement avec `tools/screenshot.js`
  - Committer les images dans `screenshots/` sur la branche `mobile-redesign` ou téléverser via l'UI GitHub

## Tests supplémentaires recommandés
- Test sur iOS Safari et Android Chrome réels
- Test avec VoiceOver / TalkBack pour navigation


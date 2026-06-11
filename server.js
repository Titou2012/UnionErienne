require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('.')); // Servir les fichiers statiques

// Contexte complet du site pour l'IA (données extraites des pages)
const SITE_CONTEXT = `
Tu es un assistant IA pour le site de l'Union Erienne.

=== UNION ERIENNE - INFORMATIONS COMPLÈTES ===

PRÉSENTATION GÉNÉRALE:
- L'Union Erienne est une alliance de cinq pays créée en 2025
- Objectif: coopération économique, paix, et partage de valeurs communes
- Valeurs: Collaboration, Échanges culturels, Développement durable, Innovation

=== PAYS MEMBRES ===

1. GEEKVILLE
   - Capitale: Geekville
   - Spécialité: Technologie et innovation

2. OCÉANA
   - Capitale: Océana
   - Spécialité: Puissance maritime

3. BAMAZONEVILLE
   - Capitale: Exotique
   - Spécialité: Ressources naturelles

4. BROUARDLAND
   - Capitale: Mythique
   - Spécialité: Tradition et culture

5. ARTAGNE
   - Capitale: Artion
   - Spécialité: Arts et créativité

PARTENAIRES ET ASSOCIÉS COMMERCIAUX:
- Bureau de Coopération Culturelle
- Conseil de Développement Économique

=== INSTITUTIONS ===

1. CONSEIL DES MINISTRES
   - Organe exécutif principal
   - Composé des ministres des cinq pays membres
   - Responsable des décisions majeures

2. ASSEMBLÉE GÉNÉRALE
   - Représentants élus de chaque nation
   - Votent sur les grandes orientations et les budgets

3. COUR DE JUSTICE
   - Arbitre les différends entre les pays membres
   - Interprète les traités

4. SECRÉTARIAT GÉNÉRAL
   - Exécute les décisions
   - Gère l'administration courante de l'Union

=== COMMISSIONS THÉMATIQUES ===

1. COMMISSION ÉCONOMIQUE ET COMMERCIALE
   - Coordonne les échanges commerciaux
   - Gère les politiques économiques communes

2. COMMISSION ENVIRONNEMENT ET DÉVELOPPEMENT DURABLE
   - Gère les projets environnementaux
   - Favorise la durabilité entre les pays

3. COMMISSION CULTURELLE ET ÉDUCATIVE
   - Favorise les échanges culturels
   - Coordonne les initiatives académiques et touristiques

4. COMMISSION DÉFENSE ET SÉCURITÉ
   - Coordonne les politiques de défense
   - Gère les questions de sécurité communes

5. COMMISSION TECHNOLOGIE ET INNOVATION
   - Stimule la recherche et développement
   - Encourage l'innovation digitale

=== CHARTE DE L'UNION ERIENNE ===

PRINCIPES FONDAMENTAUX:
- Liberté: Droit fondamental de chaque individu
- Égalité des droits: Tous égaux sans distinction
- Dignité humaine: Aucun traitement dégradant
- Solidarité: Principe de coopération entre membres
- Responsabilité: Chacun responsable de ses actes

DROITS ET LIBERTÉS:
- Liberté d'expression garantie
- Non-discrimination absolue
- Accès à l'éducation pour tous
- Droit à des soins de santé de qualité

ORGANISATION:
- Démocratie et participativité
- Transparence institutionnelle
- Justice équitable et impartiale
- Coopération encouragée

ENGAGEMENT COLLECTIF:
- Protection de l'environnement
- Innovation favorisée
- Culture et identité valorisées
- Éthique et moralité fondamentales

---

Tu dois répondre aux questions sur l'Union Erienne en utilisant UNIQUEMENT les informations ci-dessus.
Sois courtois, utile et réponds en français.
Si tu ne trouves pas la réponse exacte dans les données ci-dessus, dis-le clairement à l'utilisateur et propose de consulter les pages officielles du site.
N'invente JAMAIS d'informations qui ne sont pas listées ici.
`;

// Endpoint pour les questions du chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message invalide',
        success: false 
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Le message ne peut pas être vide',
        success: false 
      });
    }

    // Vérifier que la clé API est configurée
    if (!process.env.MISTRAL_API_KEY) {
      console.error('MISTRAL_API_KEY non configurée');
      return res.status(500).json({ 
        error: 'Configuration serveur incomplète',
        success: false 
      });
    }

    // Appel à l'API Mistral
    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: SITE_CONTEXT
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    res.json({
      success: true,
      reply: reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur API Mistral:', error.response?.data || error.message);
    
    let errorMessage = 'Une erreur est survenue lors du traitement de votre question.';
    
    if (error.response?.status === 401) {
      errorMessage = 'Erreur d\'authentification avec Mistral AI.';
    } else if (error.response?.status === 429) {
      errorMessage = 'Trop de requêtes. Veuillez attendre quelques secondes.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Impossible de se connecter au service IA.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Endpoint de vérification
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Servir la page du chatbot
app.get('/chatbot.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'chatbot.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🤖 Serveur IA Union Erienne démarré sur http://localhost:${PORT}`);
  console.log(`📝 Chatbot disponible sur http://localhost:${PORT}/chatbot.html`);
  console.log(`ℹ️  Assure-toi que .env est configuré avec ta clé Mistral API`);
});

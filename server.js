require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

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

// Contexte OPTIMISÉ pour Mistral - Format très clair
const SITE_CONTEXT = `Tu es l'assistant IA officiel de l'Union Erienne. Tu dois TOUJOURS répondre UNIQUEMENT avec les informations ci-dessous.

DONNÉES OFFICIELLES DE L'UNION ERIENNE:

PAYS MEMBRES ET CAPITALES:

- Geekville → Capitale: Geekville
- Océana → Capitale: Océana  
- Bamazoneville → Capitale: Exotique
- Brouardland → Capitale: Mythique
- Artagne → Capitale: Artion

FAITS IMPORTANTS:
- Créée en 2025
- Objectif: Coopération économique, paix, partage de valeurs
- Valeurs: Collaboration, Échanges culturels, Développement durable, Innovation

INSTITUTIONS:
- Conseil des Ministres (organe exécutif, décisions majeures)
- Assemblée Générale (représentants élus, votent les orientations)
- Cour de Justice (arbitre les différends, interprète traités)
- Secrétariat Général (exécute décisions, administration)

COMMISSIONS:
1. Commission Économique et Commerciale (échanges commerciaux, politiques économiques)
2. Commission Environnement et Développement Durable (projets environnementaux)
3. Commission Culturelle et Éducative (échanges culturels, académiques, touristiques)
4. Commission Défense et Sécurité (politiques de défense)
5. Commission Technologie et Innovation (recherche, développement tech)

PARTENAIRES:
- Bureau de Coopération Culturelle
- Conseil de Développement Économique

CHARTE - PRINCIPES FONDAMENTAUX:
- Liberté: Droit fondamental garanti
- Égalité: Tous égaux sans distinction
- Dignité humaine: Aucun traitement dégradant
- Solidarité: Coopération entre membres
- Responsabilité: Chacun responsable de ses actes

CHARTE - DROITS ET LIBERTÉS:
- Liberté d'expression (respectant la dignité)
- Non-discrimination absolue
- Accès à l'éducation pour tous
- Droit à des soins de santé de qualité

CHARTE - ORGANISATION:
- Démocratie et participativité
- Transparence institutionnelle
- Justice équitable et impartiale
- Coopération encouragée

RÈGLES DE RÉPONSE:
1. Réponds UNIQUEMENT avec les données ci-dessus
2. Si la question n'est pas dans les données, dis clairement "Je n'ai pas cette information"
3. Sois courtois et en français
4. Ne propose jamais d'informations non listées ici
5. Si l'utilisateur pose une question hors sujet, invite-le poliment à revenir aux sujets de l'Union Erienne`;

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
        temperature: 0.3, // Réduit pour plus de cohérence
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

// Endpoint pour le formulaire de contact (sans envoi d'email)
app.post('/api/contact', async (req, res) => {
  try {
    const { nom, email, sujet, message } = req.body;

    if (!nom || !email || !sujet || !message) {
      return res.status(400).json({ success: false, error: 'Tous les champs sont requis' });
    }

    const contactRecipient = process.env.CONTACT_RECIPIENT || 'contact@unionerienne.eu';

    // On n'utilise plus nodemailer ici — on enregistre le message en log/fichier
    const logEntry = {
      nom,
      email,
      sujet,
      message,
      receivedAt: new Date().toISOString()
    };

    console.info('Contact message (recorded):', logEntry);

    // Sauvegarder dans un fichier local (non persistant sur certains hébergeurs)
    try {
      const filePath = path.join(__dirname, 'contact_messages.log');
      fs.appendFileSync(filePath, JSON.stringify(logEntry) + '\n');
    } catch (e) {
      console.warn('Impossible d\'écrire le fichier de log:', e.message);
    }

    return res.json({ success: true, message: 'Message reçu (enregistré). Configurez un service externe si vous souhaitez envoyer des emails.' });

  } catch (error) {
    console.error('Erreur endpoint /api/contact:', error.message || error);
    return res.status(500).json({ success: false, error: 'Erreur serveur lors de l\'envoi du message' });
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

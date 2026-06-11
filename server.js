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

// Données du site pour l'IA (contexte)
const SITE_CONTEXT = `
Tu es un assistant IA pour le site de l'Union Erienne.
L'Union Erienne est une union de 5 pays membres et associés commerciaux:
1. Geekville
2. Océana
3. Bamazoneville
4. Brouardland
5. Artagne

Tu dois répondre aux questions sur l'Union Erienne en utilisant les informations du site.
Sois courtois, utile et réponds en français.
Si tu ne sais pas la réponse, propose de consulter les pages du site ou de contacter directement.
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

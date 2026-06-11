/**
 * Widget Chatbot IA pour Union Erienne
 * Communication sécurisée avec le serveur (clé API protégée)
 */

class UnionErienneChatbot {
  constructor(apiUrl = '/api/chat') {
    this.apiUrl = apiUrl;
    this.conversationHistory = [];
    this.isLoading = false;
    this.init();
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
    this.loadConversationHistory();
  }

  createWidget() {
    const widgetHTML = `
      <div id="ue-chatbot-widget" class="ue-chatbot-widget">
        <button id="ue-chatbot-toggle" class="ue-chatbot-toggle" title="Ouvrir le chatbot">
          <span class="ue-chatbot-icon">💬</span>
          <span class="ue-chatbot-label">Aide IA</span>
        </button>
        
        <div id="ue-chatbot-container" class="ue-chatbot-container hidden">
          <div class="ue-chatbot-header">
            <h3>Assistant IA Union Erienne</h3>
            <button id="ue-chatbot-close" class="ue-chatbot-close">✕</button>
          </div>
          
          <div id="ue-chatbot-messages" class="ue-chatbot-messages">
            <div class="ue-message ue-message-bot">
              <div class="ue-message-content">
                Bonjour 👋 ! Je suis l'assistant IA de l'Union Erienne. Comment puis-je vous aider aujourd'hui ?
              </div>
            </div>
          </div>
          
          <div class="ue-chatbot-input-area">
            <input 
              id="ue-chatbot-input" 
              type="text" 
              placeholder="Posez votre question..." 
              class="ue-chatbot-input"
              disabled
            >
            <button id="ue-chatbot-send" class="ue-chatbot-send" disabled title="Envoyer">
              📤
            </button>
          </div>
        </div>
      </div>
    `;

    // Injecter le HTML
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Injecter le CSS
    this.injectStyles();
  }

  injectStyles() {
    const styles = `
      :root {
        --ue-primary: #2c3e50;
        --ue-accent: #e74c3c;
        --ue-bg: #ecf0f1;
        --ue-text: #2c3e50;
        --ue-border: #bdc3c7;
      }

      .ue-chatbot-widget {
        font-family: 'Cinzel', serif;
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999;
      }

      .ue-chatbot-toggle {
        background: linear-gradient(135deg, var(--ue-primary) 0%, var(--ue-accent) 100%);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 12px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        transition: all 0.3s ease;
      }

      .ue-chatbot-toggle:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
      }

      .ue-chatbot-icon {
        font-size: 18px;
      }

      .ue-chatbot-container {
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 380px;
        height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease;
      }

      .ue-chatbot-container.hidden {
        display: none;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .ue-chatbot-header {
        background: linear-gradient(135deg, var(--ue-primary) 0%, var(--ue-accent) 100%);
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .ue-chatbot-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .ue-chatbot-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      }

      .ue-chatbot-close:hover {
        transform: rotate(90deg);
      }

      .ue-chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: var(--ue-bg);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .ue-message {
        display: flex;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .ue-message-user {
        justify-content: flex-end;
      }

      .ue-message-bot {
        justify-content: flex-start;
      }

      .ue-message-content {
        max-width: 70%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.4;
        word-wrap: break-word;
      }

      .ue-message-user .ue-message-content {
        background: linear-gradient(135deg, var(--ue-primary) 0%, var(--ue-accent) 100%);
        color: white;
        border-bottom-right-radius: 4px;
      }

      .ue-message-bot .ue-message-content {
        background: white;
        color: var(--ue-text);
        border: 1px solid var(--ue-border);
        border-bottom-left-radius: 4px;
      }

      .ue-message-loading {
        display: flex;
        gap: 4px;
        padding: 10px 14px;
      }

      .ue-message-loading span {
        width: 8px;
        height: 8px;
        background: var(--ue-accent);
        border-radius: 50%;
        animation: bounce 1.4s infinite;
      }

      .ue-message-loading span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .ue-message-loading span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes bounce {
        0%, 80%, 100% {
          opacity: 0.3;
          transform: translateY(0);
        }
        40% {
          opacity: 1;
          transform: translateY(-10px);
        }
      }

      .ue-chatbot-input-area {
        display: flex;
        gap: 8px;
        padding: 12px;
        background: white;
        border-top: 1px solid var(--ue-border);
      }

      .ue-chatbot-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid var(--ue-border);
        border-radius: 6px;
        font-size: 13px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s ease;
      }

      .ue-chatbot-input:focus {
        border-color: var(--ue-accent);
      }

      .ue-chatbot-input:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
      }

      .ue-chatbot-send {
        background: linear-gradient(135deg, var(--ue-primary) 0%, var(--ue-accent) 100%);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 10px 14px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ue-chatbot-send:hover:not(:disabled) {
        transform: scale(1.05);
      }

      .ue-chatbot-send:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* Mode sombre */
      body.mode-sombre .ue-chatbot-messages {
        background: #2c3e50;
      }

      body.mode-sombre .ue-message-bot .ue-message-content {
        background: #34495e;
        color: #ecf0f1;
        border-color: #495a6b;
      }

      /* Responsive */
      @media (max-width: 480px) {
        .ue-chatbot-container {
          width: 100vw;
          height: 100vh;
          bottom: 0;
          right: 0;
          border-radius: 0;
          max-width: 100%;
          max-height: 100%;
        }

        .ue-message-content {
          max-width: 85%;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  attachEventListeners() {
    const toggle = document.getElementById('ue-chatbot-toggle');
    const close = document.getElementById('ue-chatbot-close');
    const send = document.getElementById('ue-chatbot-send');
    const input = document.getElementById('ue-chatbot-input');

    toggle.addEventListener('click', () => this.toggleChatbot());
    close.addEventListener('click', () => this.closeChatbot());
    send.addEventListener('click', () => this.sendMessage());

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !this.isLoading) {
        this.sendMessage();
      }
    });

    // Activer l'input une fois chargé
    setTimeout(() => {
      input.disabled = false;
      send.disabled = false;
    }, 500);
  }

  toggleChatbot() {
    const container = document.getElementById('ue-chatbot-container');
    const input = document.getElementById('ue-chatbot-input');
    
    container.classList.toggle('hidden');
    
    if (!container.classList.contains('hidden')) {
      input.focus();
    }
  }

  closeChatbot() {
    document.getElementById('ue-chatbot-container').classList.add('hidden');
  }

  async sendMessage() {
    const input = document.getElementById('ue-chatbot-input');
    const message = input.value.trim();

    if (!message || this.isLoading) return;

    // Ajouter le message utilisateur
    this.addMessage(message, 'user');
    input.value = '';
    this.isLoading = true;

    // Afficher l'indicateur de chargement
    this.showLoadingIndicator();

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur serveur');
      }

      const data = await response.json();
      
      if (data.success) {
        this.removeLoadingIndicator();
        this.addMessage(data.reply, 'bot');
        this.conversationHistory.push({ role: 'user', content: message });
        this.conversationHistory.push({ role: 'bot', content: data.reply });
        this.saveConversationHistory();
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      this.removeLoadingIndicator();
      console.error('Erreur:', error);
      this.addMessage(
        `❌ Erreur: ${error.message || 'Impossible de communiquer avec l\'IA'}`,
        'bot'
      );
    } finally {
      this.isLoading = false;
    }
  }

  addMessage(content, role) {
    const messagesDiv = document.getElementById('ue-chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ue-message ue-message-${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'ue-message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(contentDiv);
    messagesDiv.appendChild(messageDiv);

    // Auto-scroll vers le bas
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  showLoadingIndicator() {
    const messagesDiv = document.getElementById('ue-chatbot-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'ue-message ue-message-bot';
    loadingDiv.id = 'ue-loading-indicator';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'ue-message-loading';
    contentDiv.innerHTML = '<span></span><span></span><span></span>';

    loadingDiv.appendChild(contentDiv);
    messagesDiv.appendChild(loadingDiv);

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  removeLoadingIndicator() {
    const loading = document.getElementById('ue-loading-indicator');
    if (loading) loading.remove();
  }

  saveConversationHistory() {
    localStorage.setItem(
      'ue-chatbot-history',
      JSON.stringify(this.conversationHistory)
    );
  }

  loadConversationHistory() {
    const saved = localStorage.getItem('ue-chatbot-history');
    if (saved) {
      this.conversationHistory = JSON.parse(saved);
    }
  }
}

// Initialiser le chatbot quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
  window.unioErienneChatbot = new UnionErienneChatbot('/api/chat');
});

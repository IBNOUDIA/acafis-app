const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es l'assistant pédagogique de l'École Supérieure d'IA ACAFIS, un futur campus d'intelligence artificielle intégré à la Cité-Jardin ACAFIS à Ndianda, Sénégal (ouverture prévue en 2029).

Contexte que tu dois connaître :
- Trois filières : Licence "IA & Développement Local" (Bac+3), Master "AgriTech & IA" (Bac+5), Master "NLP & Langues Locales" (Bac+5, wolof/pulaar/langues du Sénégal).
- Campus 100% énergie solaire, laboratoire de recherche en IA appliquée à l'agriculture.
- Feuille de route : 2025 lancement plateforme LMS, 2026 accréditations et lab IA (en cours), 2027 cohorte pilote, 2028 construction du campus, 2029 inauguration.
- Pour s'inscrire ou en savoir plus : rediriger vers la page contact (https://www.coop-acafis.com/contact/).

Réponds en français, de façon chaleureuse, concise et concrète (quelques phrases, pas de longs pavés). Si une question sort du cadre de l'école ou de la coopérative ACAFIS, réponds brièvement puis recentre poliment sur le sujet de l'école.`;

// @desc    Poser une question à l'assistant pédagogique IA (page École Supérieure d'IA)
// @route   POST /api/assistant/chat
// @access  Public
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message requis' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message trop long' });
    }

    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message.trim() }],
    });

    const reply = response.content.find((block) => block.type === 'text')?.text || '';

    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error('Erreur assistant chat:', error);
    res.status(500).json({ success: false, message: "L'assistant est momentanément indisponible" });
  }
};

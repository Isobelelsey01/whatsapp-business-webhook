const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'your_verify_token_here';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification attempt...');

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      console.log('Verification failed - token mismatch');
      res.sendStatus(403);
    }
  } else {
    console.log('Missing mode or token');
    res.sendStatus(400);
  }
});

app.post('/webhook', async (req, res) => {
  console.log('Incoming webhook message:', JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages[0]) {
      const message = messages[0];
      const from = message.from;
      const messageBody = message.text?.body;
      const messageType = message.type;

      console.log(`Message from ${from}: ${messageBody}`);

      if (messageType === 'text') {
        await sendWhatsAppMessage(from, `You said: "${messageBody}". This is an automated response!`);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

async function sendWhatsAppMessage(to, message) {
  const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  
  const data = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: {
      body: message
 const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'your_verify_token_here';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Store conversation state (in production, use a database)
const conversationState = {};

// Webhook verification endpoint
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification attempt...');

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      console.log('Verification failed - token mismatch');
      res.sendStatus(403);
    }
  } else {
    console.log('Missing mode or token');
    res.sendStatus(400);
  }
});

// Webhook message receiver
app.post('/webhook', async (req, res) => {
  console.log('Incoming webhook:', JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages[0]) {
      const message = messages[0];
      const from = message.from;
      const messageBody = message.text?.body?.toLowerCase();
      const messageType = message.type;

      console.log(`Message from ${from}: ${messageBody}`);

      if (messageType === 'text' && messageBody) {
        await handleIncomingMessage(from, messageBody);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

// Main message handler with intelligent responses
async function handleIncomingMessage(from, messageBody) {
  const lowerMessage = messageBody.toLowerCase();
  
  // Initialize conversation state if new user
  if (!conversationState[from]) {
    conversationState[from] = {
      stage: 'initial',
      data: {}
    };
  }

  const state = conversationState[from];

  // Greeting keywords
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)$/)) {
    await sendWhatsAppMessage(from, 
      `Hello! 👋 Welcome to LC Virtual Assistant!\n\n` +
      `I'm here to help you discover how we can support your business with:\n\n` +
      `📧 Inbox & Calendar Management\n` +
      `✈️ Travel & Personal Admin\n` +
      `🤝 Client & Onboarding Support\n` +
      `⚙️ Onboarding & Backend Automations\n\n` +
      `To get started, could you tell me:\n` +
      `1️⃣ What type of business do you run?\n` +
      `2️⃣ What areas do you need help with?`
    );
    state.stage = 'collecting_info';
    return;
  }

  // Services inquiry
  if (lowerMessage.includes('service') || lowerMessage.includes('what do you do') || lowerMessage.includes('what do you offer')) {
    await sendWhatsAppMessage(from,
      `✨ LC Virtual Assistant Services:\n\n` +
      `📧 *Inbox & Calendar Management*\n` +
      `Keep your emails organized and schedule optimized\n\n` +
      `✈️ *Travel & Personal Admin*\n` +
      `Handle bookings, itineraries, and personal tasks\n\n` +
      `🤝 *Client & Onboarding Support*\n` +
      `Smooth client experiences from start to finish\n\n` +
      `⚙️ *Onboarding & Backend Automations*\n` +
      `Streamline your processes and save time\n\n` +
      `💼 We offer customized packages based on your needs!\n\n` +
      `What type of business do you run? This helps me recommend the right services for you.`
    );
    state.stage = 'collecting_info';
    return;
  }

  // Pricing inquiry
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('package') || lowerMessage.includes('rate')) {
    await sendWhatsAppMessage(from,
      `💰 *Pricing & Packages*\n\n` +
      `We offer flexible packages tailored to your specific needs! Our pricing depends on:\n\n` +
      `• Services required\n` +
      `• Hours per week/month\n` +
      `• Complexity of tasks\n\n` +
      `To give you an accurate quote, I'd love to learn more about:\n` +
      `1️⃣ Your business type\n` +
      `2️⃣ Which services interest you most\n` +
      `3️⃣ How many hours of support you need\n\n` +
      `Would you like to book a free discovery call to discuss your custom package? 📞`
    );
    state.stage = 'collecting_info';
    return;
  }

  // Booking inquiry
  if (lowerMessage.includes('book') || lowerMessage.includes('call') || lowerMessage.includes('meeting') || lowerMessage.includes('discovery')) {
    await sendWhatsAppMessage(from,
      `📞 *Book Your Free Discovery Call*\n\n` +
      `Great! I'd love to discuss how we can support your business.\n\n` +
      `To schedule your discovery call:\n\n` +
      `1️⃣ Share your availability (days/times that work for you)\n` +
      `2️⃣ Tell me about your business and what you need help with\n\n` +
      `Or simply reply with your preferred contact details and I'll reach out directly!\n\n` +
      `⏰ *Office Hours:* Monday-Friday, 9 AM - 5 PM GMT`
    );
    state.stage = 'booking';
    return;
  }

  // Hours/availability inquiry
  if (lowerMessage.includes('hours') || lowerMessage.includes('available') || lowerMessage.includes('when')) {
    await sendWhatsAppMessage(from,
      `⏰ *Working Hours*\n\n` +
      `Monday - Friday\n` +
      `9:00 AM - 5:00 PM GMT (London Time)\n\n` +
      `I typically respond to messages within a few hours during business hours.\n\n` +
      `Outside these hours, I'll get back to you first thing the next business day! ✨\n\n` +
      `How can I help you today?`
    );
    return;
  }

  // Contact/how to reach inquiry
  if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('reach')) {
    await sendWhatsAppMessage(from,
      `📱 *Get In Touch*\n\n` +
      `The best way to reach me is right here on WhatsApp!\n\n` +
      `You can also:\n` +
      `📧 Email: hello@lcvirtualassistant.com\n` +
      `💼 Book a discovery call to discuss your needs\n\n` +
      `What would you like to know about our services?`
    );
    return;
  }

  // Collecting business information
  if (state.stage === 'collecting_info') {
    // Store the information they're sharing
    if (!state.data.businessInfo) {
      state.data.businessInfo = messageBody;
      await sendWhatsAppMessage(from,
        `Thanks for sharing! 📝\n\n` +
        `Based on what you've told me, I can help identify the perfect services for your needs.\n\n` +
        `Would you like to:\n\n` +
        `1️⃣ Learn more about specific services\n` +
        `2️⃣ Discuss pricing and packages\n` +
        `3️⃣ Book a free discovery call\n\n` +
        `Just let me know what interests you most!`
      );
      state.stage = 'next_steps';
    }
    return;
  }

  // Default intelligent response
  await sendWhatsAppMessage(from,
    `Thank you for your message! 😊\n\n` +
    `I'm LC Virtual Assistant's automated assistant. I can help you with:\n\n` +
    `📋 Learn about our services\n` +
    `💰 Discuss pricing & packages\n` +
    `📞 Book a discovery call\n` +
    `⏰ Check our availability\n\n` +
    `What would you like to know more about?`
  );
}

// Function to send WhatsApp messages
async function sendWhatsAppMessage(to, message) {
  const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  
  const data = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: {
      preview_url: false,
      body: message
    }
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    throw error;
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.send('WhatsApp Business Webhook is running! 🚀');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`LC Virtual Assistant Bot is ready!`);
});

module.exports = app;
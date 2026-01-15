"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAISession = exports.analyzeContent = exports.cyberAssistant = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const vertexai_1 = require("@google-cloud/vertexai");
admin.initializeApp();
const db = admin.firestore();
// Initialize Vertex AI
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'normicyte-guardian';
const LOCATION = 'us-central1';
const vertexAI = new vertexai_1.VertexAI({ project: PROJECT_ID, location: LOCATION });
// Gemini model configuration
const model = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
    },
    safetySettings: [
        { category: vertexai_1.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: vertexai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: vertexai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: vertexai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: vertexai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: vertexai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: vertexai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: vertexai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
});
// ==================== MANDATORY SYSTEM PROMPT ====================
const SYSTEM_PROMPT = `You are NormiCyte AI, a cybersecurity awareness and investigation assistant.

Rules:
- Never give direct answers to active Digital Detective cases
- Never validate quiz answers
- Guide thinking, not conclusions
- Do not create fear
- Use real-world analogies
- Keep explanations simple and practical
- Be calm, mentor-style, non-alarming, and non-judgmental

Your expertise includes:
- Cyber hygiene best practices
- Phishing awareness and detection
- UPI/online payment fraud prevention (Indian context: PhonePe, GPay, Paytm)
- Strong password creation and management
- Social media privacy and safety
- Fake website and scam detection
- OTP security
- Job scam and loan/lottery scam awareness

When users ask about Digital Detective cases or quiz answers, respond with:
"मैं इसका सीधा जवाब नहीं दे सकता, लेकिन मैं आपको सोचने का तरीका बता सकता हूं..." (Hindi)
"I can't answer this directly, but here's how investigators usually think about this kind of evidence..." (English)

Always guide, never solve. Help users develop critical thinking skills.

Indian Cybercrime Helpline: 1930 (mention when relevant for reporting scams)`;
// Language enforcement instructions
const LANGUAGE_INSTRUCTIONS = {
    en: '\n\nIMPORTANT: Respond ONLY in English. Use clear, simple language.',
    hi: '\n\nमहत्वपूर्ण: केवल हिंदी (देवनागरी लिपि) में उत्तर दें। कोई भी अंग्रेजी शब्द या अक्षर का उपयोग न करें। पूरी तरह से हिंदी में जवाब दें।'
};
// Patterns to detect cheating attempts
const CHEATING_PATTERNS = [
    /correct\s*answer/i,
    /right\s*answer/i,
    /सही\s*जवाब/i,
    /सही\s*उत्तर/i,
    /which\s*option/i,
    /कौन\s*सा\s*विकल्प/i,
    /tell\s*me\s*the\s*answer/i,
    /जवाब\s*बताओ/i,
    /solve\s*(this|the)\s*case/i,
    /केस\s*हल\s*करो/i,
    /detective\s*case\s*answer/i,
    /quiz\s*answer/i,
];
function detectCheatingAttempt(message) {
    return CHEATING_PATTERNS.some(pattern => pattern.test(message));
}
// ==================== HELPER FUNCTIONS ====================
async function getUserLanguage(userId) {
    try {
        const profileDoc = await db.collection('profiles').doc(userId).get();
        if (profileDoc.exists) {
            const data = profileDoc.data();
            return (data === null || data === void 0 ? void 0 : data.language_preference) || 'en';
        }
        return 'en';
    }
    catch (error) {
        console.error('Error fetching user language:', error);
        return 'en';
    }
}
async function getSessionHistory(userId) {
    try {
        const sessionDoc = await db.collection('ai_sessions').doc(userId).get();
        if (sessionDoc.exists) {
            const data = sessionDoc.data();
            // Return last 10 messages for context
            return (data.messages || []).slice(-10);
        }
        return [];
    }
    catch (error) {
        console.error('Error fetching session history:', error);
        return [];
    }
}
async function updateSessionHistory(userId, messages) {
    try {
        // Keep only last 20 messages in storage
        const trimmedMessages = messages.slice(-20);
        await db.collection('ai_sessions').doc(userId).set({
            messages: trimmedMessages,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    catch (error) {
        console.error('Error updating session history:', error);
    }
}
// ==================== MAIN AI ASSISTANT FUNCTION ====================
exports.cyberAssistant = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e;
    // 1. Verify Firebase Auth
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to use the AI Assistant');
    }
    const userId = context.auth.uid;
    const { messages } = data;
    if (!messages || messages.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Messages array is required');
    }
    try {
        // 2. Get user language preference from Firestore
        const language = await getUserLanguage(userId);
        const languageInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;
        // 3. Get existing session history for context
        const sessionHistory = await getSessionHistory(userId);
        // 4. Get the latest user message
        const latestMessage = messages[messages.length - 1];
        // 5. Check for cheating attempts
        if (detectCheatingAttempt(latestMessage.content)) {
            const refusalMessage = language === 'hi'
                ? 'मैं इसका सीधा जवाब नहीं दे सकता। डिजिटल डिटेक्टिव केस और क्विज़ के जवाब देना मेरे दायरे से बाहर है। लेकिन मैं आपको साइबर सुरक्षा के बारे में सोचने का तरीका सिखा सकता हूं। क्या आप कोई विशिष्ट साइबर सुरक्षा अवधारणा समझना चाहते हैं?'
                : "I can't provide direct answers to Digital Detective cases or quiz questions. However, I can help you understand cybersecurity concepts and develop your investigative thinking. Would you like me to explain any specific cybersecurity concept?";
            return { message: refusalMessage };
        }
        // 6. Build conversation history for Gemini
        const combinedHistory = [...sessionHistory, ...messages.slice(0, -1)].slice(-10);
        const chatHistory = combinedHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));
        // 7. Create chat session with system prompt
        const chat = model.startChat({
            history: chatHistory.length > 0 ? chatHistory : undefined,
            systemInstruction: {
                role: 'system',
                parts: [{ text: SYSTEM_PROMPT + languageInstruction }],
            },
        });
        // 8. Send message to Gemini
        const result = await chat.sendMessage(latestMessage.content);
        const response = result.response;
        const assistantMessage = ((_e = (_d = (_c = (_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) ||
            (language === 'hi'
                ? 'क्षमा करें, मैं इस अनुरोध को संसाधित नहीं कर सका। कृपया पुनः प्रयास करें।'
                : "I'm sorry, I couldn't process that request. Please try again.");
        // 9. Update session history in Firestore
        const updatedMessages = [
            ...combinedHistory,
            latestMessage,
            { role: 'assistant', content: assistantMessage }
        ];
        await updateSessionHistory(userId, updatedMessages);
        return { message: assistantMessage };
    }
    catch (error) {
        console.error('Error in cyberAssistant:', error);
        throw new functions.https.HttpsError('internal', 'An error occurred while processing your request. Please try again.');
    }
});
// ==================== CONTENT ANALYSIS FUNCTION ====================
exports.analyzeContent = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e;
    // Verify Firebase Auth
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to use content analysis');
    }
    const userId = context.auth.uid;
    const { content, type } = data;
    if (!content || !type) {
        throw new functions.https.HttpsError('invalid-argument', 'Content and type are required');
    }
    try {
        // Get user language preference
        const language = await getUserLanguage(userId);
        const analysisPrompt = language === 'hi'
            ? `इस ${type} का साइबर खतरों के लिए विश्लेषण करें। निम्नलिखित प्रारूप में उत्तर दें:

## जोखिम स्तर
(निम्न/मध्यम/उच्च/गंभीर)

## खतरे का प्रकार
(यदि कोई हो - जैसे फिशिंग, स्कैम, मैलवेयर आदि)

## लाल झंडे
- संदिग्ध संकेतों की सूची

## सिफारिश
उपयोगकर्ता को क्या करना चाहिए

विश्लेषण करने के लिए सामग्री:
"""
${content}
"""

केवल हिंदी में उत्तर दें।`
            : `Analyze this ${type} for potential cyber threats. Provide response in this format:

## Risk Level
(Low/Medium/High/Critical)

## Threat Type
(if any - e.g., Phishing, Scam, Malware, etc.)

## Red Flags
- List specific suspicious indicators

## Recommendation
What the user should do

Content to analyze:
"""
${content}
"""`;
        const result = await model.generateContent(analysisPrompt);
        const response = result.response;
        const analysis = ((_e = (_d = (_c = (_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) ||
            (language === 'hi'
                ? 'इस सामग्री का विश्लेषण करने में असमर्थ। कृपया पुनः प्रयास करें।'
                : 'Unable to analyze this content. Please try again.');
        return { analysis };
    }
    catch (error) {
        console.error('Error in analyzeContent:', error);
        throw new functions.https.HttpsError('internal', 'An error occurred while analyzing the content. Please try again.');
    }
});
// ==================== CLEAR SESSION FUNCTION ====================
exports.clearAISession = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    try {
        await db.collection('ai_sessions').doc(userId).delete();
        return { success: true };
    }
    catch (error) {
        console.error('Error clearing session:', error);
        throw new functions.https.HttpsError('internal', 'Failed to clear session');
    }
});
//# sourceMappingURL=index.js.map
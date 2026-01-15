// AI Assistant service using Firebase Functions with Vertex AI (Gemini)
// With local demo mode fallback when Functions aren't deployed
import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functions } from './config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CyberAssistantResponse {
  message: string;
}

interface AnalyzeContentResponse {
  analysis: string;
}

interface ClearSessionResponse {
  success: boolean;
}

// Demo mode flag - set to true for local demo without deployed functions
const DEMO_MODE = true;

// Cheating detection patterns
const CHEATING_PATTERNS = [
  /correct\s*answer/i, /सही\s*जवाब/i, /सही\s*उत्तर/i,
  /which\s*option/i, /कौन\s*सा\s*option/i,
  /solve.*case/i, /केस.*सुलझा/i,
  /quiz\s*answer/i, /क्विज़.*जवाब/i,
  /tell\s*me\s*the\s*answer/i, /जवाब\s*बता/i,
  /what\s*is\s*the\s*answer/i, /उत्तर\s*क्या\s*है/i,
  /give\s*me.*solution/i, /solution\s*दो/i,
];

// Local AI response generator for demo
const generateLocalResponse = (messages: Message[], language: string = 'en'): string => {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
  const isHindi = language === 'hi' || /[\u0900-\u097F]/.test(lastMessage);
  
  // Check for cheating attempts
  for (const pattern of CHEATING_PATTERNS) {
    if (pattern.test(lastMessage)) {
      return isHindi
        ? "🚫 मैं डिजिटल डिटेक्टिव केस या क्विज़ के जवाब नहीं दे सकता। यह आपकी सीखने की यात्रा है!\n\nलेकिन मैं आपको साइबर सुरक्षा अवधारणाओं को समझने में मदद कर सकता हूं। कोई specific concept पूछें!"
        : "🚫 I cannot provide answers to Digital Detective cases or quizzes. This is your learning journey!\n\nBut I can help you understand cybersecurity concepts. Ask me about any specific topic!";
    }
  }

  // Phishing-related queries
  if (/phishing|फ़िशिंग|fishing|fake\s*email|नकली\s*ईमेल/i.test(lastMessage)) {
    return isHindi
      ? "🎣 **फ़िशिंग की पहचान कैसे करें:**\n\n1. **भेजने वाले का पता जांचें** - असली बैंक कभी gmail/yahoo से नहीं भेजते\n2. **Urgent/डरावने शब्द** - \"अभी करें वरना खाता बंद\"\n3. **संदिग्ध लिंक** - hover करके असली URL देखें\n4. **व्याकरण की गलतियाँ** - प्रोफेशनल कंपनियां गलतियाँ नहीं करतीं\n5. **व्यक्तिगत जानकारी मांगना** - बैंक कभी OTP/PIN नहीं मांगते\n\n⚠️ **याद रखें:** जब संदेह हो, सीधे बैंक की आधिकारिक वेबसाइट पर जाएं!"
      : "🎣 **How to Identify Phishing:**\n\n1. **Check sender address** - Real banks never use gmail/yahoo\n2. **Urgent/scary language** - \"Act now or account will be blocked\"\n3. **Suspicious links** - Hover to see the real URL\n4. **Grammar mistakes** - Professional companies don't make errors\n5. **Asking for personal info** - Banks never ask for OTP/PIN via email\n\n⚠️ **Remember:** When in doubt, go directly to the official website!";
  }

  // UPI/Payment fraud
  if (/upi|payment|पेमेंट|भुगतान|paytm|phonepe|gpay|google\s*pay|fraud/i.test(lastMessage)) {
    return isHindi
      ? "💳 **UPI धोखाधड़ी से बचाव:**\n\n1. **पैसे प्राप्त करने के लिए PIN की जरूरत नहीं** - यह सबसे बड़ा scam है!\n2. **QR code scan = पैसे भेजना** - कभी \"पैसे लेने के लिए\" scan न करें\n3. **अनजान requests reject करें** - सोचें कि कोई आपको पैसे क्यों भेजेगा\n4. **Screen share न करें** - कोई भी कस्टमर केयर screen share नहीं मांगता\n5. **AnyDesk/TeamViewer इंस्टॉल न करें**\n\n🛡️ **सुनहरा नियम:** अगर कोई पैसे देने का वादा करे और आपसे कुछ करवाए - यह SCAM है!"
      : "💳 **UPI Fraud Prevention:**\n\n1. **No PIN needed to RECEIVE money** - This is the biggest scam!\n2. **QR code scan = SENDING money** - Never scan to \"receive\" money\n3. **Reject unknown requests** - Think why would a stranger send you money?\n4. **Never screen share** - No customer care asks for screen sharing\n5. **Don't install AnyDesk/TeamViewer**\n\n🛡️ **Golden Rule:** If someone promises money and asks you to do something - it's a SCAM!";
  }

  // Password security
  if (/password|पासवर्ड|पास्वोर्ड|strong|secure|सुरक्षित/i.test(lastMessage)) {
    return isHindi
      ? "🔐 **मजबूत पासवर्ड बनाने के टिप्स:**\n\n1. **कम से कम 12 अक्षर** - जितना लंबा, उतना सुरक्षित\n2. **मिश्रण करें:**\n   - बड़े अक्षर (A-Z)\n   - छोटे अक्षर (a-z)\n   - नंबर (0-9)\n   - Special characters (!@#$%)\n\n3. **ये न करें:**\n   - जन्मदिन, नाम, 123456\n   - एक जैसा पासवर्ड हर जगह\n   - शब्दकोश के शब्द\n\n4. **Password Manager इस्तेमाल करें** - Bitwarden, 1Password\n\n💡 **उदाहरण:** `Meri@Cycle#2024Fast!` - याद रखने में आसान, तोड़ने में मुश्किल!"
      : "🔐 **Strong Password Tips:**\n\n1. **At least 12 characters** - Longer is stronger\n2. **Mix it up:**\n   - Uppercase (A-Z)\n   - Lowercase (a-z)\n   - Numbers (0-9)\n   - Special characters (!@#$%)\n\n3. **Avoid:**\n   - Birthdays, names, 123456\n   - Same password everywhere\n   - Dictionary words\n\n4. **Use a Password Manager** - Bitwarden, 1Password\n\n💡 **Example:** `My@Bike#2024Fast!` - Easy to remember, hard to crack!";
  }

  // OTP security
  if (/otp|ओटीपी|one\s*time|वन\s*टाइम|verification/i.test(lastMessage)) {
    return isHindi
      ? "🔑 **OTP सुरक्षा - जरूरी बातें:**\n\n**OTP कभी किसी को न बताएं क्योंकि:**\n- बैंक कभी OTP नहीं मांगते\n- कोई भी \"कस्टमर केयर\" OTP नहीं मांगता\n- OTP = आपके खाते की चाबी\n\n**आम OTP Scams:**\n1. \"आपका पार्सल आ गया, OTP बताएं\"\n2. \"KYC अपडेट के लिए OTP चाहिए\"\n3. \"गलती से पैसे भेज दिए, OTP से वापस करो\"\n\n⚠️ **याद रखें:** OTP मांगने वाला = धोखेबाज़!"
      : "🔑 **OTP Security - Must Know:**\n\n**Never share OTP because:**\n- Banks NEVER ask for OTP\n- No \"customer care\" needs OTP\n- OTP = Key to your account\n\n**Common OTP Scams:**\n1. \"Your parcel arrived, share OTP\"\n2. \"KYC update needs OTP\"\n3. \"Sent money by mistake, share OTP to return\"\n\n⚠️ **Remember:** Anyone asking for OTP = Fraudster!";
  }

  // Social media privacy
  if (/social\s*media|सोशल\s*मीडिया|facebook|instagram|whatsapp|privacy|प्राइवेसी/i.test(lastMessage)) {
    return isHindi
      ? "📱 **सोशल मीडिया सुरक्षा:**\n\n**Privacy Settings चेक करें:**\n1. Profile को Private रखें\n2. Location sharing बंद करें\n3. Two-Factor Authentication ON करें\n4. Login Alerts चालू करें\n\n**ये शेयर न करें:**\n- आधार/PAN कार्ड की फोटो\n- बोर्डिंग पास या टिकट\n- घर का पता\n- छुट्टी पर जाने की जानकारी\n\n**WhatsApp के लिए:**\n- Unknown groups से बाहर निकलें\n- Last seen/Profile photo \"My Contacts\" तक सीमित करें\n- Two-Step Verification ON करें"
      : "📱 **Social Media Security:**\n\n**Check Privacy Settings:**\n1. Keep profile Private\n2. Turn off location sharing\n3. Enable Two-Factor Authentication\n4. Turn on Login Alerts\n\n**Don't share:**\n- Aadhaar/PAN card photos\n- Boarding passes or tickets\n- Home address\n- Vacation plans\n\n**For WhatsApp:**\n- Leave unknown groups\n- Limit Last seen/Profile photo to \"My Contacts\"\n- Enable Two-Step Verification";
  }

  // What is/definition questions
  if (/what\s*is|क्या\s*है|क्या\s*होता|meaning|मतलब|define|explain/i.test(lastMessage)) {
    if (/malware|मैलवेयर/i.test(lastMessage)) {
      return isHindi
        ? "🦠 **Malware क्या है?**\n\nMalware = Malicious + Software (हानिकारक सॉफ्टवेयर)\n\n**प्रकार:**\n1. **Virus** - फाइलों को संक्रमित करता है\n2. **Trojan** - उपयोगी दिखता है, पर खतरनाक है\n3. **Ransomware** - फाइलें lock करके फिरौती मांगता है\n4. **Spyware** - गुप्त रूप से जासूसी करता है\n5. **Worm** - खुद को फैलाता है\n\n**बचाव:**\n- Antivirus updated रखें\n- Unknown links/attachments न खोलें\n- Official sources से ही download करें"
        : "🦠 **What is Malware?**\n\nMalware = Malicious + Software\n\n**Types:**\n1. **Virus** - Infects files\n2. **Trojan** - Looks useful but harmful\n3. **Ransomware** - Locks files, demands ransom\n4. **Spyware** - Secretly monitors you\n5. **Worm** - Self-replicating\n\n**Prevention:**\n- Keep antivirus updated\n- Don't open unknown links/attachments\n- Download only from official sources";
    }
    if (/vpn/i.test(lastMessage)) {
      return isHindi
        ? "🔒 **VPN क्या है?**\n\nVPN = Virtual Private Network\n\n**यह क्या करता है:**\n- आपका internet connection encrypt करता है\n- आपका IP address छुपाता है\n- Public WiFi पर सुरक्षा देता है\n\n**कब उपयोग करें:**\n- Public WiFi (café, airport)\n- Banking on shared networks\n- Privacy चाहिए तो\n\n**अच्छे VPNs:** ProtonVPN, NordVPN, ExpressVPN\n\n⚠️ Free VPNs से सावधान - वो आपका data बेच सकते हैं!"
        : "🔒 **What is VPN?**\n\nVPN = Virtual Private Network\n\n**What it does:**\n- Encrypts your internet connection\n- Hides your IP address\n- Provides security on public WiFi\n\n**When to use:**\n- Public WiFi (café, airport)\n- Banking on shared networks\n- When you need privacy\n\n**Good VPNs:** ProtonVPN, NordVPN, ExpressVPN\n\n⚠️ Be careful with free VPNs - they might sell your data!";
    }
  }

  // Greeting/Hello
  if (/^(hi|hello|hey|नमस्ते|हेलो|हाय)\s*$/i.test(lastMessage.trim())) {
    return isHindi
      ? "नमस्ते! 👋 मैं NormiCyte AI हूं, आपका साइबर सुरक्षा मेंटर।\n\nआप मुझसे पूछ सकते हैं:\n• फ़िशिंग की पहचान कैसे करें?\n• UPI fraud से कैसे बचें?\n• मजबूत पासवर्ड कैसे बनाएं?\n• सोशल मीडिया पर सुरक्षित कैसे रहें?\n\nकोई भी साइबर सुरक्षा सवाल पूछें!"
      : "Hello! 👋 I'm NormiCyte AI, your cybersecurity mentor.\n\nYou can ask me:\n• How to identify phishing?\n• How to prevent UPI fraud?\n• How to create strong passwords?\n• How to stay safe on social media?\n\nAsk any cybersecurity question!";
  }

  // Help/What can you do
  if (/help|मदद|what\s*can\s*you|क्या\s*कर\s*सकते/i.test(lastMessage)) {
    return isHindi
      ? "🛡️ **मैं आपकी मदद कर सकता हूं:**\n\n1. 🎣 **फ़िशिंग से बचाव** - नकली emails/SMS पहचानना\n2. 💳 **UPI सुरक्षा** - Online payment frauds से बचना\n3. 🔐 **पासवर्ड सुरक्षा** - मजबूत पासवर्ड बनाना\n4. 📱 **Social Media Privacy** - अपनी जानकारी सुरक्षित रखना\n5. 🔑 **OTP Safety** - OTP scams से बचना\n6. 🌐 **Safe Browsing** - Fake websites पहचानना\n\n**Analyze Tab** में कोई भी संदिग्ध message/email/URL paste करें - मैं check करूंगा!\n\nकोई specific topic पूछें!"
      : "🛡️ **I can help you with:**\n\n1. 🎣 **Phishing Protection** - Identifying fake emails/SMS\n2. 💳 **UPI Security** - Avoiding payment frauds\n3. 🔐 **Password Security** - Creating strong passwords\n4. 📱 **Social Media Privacy** - Protecting your information\n5. 🔑 **OTP Safety** - Avoiding OTP scams\n6. 🌐 **Safe Browsing** - Spotting fake websites\n\nPaste any suspicious message/email/URL in **Analyze Tab** - I'll check it!\n\nAsk about any specific topic!";
  }

  // Default response
  return isHindi
    ? "🤔 यह एक अच्छा सवाल है!\n\nमैं साइबर सुरक्षा विशेषज्ञ हूं। आप मुझसे पूछ सकते हैं:\n\n• **फ़िशिंग** - नकली emails/SMS की पहचान\n• **UPI Fraud** - Online payment scams से बचाव\n• **Password** - सुरक्षित पासवर्ड बनाना\n• **Social Media** - Privacy settings\n• **Malware/Virus** - बचाव के तरीके\n\nकृपया कोई specific साइबर सुरक्षा विषय पूछें!"
    : "🤔 That's a great question!\n\nI'm a cybersecurity expert. You can ask me about:\n\n• **Phishing** - Identifying fake emails/SMS\n• **UPI Fraud** - Preventing payment scams\n• **Passwords** - Creating secure passwords\n• **Social Media** - Privacy settings\n• **Malware/Virus** - Protection methods\n\nPlease ask about a specific cybersecurity topic!";
};

// Local content analysis for demo
const analyzeContentLocally = (content: string, type: string, language: string = 'en'): string => {
  const isHindi = language === 'hi';
  const contentLower = content.toLowerCase();
  
  // Detect threat indicators
  const threats: string[] = [];
  const safeIndicators: string[] = [];
  
  // Check for phishing indicators
  if (/urgent|immediately|act\s*now|तुरंत|जल्दी|अभी/i.test(content)) {
    threats.push(isHindi ? '⚠️ Urgent/डर पैदा करने वाली भाषा' : '⚠️ Urgent/fear-inducing language');
  }
  if (/click\s*here|इस\s*लिंक|bit\.ly|tinyurl/i.test(content)) {
    threats.push(isHindi ? '⚠️ संदिग्ध छोटा लिंक' : '⚠️ Suspicious shortened link');
  }
  if (/otp|पासवर्ड|password|cvv|pin|आधार|aadhaar|pan/i.test(content)) {
    threats.push(isHindi ? '🚨 व्यक्तिगत/वित्तीय जानकारी मांगी गई' : '🚨 Requesting personal/financial info');
  }
  if (/won|winner|lottery|लॉटरी|जीत|इनाम|prize|crore|लाख/i.test(content)) {
    threats.push(isHindi ? '🚨 नकली लॉटरी/इनाम का दावा' : '🚨 Fake lottery/prize claim');
  }
  if (/kyc|verify|सत्यापन|verification|update.*account/i.test(content)) {
    threats.push(isHindi ? '⚠️ KYC/सत्यापन का बहाना' : '⚠️ KYC/verification pretext');
  }
  if (/gmail\.com|yahoo\.com|hotmail/i.test(content) && /bank|बैंक|sbi|hdfc|icici/i.test(content)) {
    threats.push(isHindi ? '🚨 बैंक personal email से संपर्क नहीं करते' : '🚨 Banks don\'t use personal email domains');
  }
  if (/[0-9]{10}/.test(content) && /call|कॉल|फोन/i.test(content)) {
    threats.push(isHindi ? '⚠️ असत्यापित फोन नंबर' : '⚠️ Unverified phone number');
  }
  
  // Check for safe indicators
  if (/https:\/\/(www\.)?(sbi|hdfc|icici|axis|kotak)\.com/i.test(content)) {
    safeIndicators.push(isHindi ? '✅ आधिकारिक बैंक डोमेन' : '✅ Official bank domain');
  }
  if (/@(sbi|hdfc|icici|axis)\.co\.in/i.test(content)) {
    safeIndicators.push(isHindi ? '✅ आधिकारिक बैंक ईमेल' : '✅ Official bank email');
  }

  // Calculate risk level
  let riskLevel: string;
  let riskEmoji: string;
  if (threats.length >= 3) {
    riskLevel = isHindi ? 'उच्च जोखिम' : 'HIGH RISK';
    riskEmoji = '🔴';
  } else if (threats.length >= 1) {
    riskLevel = isHindi ? 'मध्यम जोखिम' : 'MEDIUM RISK';
    riskEmoji = '🟡';
  } else {
    riskLevel = isHindi ? 'कम जोखिम' : 'LOW RISK';
    riskEmoji = '🟢';
  }

  // Build response
  let response = isHindi
    ? `## ${riskEmoji} विश्लेषण परिणाम: ${riskLevel}\n\n**विश्लेषित सामग्री प्रकार:** ${type}\n\n`
    : `## ${riskEmoji} Analysis Result: ${riskLevel}\n\n**Content Type Analyzed:** ${type}\n\n`;

  if (threats.length > 0) {
    response += isHindi ? '### 🚩 पाए गए खतरे:\n' : '### 🚩 Threats Detected:\n';
    threats.forEach(t => response += `${t}\n`);
    response += '\n';
  }

  if (safeIndicators.length > 0) {
    response += isHindi ? '### ✅ सुरक्षित संकेत:\n' : '### ✅ Safe Indicators:\n';
    safeIndicators.forEach(s => response += `${s}\n`);
    response += '\n';
  }

  // Add recommendation
  response += isHindi ? '### 💡 सुझाव:\n' : '### 💡 Recommendation:\n';
  if (threats.length >= 3) {
    response += isHindi
      ? '**इस संदेश पर भरोसा न करें!** यह एक scam/phishing प्रयास है। किसी भी लिंक पर क्लिक न करें और कोई जानकारी साझा न करें।'
      : '**Do NOT trust this message!** This appears to be a scam/phishing attempt. Do not click any links or share any information.';
  } else if (threats.length >= 1) {
    response += isHindi
      ? 'सावधान रहें। आगे बढ़ने से पहले आधिकारिक चैनलों से सत्यापित करें।'
      : 'Be cautious. Verify through official channels before proceeding.';
  } else {
    response += isHindi
      ? 'यह सुरक्षित दिखता है, लेकिन हमेशा सतर्क रहें।'
      : 'This appears safe, but always stay vigilant.';
  }

  return response;
};

/**
 * Call the cyber-assistant Firebase Cloud Function (powered by Gemini AI)
 * Falls back to local demo mode if Functions aren't deployed
 */
export const callCyberAssistant = async (
  messages: Message[],
  language: string = 'en'
): Promise<{ message: string; error: Error | null }> => {
  // Use local demo mode
  if (DEMO_MODE) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    const response = generateLocalResponse(messages, language);
    return { message: response, error: null };
  }

  try {
    const cyberAssistant = httpsCallable<
      { messages: Message[] },
      CyberAssistantResponse
    >(functions, 'cyberAssistant');

    const result: HttpsCallableResult<CyberAssistantResponse> = await cyberAssistant({ messages });
    return { message: result.data.message, error: null };
  } catch (error: any) {
    console.error('Error calling cyber assistant:', error);
    
    // Handle specific Firebase function errors
    let errorMessage = 'Failed to connect to AI assistant';
    if (error.code === 'functions/unauthenticated') {
      errorMessage = 'Please sign in to use the AI assistant';
    } else if (error.code === 'functions/resource-exhausted') {
      errorMessage = 'AI service is temporarily unavailable. Please try again later.';
    } else if (error.code === 'functions/internal') {
      errorMessage = 'An error occurred. Please try again.';
    }
    
    return { message: '', error: new Error(errorMessage) };
  }
};

/**
 * Analyze suspicious content (emails, SMS, URLs, messages) for cyber threats
 * Falls back to local demo mode if Functions aren't deployed
 */
export const analyzeContent = async (
  content: string,
  type: 'email' | 'sms' | 'url' | 'message',
  language: string = 'en'
): Promise<{ analysis: string; error: Error | null }> => {
  // Use local demo mode
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    const analysis = analyzeContentLocally(content, type, language);
    return { analysis, error: null };
  }

  try {
    const analyzeFunc = httpsCallable<
      { content: string; type: string },
      AnalyzeContentResponse
    >(functions, 'analyzeContent');

    const result: HttpsCallableResult<AnalyzeContentResponse> = await analyzeFunc({ content, type });
    return { analysis: result.data.analysis, error: null };
  } catch (error: any) {
    console.error('Error analyzing content:', error);
    
    let errorMessage = 'Failed to analyze content';
    if (error.code === 'functions/unauthenticated') {
      errorMessage = 'Please sign in to use content analysis';
    } else if (error.code === 'functions/resource-exhausted') {
      errorMessage = 'Analysis service is temporarily unavailable. Please try again later.';
    }
    
    return { analysis: '', error: new Error(errorMessage) };
  }
};

/**
 * Clear the AI conversation session for the current user
 */
export const clearAISession = async (): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const clearFunc = httpsCallable<void, ClearSessionResponse>(functions, 'clearAISession');
    const result: HttpsCallableResult<ClearSessionResponse> = await clearFunc();
    return { success: result.data.success, error: null };
  } catch (error: any) {
    console.error('Error clearing AI session:', error);
    return { success: false, error: error as Error };
  }
};

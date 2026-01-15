// Firebase Seed Script for Missions, Campaigns, and Security Tips
// Run with: node scripts/seedMissionsCampaigns.cjs

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Default missions to seed
const missions = [
  {
    title_en: 'Spot the Phish',
    title_hi: 'फिशिंग पहचानें',
    description_en: 'Learn to identify phishing emails, messages, and websites',
    description_hi: 'फिशिंग ईमेल, संदेश और वेबसाइटों की पहचान करना सीखें',
    icon: 'zap',
    xp_reward: 100,
    duration_minutes: 10,
    difficulty: 'easy',
    category: 'phishing',
    content_type: 'quiz',
    is_active: true,
    display_order: 1,
    content: {
      introduction_en: 'Phishing is one of the most common cyber attacks. Learn to identify fake emails and messages.',
      introduction_hi: 'फिशिंग सबसे आम साइबर हमलों में से एक है। नकली ईमेल और संदेशों की पहचान करना सीखें।',
      sections: [
        {
          title_en: 'What is Phishing?',
          title_hi: 'फिशिंग क्या है?',
          content_en: 'Phishing is a type of social engineering attack where attackers impersonate legitimate organizations to steal sensitive information like passwords, credit card numbers, or personal data. Attackers often create urgency to pressure victims into quick action without verification.',
          content_hi: 'फिशिंग एक प्रकार का सोशल इंजीनियरिंग हमला है जहां हमलावर पासवर्ड, क्रेडिट कार्ड नंबर, या व्यक्तिगत डेटा जैसी संवेदनशील जानकारी चुराने के लिए वैध संगठनों का रूप धारण करते हैं।',
        },
        {
          title_en: 'Red Flags to Watch For',
          title_hi: 'सावधान रहने के संकेत',
          content_en: 'Look for: Misspelled domains (amaz0n.com vs amazon.com), urgent language ("Act now or lose access!"), generic greetings ("Dear Customer"), suspicious links, and unexpected requests for sensitive information.',
          content_hi: 'देखें: गलत वर्तनी वाले डोमेन, जल्दबाजी वाली भाषा, सामान्य अभिवादन, संदिग्ध लिंक, और संवेदनशील जानकारी के अनुरोध।',
        },
        {
          title_en: 'How to Verify Authenticity',
          title_hi: 'प्रामाणिकता कैसे सत्यापित करें',
          content_en: 'Always hover over links before clicking to see the actual URL. Contact the organization directly using official channels. Never share OTP or passwords via email or phone. When in doubt, verify through official websites.',
          content_hi: 'क्लिक करने से पहले हमेशा लिंक पर होवर करें। आधिकारिक चैनलों का उपयोग करके सीधे संगठन से संपर्क करें।',
        },
      ],
      quiz: [
        {
          question_en: 'An email from "support@amaz0n.com" asks you to verify your account urgently. What should you do?',
          question_hi: '"support@amaz0n.com" से एक ईमेल आपके खाते को तुरंत सत्यापित करने के लिए कहता है। आपको क्या करना चाहिए?',
          options: ['Click the link and verify immediately', 'Report as phishing and delete', 'Reply with your password', 'Forward to friends for advice'],
          correct_index: 1,
          explanation_en: 'The domain uses "0" (zero) instead of "o" - a common phishing trick! Legitimate Amazon emails come from amazon.com.',
          explanation_hi: 'डोमेन "o" के बजाय "0" (शून्य) का उपयोग करता है - एक आम फिशिंग चाल!',
        },
        {
          question_en: 'Which of these is a sign that an email might be a phishing attempt?',
          question_hi: 'इनमें से कौन सा संकेत है कि ईमेल फिशिंग प्रयास हो सकता है?',
          options: ['Personalized greeting with your full name', 'Urgent request to act within 24 hours', 'Email from company@company.com', 'Clear unsubscribe link at bottom'],
          correct_index: 1,
          explanation_en: 'Phishing emails often create artificial urgency to pressure you into acting without thinking.',
          explanation_hi: 'फिशिंग ईमेल अक्सर आपको बिना सोचे-समझे कार्य करने के लिए दबाव डालने के लिए कृत्रिम तात्कालिकता पैदा करते हैं।',
        },
      ],
    },
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'Secure Passwords',
    title_hi: 'सुरक्षित पासवर्ड',
    description_en: 'Create and manage strong, unbreakable passwords',
    description_hi: 'मजबूत, अटूट पासवर्ड बनाएं और प्रबंधित करें',
    icon: 'lock',
    xp_reward: 150,
    duration_minutes: 15,
    difficulty: 'easy',
    category: 'passwords',
    content_type: 'quiz',
    is_active: true,
    display_order: 2,
    content: {
      introduction_en: 'Strong passwords are your first line of defense against hackers.',
      introduction_hi: 'मजबूत पासवर्ड हैकर्स के खिलाफ आपकी रक्षा की पहली पंक्ति है।',
      sections: [
        {
          title_en: 'What Makes a Strong Password?',
          title_hi: 'मजबूत पासवर्ड क्या बनाता है?',
          content_en: 'A strong password should be at least 12 characters long and include a mix of uppercase letters, lowercase letters, numbers, and special characters. Avoid using personal information like birthdays, names, or common words.',
          content_hi: 'एक मजबूत पासवर्ड कम से कम 12 अक्षर लंबा होना चाहिए और इसमें अक्षरों, संख्याओं और विशेष वर्णों का मिश्रण होना चाहिए।',
        },
        {
          title_en: 'Password Managers',
          title_hi: 'पासवर्ड मैनेजर',
          content_en: 'Password managers help you create and store unique passwords for each account. Popular options include Bitwarden, 1Password, and Google Password Manager. You only need to remember one master password.',
          content_hi: 'पासवर्ड मैनेजर आपको प्रत्येक खाते के लिए अद्वितीय पासवर्ड बनाने और संग्रहीत करने में मदद करते हैं।',
        },
      ],
      quiz: [
        {
          question_en: 'Which password is the strongest?',
          question_hi: 'कौन सा पासवर्ड सबसे मजबूत है?',
          options: ['password123', 'MyBirthday1990', 'X#9kL$mN!2qR', 'qwerty12345'],
          correct_index: 2,
          explanation_en: 'Random combinations of uppercase, lowercase, numbers, and symbols are much harder to crack than predictable patterns.',
          explanation_hi: 'वर्णों के यादृच्छिक संयोजन को तोड़ना बहुत कठिन है।',
        },
        {
          question_en: 'How often should you change your passwords?',
          question_hi: 'आपको अपने पासवर्ड कितनी बार बदलने चाहिए?',
          options: ['Every day', 'Only when there is a breach', 'Never', 'Every hour'],
          correct_index: 1,
          explanation_en: 'Modern security advice suggests changing passwords when there is a known breach, rather than on a fixed schedule.',
          explanation_hi: 'आधुनिक सुरक्षा सलाह बताती है कि पासवर्ड तब बदलें जब कोई ज्ञात उल्लंघन हो।',
        },
      ],
    },
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'UPI Safety',
    title_hi: 'UPI सुरक्षा',
    description_en: 'Protect your UPI transactions from fraudsters',
    description_hi: 'अपने UPI लेनदेन को धोखेबाजों से बचाएं',
    icon: 'smartphone',
    xp_reward: 120,
    duration_minutes: 12,
    difficulty: 'medium',
    category: 'payments',
    content_type: 'quiz',
    is_active: true,
    display_order: 3,
    content: {
      introduction_en: 'UPI has revolutionized payments in India, but fraudsters are exploiting users who don\'t understand how it works.',
      introduction_hi: 'UPI ने भारत में भुगतान में क्रांति ला दी है, लेकिन धोखेबाज उन उपयोगकर्ताओं का शोषण कर रहे हैं जो नहीं समझते कि यह कैसे काम करता है।',
      sections: [
        {
          title_en: 'The Collect Request Scam',
          title_hi: 'कलेक्ट रिक्वेस्ट घोटाला',
          content_en: 'The most common UPI scam: Someone claims they will SEND you money but asks you to approve a "collect request". Remember: To RECEIVE money, you never need to approve anything. If someone asks you to approve/enter PIN to receive money, it\'s a scam!',
          content_hi: 'सबसे आम UPI घोटाला: कोई दावा करता है कि वे आपको पैसे भेजेंगे लेकिन "कलेक्ट रिक्वेस्ट" स्वीकृत करने के लिए कहते हैं। याद रखें: पैसे प्राप्त करने के लिए, आपको कभी भी कुछ भी स्वीकृत करने की आवश्यकता नहीं है।',
        },
        {
          title_en: 'QR Code Scams',
          title_hi: 'QR कोड घोटाले',
          content_en: 'Never scan a QR code to receive money. QR codes are only for SENDING money. If someone asks you to scan a QR code to receive payment, they are trying to steal from you.',
          content_hi: 'पैसे प्राप्त करने के लिए कभी भी QR कोड स्कैन न करें। QR कोड केवल पैसे भेजने के लिए हैं।',
        },
      ],
      quiz: [
        {
          question_en: 'An OLX buyer says they will send you advance payment and asks you to approve a collect request. What should you do?',
          question_hi: 'एक OLX खरीदार कहता है कि वे आपको अग्रिम भुगतान भेजेंगे और कलेक्ट रिक्वेस्ट स्वीकृत करने के लिए कहते हैं। आपको क्या करना चाहिए?',
          options: ['Approve it to receive the money', 'Decline and report the user', 'Enter your PIN', 'Ask them to send more'],
          correct_index: 1,
          explanation_en: 'To receive money via UPI, you NEVER need to approve a collect request or enter your PIN. This is 100% a scam!',
          explanation_hi: 'UPI से पैसे प्राप्त करने के लिए, आपको कभी भी कलेक्ट रिक्वेस्ट स्वीकृत करने या अपना PIN दर्ज करने की आवश्यकता नहीं है। यह 100% घोटाला है!',
        },
      ],
    },
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'Social Media Privacy',
    title_hi: 'सोशल मीडिया गोपनीयता',
    description_en: 'Protect your personal information on social platforms',
    description_hi: 'सोशल प्लेटफॉर्म पर अपनी व्यक्तिगत जानकारी की सुरक्षा करें',
    icon: 'users',
    xp_reward: 130,
    duration_minutes: 15,
    difficulty: 'medium',
    category: 'privacy',
    content_type: 'quiz',
    is_active: true,
    display_order: 4,
    content: {
      introduction_en: 'Your social media profiles reveal more about you than you think. Learn to protect your privacy.',
      introduction_hi: 'आपकी सोशल मीडिया प्रोफाइल आपके बारे में आपकी सोच से ज्यादा बताती है।',
      sections: [
        {
          title_en: 'What Information is at Risk?',
          title_hi: 'कौन सी जानकारी खतरे में है?',
          content_en: 'Birthday, location check-ins, photos of home/workplace, family member tags, travel plans - all this helps attackers build a profile for targeted scams or identity theft.',
          content_hi: 'जन्मदिन, स्थान चेक-इन, घर/कार्यस्थल की तस्वीरें, परिवार के सदस्यों के टैग, यात्रा योजनाएं - यह सब हमलावरों को लक्षित घोटालों के लिए प्रोफाइल बनाने में मदद करता है।',
        },
        {
          title_en: 'Privacy Settings to Change',
          title_hi: 'बदलने के लिए गोपनीयता सेटिंग्स',
          content_en: 'Make your profile private, limit who can see your posts, disable location tagging, review tagged photos before they appear on your profile, and be cautious with friend requests from strangers.',
          content_hi: 'अपनी प्रोफाइल को प्राइवेट बनाएं, सीमित करें कि कौन आपकी पोस्ट देख सकता है, और अजनबियों से मित्र अनुरोधों से सावधान रहें।',
        },
      ],
      quiz: [
        {
          question_en: 'Which of the following is safe to share publicly on social media?',
          question_hi: 'सोशल मीडिया पर सार्वजनिक रूप से साझा करना निम्नलिखित में से क्या सुरक्षित है?',
          options: ['Your home address', 'Your vacation dates while traveling', 'Your professional work portfolio', 'Your phone number'],
          correct_index: 2,
          explanation_en: 'A professional portfolio is generally safe to share. Avoid sharing personal details that could enable identity theft or targeted scams.',
          explanation_hi: 'एक पेशेवर पोर्टफोलियो साझा करना आम तौर पर सुरक्षित है।',
        },
      ],
    },
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'Safe Online Shopping',
    title_hi: 'सुरक्षित ऑनलाइन शॉपिंग',
    description_en: 'Shop safely and avoid e-commerce scams',
    description_hi: 'सुरक्षित रूप से खरीदारी करें और ई-कॉमर्स घोटालों से बचें',
    icon: 'shopping-cart',
    xp_reward: 140,
    duration_minutes: 12,
    difficulty: 'easy',
    category: 'shopping',
    content_type: 'quiz',
    is_active: true,
    display_order: 5,
    content: {
      introduction_en: 'Online shopping is convenient but comes with risks. Learn to identify fake sites and shop safely.',
      introduction_hi: 'ऑनलाइन शॉपिंग सुविधाजनक है लेकिन इसमें जोखिम भी हैं।',
      sections: [
        {
          title_en: 'Identifying Fake Shopping Sites',
          title_hi: 'नकली शॉपिंग साइटों की पहचान',
          content_en: 'Check for HTTPS, look for contact information, read reviews on independent sites, be wary of prices that seem too good to be true, and verify the domain name carefully.',
          content_hi: 'HTTPS की जांच करें, संपर्क जानकारी देखें, स्वतंत्र साइटों पर समीक्षाएं पढ़ें।',
        },
        {
          title_en: 'Safe Payment Practices',
          title_hi: 'सुरक्षित भुगतान प्रथाएं',
          content_en: 'Use credit cards for better fraud protection, enable transaction alerts, never share OTP for "verification", and prefer Cash on Delivery for unknown sellers.',
          content_hi: 'बेहतर धोखाधड़ी सुरक्षा के लिए क्रेडिट कार्ड का उपयोग करें, और अज्ञात विक्रेताओं के लिए कैश ऑन डिलीवरी पसंद करें।',
        },
      ],
      quiz: [
        {
          question_en: 'A website offers iPhone 15 for ₹5,000. What should you do?',
          question_hi: 'एक वेबसाइट ₹5,000 में iPhone 15 ऑफर करती है। आपको क्या करना चाहिए?',
          options: ['Buy immediately before offer ends', 'Share with friends', 'Verify the website and be suspicious', 'Enter card details quickly'],
          correct_index: 2,
          explanation_en: 'If a deal seems too good to be true, it probably is. Always verify unknown websites before purchasing.',
          explanation_hi: 'अगर कोई डील बहुत अच्छी लगती है, तो शायद वह सच नहीं है।',
        },
      ],
    },
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'Device Security',
    title_hi: 'डिवाइस सुरक्षा',
    description_en: 'Keep your phone and computer safe from threats',
    description_hi: 'अपने फोन और कंप्यूटर को खतरों से सुरक्षित रखें',
    icon: 'smartphone',
    xp_reward: 160,
    duration_minutes: 18,
    difficulty: 'hard',
    category: 'devices',
    content_type: 'quiz',
    is_active: true,
    display_order: 6,
    content: {
      introduction_en: 'Your devices contain your entire digital life. Learn to protect them from threats.',
      introduction_hi: 'आपके डिवाइस में आपका पूरा डिजिटल जीवन है।',
      sections: [
        {
          title_en: 'Essential Security Measures',
          title_hi: 'आवश्यक सुरक्षा उपाय',
          content_en: 'Keep software updated, use strong screen locks, enable find-my-device features, install apps only from official stores, and review app permissions regularly.',
          content_hi: 'सॉफ्टवेयर को अपडेट रखें, मजबूत स्क्रीन लॉक का उपयोग करें, और केवल आधिकारिक स्टोर से ऐप्स इंस्टॉल करें।',
        },
        {
          title_en: 'Recognizing Malware',
          title_hi: 'मैलवेयर की पहचान',
          content_en: 'Signs of infection: unusual battery drain, unexpected data usage, strange pop-ups, apps you didn\'t install, device running slow. If you notice these, scan with antivirus.',
          content_hi: 'संक्रमण के संकेत: असामान्य बैटरी ड्रेन, अप्रत्याशित डेटा उपयोग, अजीब पॉप-अप।',
        },
      ],
      quiz: [
        {
          question_en: 'You receive a link to download a "free" version of a paid app. What should you do?',
          question_hi: 'आपको एक पेड ऐप का "मुफ्त" वर्जन डाउनलोड करने के लिए एक लिंक मिलता है। आपको क्या करना चाहिए?',
          options: ['Download it to save money', 'Ignore it - it\'s likely malware', 'Share with friends', 'Try it on an old phone first'],
          correct_index: 1,
          explanation_en: 'Free versions of paid apps are usually malware in disguise. Only download from official app stores.',
          explanation_hi: 'पेड ऐप्स के मुफ्त वर्जन आमतौर पर छिपे हुए मैलवेयर होते हैं।',
        },
      ],
    },
    created_at: admin.firestore.Timestamp.now(),
  },
];

// Default campaigns to seed
const campaigns = [
  {
    title_en: 'UPI Safety Week',
    title_hi: 'UPI सुरक्षा सप्ताह',
    description_en: 'A comprehensive campaign to educate users about UPI payment safety and fraud prevention techniques. Learn to identify collect request scams, QR code frauds, and protect your digital payments.',
    description_hi: 'UPI भुगतान सुरक्षा और धोखाधड़ी रोकथाम तकनीकों के बारे में उपयोगकर्ताओं को शिक्षित करने के लिए एक व्यापक अभियान।',
    icon: '💳',
    gradient: 'from-neon-cyan/20 via-neon-blue/10 to-transparent',
    start_date: admin.firestore.Timestamp.fromDate(new Date('2026-01-06')),
    end_date: admin.firestore.Timestamp.fromDate(new Date('2026-01-31')),
    mission_ids: [],
    total_xp: 500,
    participant_count: 1247,
    status: 'active',
    is_featured: true,
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'Phishing Awareness Month',
    title_hi: 'फिशिंग जागरूकता माह',
    description_en: 'Learn to identify and report phishing attempts across email, SMS, WhatsApp, and social media platforms. Complete interactive simulations and earn rewards.',
    description_hi: 'ईमेल, SMS, WhatsApp और सोशल मीडिया प्लेटफॉर्म पर फिशिंग प्रयासों की पहचान और रिपोर्ट करना सीखें।',
    icon: '🎣',
    gradient: 'from-neon-violet/20 via-neon-blue/10 to-transparent',
    start_date: admin.firestore.Timestamp.fromDate(new Date('2026-02-01')),
    end_date: admin.firestore.Timestamp.fromDate(new Date('2026-02-28')),
    mission_ids: [],
    total_xp: 800,
    participant_count: 0,
    status: 'upcoming',
    is_featured: false,
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'Social Media Privacy Challenge',
    title_hi: 'सोशल मीडिया प्राइवेसी चैलेंज',
    description_en: 'Audit and improve your social media privacy settings to protect personal information from data harvesting. Learn what information you\'re exposing and how to control it.',
    description_hi: 'डेटा हार्वेस्टिंग से व्यक्तिगत जानकारी की सुरक्षा के लिए अपनी सोशल मीडिया प्राइवेसी सेटिंग्स का ऑडिट और सुधार करें।',
    icon: '🔒',
    gradient: 'from-neon-blue/20 via-neon-cyan/10 to-transparent',
    start_date: admin.firestore.Timestamp.fromDate(new Date('2026-03-01')),
    end_date: admin.firestore.Timestamp.fromDate(new Date('2026-03-31')),
    mission_ids: [],
    total_xp: 1000,
    participant_count: 0,
    status: 'upcoming',
    is_featured: false,
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'Password Security Sprint',
    title_hi: 'पासवर्ड सुरक्षा स्प्रिंट',
    description_en: 'A 2-week intensive to upgrade your password security. Set up password managers, enable 2FA, and learn to create unbreakable passwords.',
    description_hi: 'अपनी पासवर्ड सुरक्षा को अपग्रेड करने के लिए 2-सप्ताह का गहन कार्यक्रम।',
    icon: '🔐',
    gradient: 'from-amber-500/20 via-neon-cyan/10 to-transparent',
    start_date: admin.firestore.Timestamp.fromDate(new Date('2026-04-01')),
    end_date: admin.firestore.Timestamp.fromDate(new Date('2026-04-14')),
    mission_ids: [],
    total_xp: 600,
    participant_count: 0,
    status: 'upcoming',
    is_featured: false,
    created_at: admin.firestore.Timestamp.now(),
  },
];

// Security tips to seed
const securityTips = [
  {
    title_en: 'Never Share Your OTP',
    title_hi: 'अपना OTP कभी साझा न करें',
    content_en: 'Banks, payment apps, and legitimate services will NEVER ask for your OTP over phone, email, or message. If anyone asks, it\'s a scam. No exceptions!',
    content_hi: 'बैंक, पेमेंट ऐप्स और वैध सेवाएं कभी भी फोन, ईमेल या संदेश पर आपका OTP नहीं मांगेंगी। अगर कोई मांगता है, तो यह घोटाला है।',
    category: 'upi',
    severity: 'high',
    icon: 'shield',
    is_active: true,
    display_order: 1,
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'Check URL Before Login',
    title_hi: 'लॉगिन से पहले URL जांचें',
    content_en: 'Always verify the website URL before entering login credentials. Look for https:// and check for subtle misspellings like amaz0n.com or flipkart-offer.com.',
    content_hi: 'लॉगिन क्रेडेंशियल डालने से पहले हमेशा वेबसाइट URL सत्यापित करें। https:// देखें और सूक्ष्म गलत वर्तनी की जांच करें।',
    category: 'phishing',
    severity: 'high',
    icon: 'globe',
    is_active: true,
    display_order: 2,
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'Use Strong, Unique Passwords',
    title_hi: 'मजबूत, अद्वितीय पासवर्ड का उपयोग करें',
    content_en: 'Create unique passwords for each account with 12+ characters mixing letters, numbers, and symbols. Consider using a password manager like Bitwarden or 1Password.',
    content_hi: 'प्रत्येक खाते के लिए 12+ अक्षरों के साथ अद्वितीय पासवर्ड बनाएं जिसमें अक्षर, संख्याएं और प्रतीक हों।',
    category: 'password',
    severity: 'medium',
    icon: 'lock',
    is_active: true,
    display_order: 3,
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'Beware of Urgent Messages',
    title_hi: 'जल्दबाजी वाले संदेशों से सावधान रहें',
    content_en: 'Scammers create urgency ("Act now!", "Your account will be blocked!", "Limited time offer!") to make you act without thinking. Always take time to verify before acting.',
    content_hi: 'धोखेबाज आपको बिना सोचे-समझे कार्य करने के लिए जल्दबाजी पैदा करते हैं। कार्य करने से पहले हमेशा सत्यापित करें।',
    category: 'general',
    severity: 'medium',
    icon: 'alert-triangle',
    is_active: true,
    display_order: 4,
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'Verify Caller Identity',
    title_hi: 'कॉलर की पहचान सत्यापित करें',
    content_en: 'If someone calls claiming to be from a bank, government, or company - hang up and call the official number directly to verify. Never share details on incoming calls.',
    content_hi: 'अगर कोई बैंक या कंपनी से होने का दावा करते हुए कॉल करता है, तो फोन काटें और सत्यापित करने के लिए सीधे आधिकारिक नंबर पर कॉल करें।',
    category: 'phishing',
    severity: 'high',
    icon: 'phone',
    is_active: true,
    display_order: 5,
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'QR Codes are for Sending Only',
    title_hi: 'QR कोड केवल भेजने के लिए हैं',
    content_en: 'Never scan a QR code to RECEIVE money. QR codes are only for SENDING payments. If someone asks you to scan to receive, it\'s a scam!',
    content_hi: 'पैसे प्राप्त करने के लिए कभी भी QR कोड स्कैन न करें। QR कोड केवल भुगतान भेजने के लिए हैं।',
    category: 'upi',
    severity: 'high',
    icon: 'qr-code',
    is_active: true,
    display_order: 6,
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'Enable Two-Factor Authentication',
    title_hi: 'दो-कारक प्रमाणीकरण सक्षम करें',
    content_en: 'Enable 2FA on all important accounts (email, banking, social media). Even if your password is stolen, 2FA adds an extra layer of protection.',
    content_hi: 'सभी महत्वपूर्ण खातों पर 2FA सक्षम करें। भले ही आपका पासवर्ड चोरी हो जाए, 2FA सुरक्षा की अतिरिक्त परत जोड़ता है।',
    category: 'password',
    severity: 'medium',
    icon: 'key',
    is_active: true,
    display_order: 7,
    created_at: admin.firestore.Timestamp.now(),
  },
  {
    title_en: 'Review App Permissions',
    title_hi: 'ऐप अनुमतियों की समीक्षा करें',
    content_en: 'Regularly review what permissions apps have. Does a flashlight app really need access to your contacts and camera? Deny unnecessary permissions.',
    content_hi: 'नियमित रूप से समीक्षा करें कि ऐप्स के पास क्या अनुमतियां हैं। अनावश्यक अनुमतियों को अस्वीकार करें।',
    category: 'privacy',
    severity: 'low',
    icon: 'settings',
    is_active: true,
    display_order: 8,
    created_at: admin.firestore.Timestamp.now(),
  },
];

async function seedDatabase() {
  console.log('🚀 Starting database seeding...\n');

  try {
    // Seed missions
    console.log('📚 Seeding missions...');
    const missionsRef = db.collection('missions');
    for (const mission of missions) {
      await missionsRef.add(mission);
      console.log(`  ✅ Added mission: ${mission.title_en}`);
    }

    // Seed campaigns
    console.log('\n🎯 Seeding campaigns...');
    const campaignsRef = db.collection('campaigns');
    for (const campaign of campaigns) {
      await campaignsRef.add(campaign);
      console.log(`  ✅ Added campaign: ${campaign.title_en}`);
    }

    // Seed security tips
    console.log('\n💡 Seeding security tips...');
    const tipsRef = db.collection('security_tips');
    for (const tip of securityTips) {
      await tipsRef.add(tip);
      console.log(`  ✅ Added tip: ${tip.title_en}`);
    }

    console.log('\n✨ Database seeding completed successfully!');
    console.log(`
Summary:
  - ${missions.length} missions added
  - ${campaigns.length} campaigns added
  - ${securityTips.length} security tips added
`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

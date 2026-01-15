// Firebase Seed Script for Missions, Campaigns, and Security Tips
// Run with: node --loader ts-node/esm scripts/seedMissionsCampaigns.ts

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount as any),
});

const db = getFirestore();

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
    created_at: new Date(),
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
    created_at: new Date(),
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
    created_at: new Date(),
  },
];

// Default campaigns to seed
const campaigns = [
  {
    title_en: 'UPI Safety Week',
    title_hi: 'UPI सुरक्षा सप्ताह',
    description_en: 'A comprehensive campaign to educate users about UPI payment safety and fraud prevention techniques.',
    description_hi: 'UPI भुगतान सुरक्षा और धोखाधड़ी रोकथाम तकनीकों के बारे में उपयोगकर्ताओं को शिक्षित करने के लिए एक व्यापक अभियान।',
    icon: '💳',
    gradient: 'from-neon-cyan/20 via-neon-blue/10 to-transparent',
    start_date: new Date('2026-01-06'),
    end_date: new Date('2026-01-20'),
    mission_ids: [],
    total_xp: 500,
    status: 'active',
    is_featured: true,
    created_at: new Date(),
  },
  {
    title_en: 'Phishing Awareness Month',
    title_hi: 'फिशिंग जागरूकता माह',
    description_en: 'Learn to identify and report phishing attempts across email, SMS, WhatsApp, and social media platforms.',
    description_hi: 'ईमेल, SMS, WhatsApp और सोशल मीडिया प्लेटफॉर्म पर फिशिंग प्रयासों की पहचान और रिपोर्ट करना सीखें।',
    icon: '🎣',
    gradient: 'from-neon-violet/20 via-neon-blue/10 to-transparent',
    start_date: new Date('2026-02-01'),
    end_date: new Date('2026-02-28'),
    mission_ids: [],
    total_xp: 800,
    status: 'upcoming',
    is_featured: false,
    created_at: new Date(),
  },
  {
    title_en: 'Social Media Privacy Challenge',
    title_hi: 'सोशल मीडिया प्राइवेसी चैलेंज',
    description_en: 'Audit and improve your social media privacy settings to protect personal information from data harvesting.',
    description_hi: 'डेटा हार्वेस्टिंग से व्यक्तिगत जानकारी की सुरक्षा के लिए अपनी सोशल मीडिया प्राइवेसी सेटिंग्स का ऑडिट और सुधार करें।',
    icon: '🔒',
    gradient: 'from-neon-blue/20 via-neon-cyan/10 to-transparent',
    start_date: new Date('2026-03-01'),
    end_date: new Date('2026-03-31'),
    mission_ids: [],
    total_xp: 1000,
    status: 'upcoming',
    is_featured: false,
    created_at: new Date(),
  },
];

// Security tips to seed
const securityTips = [
  {
    title_en: 'Never Share Your OTP',
    title_hi: 'अपना OTP कभी साझा न करें',
    content_en: 'Banks, payment apps, and legitimate services will NEVER ask for your OTP over phone, email, or message. If anyone asks, it\'s a scam.',
    content_hi: 'बैंक, पेमेंट ऐप्स और वैध सेवाएं कभी भी फोन, ईमेल या संदेश पर आपका OTP नहीं मांगेंगी। अगर कोई मांगता है, तो यह घोटाला है।',
    category: 'upi',
    severity: 'high',
    icon: 'shield',
    is_active: true,
    display_order: 1,
    created_at: new Date(),
  },
  {
    title_en: 'Check URL Before Login',
    title_hi: 'लॉगिन से पहले URL जांचें',
    content_en: 'Always verify the website URL before entering login credentials. Look for https:// and check for subtle misspellings like amaz0n.com.',
    content_hi: 'लॉगिन क्रेडेंशियल डालने से पहले हमेशा वेबसाइट URL सत्यापित करें। https:// देखें और सूक्ष्म गलत वर्तनी की जांच करें।',
    category: 'phishing',
    severity: 'high',
    icon: 'globe',
    is_active: true,
    display_order: 2,
    created_at: new Date(),
  },
  {
    title_en: 'Use Strong, Unique Passwords',
    title_hi: 'मजबूत, अद्वितीय पासवर्ड का उपयोग करें',
    content_en: 'Create unique passwords for each account with 12+ characters mixing letters, numbers, and symbols. Consider using a password manager.',
    content_hi: 'प्रत्येक खाते के लिए 12+ अक्षरों के साथ अद्वितीय पासवर्ड बनाएं जिसमें अक्षर, संख्याएं और प्रतीक हों।',
    category: 'password',
    severity: 'medium',
    icon: 'lock',
    is_active: true,
    display_order: 3,
    created_at: new Date(),
  },
  {
    title_en: 'Beware of Urgent Messages',
    title_hi: 'जल्दबाजी वाले संदेशों से सावधान रहें',
    content_en: 'Scammers create urgency ("Act now!", "Your account will be blocked!") to make you act without thinking. Take time to verify.',
    content_hi: 'धोखेबाज आपको बिना सोचे-समझे कार्य करने के लिए जल्दबाजी पैदा करते हैं। सत्यापित करने के लिए समय लें।',
    category: 'general',
    severity: 'medium',
    icon: 'alert',
    is_active: true,
    display_order: 4,
    created_at: new Date(),
  },
  {
    title_en: 'Verify Caller Identity',
    title_hi: 'कॉलर की पहचान सत्यापित करें',
    content_en: 'If someone calls claiming to be from a bank or company, hang up and call the official number directly to verify.',
    content_hi: 'अगर कोई बैंक या कंपनी से होने का दावा करते हुए कॉल करता है, तो फोन काटें और सत्यापित करने के लिए सीधे आधिकारिक नंबर पर कॉल करें।',
    category: 'phishing',
    severity: 'high',
    icon: 'phone',
    is_active: true,
    display_order: 5,
    created_at: new Date(),
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
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

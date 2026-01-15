/**
 * Firebase Seed Script for Digital Detective Cases
 * 
 * This script seeds the case data from Supabase CSV exports into Firebase Firestore.
 * Run with: node seedCases.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Parse CSV with semicolon delimiter and handle quoted fields
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const data = [];
  
  let currentRecord = '';
  for (let i = 1; i < lines.length; i++) {
    currentRecord += (currentRecord ? '\n' : '') + lines[i];
    
    // Check if we have complete record (even number of quotes means complete)
    const quoteCount = (currentRecord.match(/"/g) || []).length;
    if (quoteCount % 2 === 0) {
      data.push(parseCSVLine(currentRecord, headers));
      currentRecord = '';
    }
  }
  
  return data;
}

function parseCSVLine(line, headers = null) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ';' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  if (headers) {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || '';
    });
    return obj;
  }
  
  return values;
}

// Cases data
const casesData = [
  {
    id: '3c01245a-b8b1-42b0-af72-0542b54bb54c',
    case_number: 'NC-2024-001',
    title_en: 'The Scholarship Scam',
    title_hi: 'छात्रवृत्ति घोटाला',
    description_en: 'A student received a message about winning a government scholarship. Your mission: Investigate if this is legitimate.',
    description_hi: 'एक छात्र को सरकारी छात्रवृत्ति जीतने का संदेश मिला। आपका मिशन: जांचें कि यह असली है या नहीं।',
    brief_en: `INCIDENT REPORT: On January 5th, 2024, a college student named Priya received an email claiming she had been selected for a prestigious government scholarship worth ₹50,000. The email came with urgent instructions to pay a "processing fee" to claim the reward. The student's family is excited but uncertain whether this is legitimate. As a cyber investigator, analyze all available evidence and determine: Is this a genuine scholarship opportunity or a sophisticated scam designed to exploit students?`,
    brief_hi: `घटना रिपोर्ट: 5 जनवरी, 2024 को एक कॉलेज छात्रा प्रिया को एक ईमेल मिला जिसमें दावा किया गया कि उसे ₹50,000 की प्रतिष्ठित सरकारी छात्रवृत्ति के लिए चुना गया है। ईमेल में पुरस्कार प्राप्त करने के लिए "प्रोसेसिंग शुल्क" भुगतान करने के तत्काल निर्देश थे। छात्रा का परिवार उत्साहित है लेकिन अनिश्चित है कि यह असली है या नहीं। एक साइबर जांचकर्ता के रूप में, सभी उपलब्ध सबूतों का विश्लेषण करें और निर्धारित करें: क्या यह एक वास्तविक छात्रवृत्ति अवसर है या छात्रों का शोषण करने के लिए बनाया गया एक परिष्कृत घोटाला?`,
    difficulty: 'beginner',
    threat_type: 'Financial Scam',
    xp_reward: 150,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'b11cea3f-c479-497e-b528-4ebaa16f6657',
    case_number: 'NC-2024-002',
    title_en: 'The Fake Internship Offer',
    title_hi: 'नकली इंटर्नशिप ऑफर',
    description_en: 'An engineering student received a dream internship offer from a major tech company. But something seems suspicious...',
    description_hi: 'एक इंजीनियरिंग छात्र को एक प्रमुख टेक कंपनी से सपनों की इंटर्नशिप ऑफर मिला। लेकिन कुछ संदिग्ध लग रहा है...',
    brief_en: `INCIDENT REPORT: Rahul, a 3rd-year computer science student, received what appeared to be a life-changing email. The message claimed to be from Microsoft HR, offering a remote internship with a monthly stipend of ₹1,00,000. The offer seemed too good to be true. Following initial communication via email, the "recruiter" moved conversations to WhatsApp and began requesting personal documents. Your task is to investigate this case thoroughly, analyze all communication patterns, and determine the legitimacy of this offer.`,
    brief_hi: `घटना रिपोर्ट: राहुल, तीसरे वर्ष के कंप्यूटर साइंस छात्र, को एक ऐसा ईमेल मिला जो जीवन बदलने वाला लग रहा था। संदेश में दावा किया गया कि यह माइक्रोसॉफ्ट एचआर से है, जो ₹1,00,000 मासिक भत्ते के साथ रिमोट इंटर्नशिप की पेशकश कर रहा है। ऑफर सच होने के लिए बहुत अच्छा लग रहा था। ईमेल के माध्यम से प्रारंभिक संचार के बाद, "भर्तीकर्ता" ने बातचीत व्हाट्सएप पर स्थानांतरित कर दी और व्यक्तिगत दस्तावेजों की मांग करने लगा। आपका काम इस मामले की पूरी जांच करना, सभी संचार पैटर्न का विश्लेषण करना और इस ऑफर की वैधता निर्धारित करना है।`,
    difficulty: 'intermediate',
    threat_type: 'Job Fraud',
    xp_reward: 250,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: '621e582c-3cb9-4053-8370-e8bd54624616',
    case_number: 'NC-2024-003',
    title_en: 'The Influencer Impersonation',
    title_hi: 'प्रभावशाली व्यक्ति का प्रतिरूपण',
    description_en: 'A popular social media influencer is being impersonated. Fans are losing money. Can you uncover the full extent of this scam?',
    description_hi: 'एक लोकप्रिय सोशल मीडिया प्रभावशाली व्यक्ति का प्रतिरूपण किया जा रहा है। प्रशंसक पैसे खो रहे हैं। क्या आप इस घोटाले की पूरी सीमा उजागर कर सकते हैं?',
    brief_en: `INCIDENT REPORT: Multiple complaints have been filed by followers of a popular travel influencer. An account that closely mimics the original influencer has been contacting followers with promises of giveaways and exclusive deals. The impersonator account uses nearly identical profile photos and a username with subtle character substitutions. Several victims have already sent money for "shipping fees" on promised prizes. Your investigation must trace the scam's patterns, identify all red flags, and provide a comprehensive threat assessment.`,
    brief_hi: `घटना रिपोर्ट: एक लोकप्रिय ट्रैवल प्रभावशाली व्यक्ति के अनुयायियों द्वारा कई शिकायतें दर्ज की गई हैं। एक ऐसा अकाउंट जो मूल प्रभावशाली व्यक्ति की नकल करता है, अनुयायियों से गिफ्ट और विशेष सौदों के वादे के साथ संपर्क कर रहा है। नकली अकाउंट लगभग समान प्रोफाइल फोटो और सूक्ष्म अक्षर प्रतिस्थापन वाले यूजरनेम का उपयोग करता है। कई पीड़ितों ने पहले से ही वादा किए गए पुरस्कारों पर "शिपिंग शुल्क" के लिए पैसे भेज दिए हैं। आपकी जांच में घोटाले के पैटर्न का पता लगाना, सभी लाल झंडों की पहचान करना और एक व्यापक खतरा मूल्यांकन प्रदान करना होगा।`,
    difficulty: 'advanced',
    threat_type: 'Social Engineering',
    xp_reward: 350,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Evidence data
const evidenceData = [
  // Case 1: Scholarship Scam
  {
    id: '00605f41-f198-44d0-8cc7-3a3fadab79b7',
    case_id: '3c01245a-b8b1-42b0-af72-0542b54bb54c',
    evidence_type: 'email',
    content_en: `From: scholarship.ministry@gov-india.net
To: priya.sharma@email.com
Subject: 🎉 CONGRATULATIONS! Government Scholarship Selection - ₹50,000

Dear Priya Sharma,

Congratulations! You have been selected for the Prime Minister's National Scholarship Scheme 2024. Your scholarship amount of ₹50,000 has been approved.

To claim your scholarship, please pay the processing fee of ₹499 within 24 hours.

Payment Link: bit.ly/claim-scholarship-2024

Regards,
Dr. R.K. Verma
Deputy Director, Ministry of Education
Government of India`,
    content_hi: `प्रेषक: scholarship.ministry@gov-india.net
प्राप्तकर्ता: priya.sharma@email.com
विषय: 🎉 बधाई हो! सरकारी छात्रवृत्ति चयन - ₹50,000

प्रिय प्रिया शर्मा,

बधाई हो! आपको प्रधानमंत्री राष्ट्रीय छात्रवृत्ति योजना 2024 के लिए चुना गया है। आपकी ₹50,000 की छात्रवृत्ति राशि स्वीकृत हो गई है।

अपनी छात्रवृत्ति प्राप्त करने के लिए, कृपया 24 घंटे के भीतर ₹499 का प्रोसेसिंग शुल्क भुगतान करें।

भुगतान लिंक: bit.ly/claim-scholarship-2024

सादर,
डॉ. आर.के. वर्मा
उप निदेशक, शिक्षा मंत्रालय
भारत सरकार`,
    display_order: 1
  },
  {
    id: '0f76290e-92ea-473a-85f3-bdfe3058818d',
    case_id: '3c01245a-b8b1-42b0-af72-0542b54bb54c',
    evidence_type: 'url',
    content_en: `Domain Analysis:
- Sender domain: gov-india.net
- Official government domain: gov.in
- WHOIS data: Domain registered 2 weeks ago
- Registration location: Private proxy server`,
    content_hi: `डोमेन विश्लेषण:
- प्रेषक डोमेन: gov-india.net
- आधिकारिक सरकारी डोमेन: gov.in
- WHOIS डेटा: डोमेन 2 सप्ताह पहले पंजीकृत
- पंजीकरण स्थान: निजी प्रॉक्सी सर्वर`,
    display_order: 2
  },
  {
    id: 'b16444be-1248-495f-bcfd-59db0274e06a',
    case_id: '3c01245a-b8b1-42b0-af72-0542b54bb54c',
    evidence_type: 'transaction',
    content_en: `Payment Link Trace:
bit.ly/claim-scholarship-2024 → redirects to → payment-gateway-secure.xyz
- SSL Certificate: Self-signed
- No UPI QR code, only card payment option
- No official bank gateway integration`,
    content_hi: `भुगतान लिंक ट्रेस:
bit.ly/claim-scholarship-2024 → रीडायरेक्ट करता है → payment-gateway-secure.xyz
- SSL प्रमाणपत्र: स्व-हस्ताक्षरित
- कोई UPI QR कोड नहीं, केवल कार्ड भुगतान विकल्प
- कोई आधिकारिक बैंक गेटवे एकीकरण नहीं`,
    display_order: 3
  },
  
  // Case 2: Fake Internship
  {
    id: '580a846a-14e8-491a-a8ac-048ec25fc409',
    case_id: 'b11cea3f-c479-497e-b528-4ebaa16f6657',
    evidence_type: 'email',
    content_en: `From: hr.recruitment@microsoft-careers.org
To: rahul.kumar@college.edu
Subject: Offer Letter - Microsoft India Remote Internship Program

Dear Rahul Kumar,

We are pleased to inform you that you have been selected for Microsoft's Remote Internship Program 2024.

Position: Software Development Intern
Stipend: ₹1,00,000/month
Duration: 6 months

To proceed, please send the following documents:
1. Aadhaar Card (front and back)
2. PAN Card
3. Bank Account Details
4. 2 Passport-size Photos

Reply to this email or contact our HR representative on WhatsApp: +91 98xxx xxxxx

Best Regards,
Sarah Johnson
HR Manager, Microsoft India`,
    content_hi: `प्रेषक: hr.recruitment@microsoft-careers.org
प्राप्तकर्ता: rahul.kumar@college.edu
विषय: ऑफर लेटर - माइक्रोसॉफ्ट इंडिया रिमोट इंटर्नशिप प्रोग्राम

प्रिय राहुल कुमार,

हमें आपको सूचित करते हुए खुशी हो रही है कि आपको माइक्रोसॉफ्ट के रिमोट इंटर्नशिप प्रोग्राम 2024 के लिए चुना गया है।

पद: सॉफ्टवेयर डेवलपमेंट इंटर्न
भत्ता: ₹1,00,000/माह
अवधि: 6 महीने

आगे बढ़ने के लिए, कृपया निम्नलिखित दस्तावेज भेजें:
1. आधार कार्ड (आगे और पीछे)
2. पैन कार्ड
3. बैंक खाता विवरण
4. 2 पासपोर्ट साइज फोटो

इस ईमेल का जवाब दें या व्हाट्सएप पर हमारे HR प्रतिनिधि से संपर्क करें: +91 98xxx xxxxx

सादर,
सारा जॉनसन
HR मैनेजर, माइक्रोसॉफ्ट इंडिया`,
    display_order: 1
  },
  {
    id: '32d0765c-542b-4c94-a7ad-56ea94ed6311',
    case_id: 'b11cea3f-c479-497e-b528-4ebaa16f6657',
    evidence_type: 'chat',
    content_en: `WhatsApp Chat Log:

[+91 98xxx xxxxx] 10:30 AM
Hello Rahul! This is Sarah from Microsoft HR. Did you receive our email?

[Rahul] 10:32 AM
Yes, I got it. Is this genuine?

[+91 98xxx xxxxx] 10:35 AM
Of course! This is an official Microsoft program. Please send your documents urgently.

[+91 98xxx xxxxx] 10:40 AM
Also, we need you to pay ₹5,000 for laptop shipping. Microsoft will reimburse this in your first salary.

[+91 98xxx xxxxx] 10:45 AM
Payment link: gpay://upi/pay?pa=user12345@ybl&pn=Microsoft&am=5000`,
    content_hi: `व्हाट्सएप चैट लॉग:

[+91 98xxx xxxxx] सुबह 10:30
नमस्ते राहुल! मैं माइक्रोसॉफ्ट HR से सारा हूं। क्या आपको हमारा ईमेल मिला?

[राहुल] सुबह 10:32
हां, मिला। क्या यह असली है?

[+91 98xxx xxxxx] सुबह 10:35
बिल्कुल! यह एक आधिकारिक माइक्रोसॉफ्ट प्रोग्राम है। कृपया अपने दस्तावेज़ जल्दी भेजें।

[+91 98xxx xxxxx] सुबह 10:40
इसके अलावा, हमें लैपटॉप शिपिंग के लिए ₹5,000 का भुगतान करना होगा। माइक्रोसॉफ्ट इसे आपकी पहली सैलरी में वापस कर देगा।

[+91 98xxx xxxxx] सुबह 10:45
भुगतान लिंक: gpay://upi/pay?pa=user12345@ybl&pn=Microsoft&am=5000`,
    display_order: 2
  },
  {
    id: 'b47538a1-e76c-400c-92a9-ebf0cc0dc950',
    case_id: 'b11cea3f-c479-497e-b528-4ebaa16f6657',
    evidence_type: 'url',
    content_en: `Domain Analysis:
- Sender domain: microsoft-careers.org
- Official Microsoft domain: microsoft.com
- No official Microsoft careers page at this domain
- UPI ID belongs to personal account, not corporate`,
    content_hi: `डोमेन विश्लेषण:
- प्रेषक डोमेन: microsoft-careers.org
- आधिकारिक माइक्रोसॉफ्ट डोमेन: microsoft.com
- इस डोमेन पर कोई आधिकारिक माइक्रोसॉफ्ट करियर पेज नहीं
- UPI ID व्यक्तिगत खाते की है, कॉर्पोरेट नहीं`,
    display_order: 3
  },
  
  // Case 3: Influencer Impersonation
  {
    id: '9ec6a7b8-c634-4b3b-b434-d0c7483aa577',
    case_id: '621e582c-3cb9-4053-8370-e8bd54624616',
    evidence_type: 'chat',
    content_en: `Instagram DM from @officiaI_traveler (note: lowercase L instead of i):

Hey there! 👋 I'm running an exclusive giveaway for my loyal followers!

🎁 Prize: iPhone 15 Pro Max
📦 Just pay ₹999 shipping fee

You've been selected as one of 10 lucky winners! 🎉

Send payment to: gpay.me/traveler-giveaway

Hurry! Offer expires in 2 hours! ⏰`,
    content_hi: `Instagram DM @officiaI_traveler से (नोट: i के बजाय छोटा L):

हाय! 👋 मैं अपने वफादार अनुयायियों के लिए एक विशेष गिवअवे चला रहा हूं!

🎁 पुरस्कार: iPhone 15 Pro Max
📦 बस ₹999 शिपिंग शुल्क भुगतान करें

आपको 10 भाग्यशाली विजेताओं में से एक के रूप में चुना गया है! 🎉

भुगतान भेजें: gpay.me/traveler-giveaway

जल्दी करें! ऑफर 2 घंटे में समाप्त! ⏰`,
    display_order: 1
  },
  {
    id: '6a01d9cc-d3e2-4c19-8c30-cb50e969f1f8',
    case_id: '621e582c-3cb9-4053-8370-e8bd54624616',
    evidence_type: 'url',
    content_en: `Profile Comparison:
Real Account: @official_traveler (540K followers, verified)
Fake Account: @officiaI_traveler (using capital I instead of lowercase L)
- 2,340 followers
- Created 3 days ago
- Same profile photo (stolen)
- Bio copied exactly`,
    content_hi: `प्रोफ़ाइल तुलना:
असली अकाउंट: @official_traveler (540K फॉलोअर्स, वेरिफाइड)
नकली अकाउंट: @officiaI_traveler (छोटे L के बजाय बड़े I का उपयोग)
- 2,340 फॉलोअर्स
- 3 दिन पहले बनाया गया
- वही प्रोफाइल फोटो (चोरी)
- बायो बिल्कुल कॉपी किया गया`,
    display_order: 2
  },
  {
    id: '7ed6d050-f959-41d8-8aba-f82dee0c9d53',
    case_id: '621e582c-3cb9-4053-8370-e8bd54624616',
    evidence_type: 'transaction',
    content_en: `Victim Reports (3 confirmed):
1. Anika, 19: Paid ₹999, no prize received
2. Vikram, 22: Paid ₹999, blocked after payment
3. Sneha, 24: Asked to pay "customs fee" of ₹2,499 after initial payment

Total amount scammed: ₹5,495+`,
    content_hi: `पीड़ित रिपोर्ट (3 पुष्ट):
1. अनिका, 19: ₹999 भुगतान किया, कोई पुरस्कार नहीं मिला
2. विक्रम, 22: ₹999 भुगतान किया, भुगतान के बाद ब्लॉक किया गया
3. स्नेहा, 24: प्रारंभिक भुगतान के बाद ₹2,499 का "कस्टम शुल्क" देने को कहा

कुल घोटाला राशि: ₹5,495+`,
    display_order: 3
  },
  {
    id: '724b98e7-0894-4c4f-b449-8bfde1c41d8a',
    case_id: '621e582c-3cb9-4053-8370-e8bd54624616',
    evidence_type: 'document',
    content_en: `Technical Analysis:
- IP Location: Different country than claimed
- Profile changes: Name changed 4 times in 3 days
- Link tracking: gpay.me redirects to personal UPI
- No verified badge despite claiming to be official`,
    content_hi: `तकनीकी विश्लेषण:
- IP स्थान: दावे से अलग देश
- प्रोफ़ाइल परिवर्तन: 3 दिनों में 4 बार नाम बदला
- लिंक ट्रैकिंग: gpay.me व्यक्तिगत UPI पर रीडायरेक्ट करता है
- आधिकारिक होने का दावा करने के बावजूद कोई वेरिफाइड बैज नहीं`,
    display_order: 4
  }
];

// Questions data
const questionsData = [
  // Case 1: Scholarship Scam
  {
    id: '279ba0ca-1d90-4b4b-aea2-f18d6672feb2',
    case_id: '3c01245a-b8b1-42b0-af72-0542b54bb54c',
    question_en: "What is the first red flag you notice in the email sender's address?",
    question_hi: "ईमेल भेजने वाले के पते में आप पहला लाल झंडा क्या देखते हैं?",
    question_type: 'multiple_choice',
    options: ["Using gov-india.net instead of gov.in", "The email contains emojis", "The subject line is too long", "The sender name is unfamiliar"],
    correct_answer: { answer: "Using gov-india.net instead of gov.in", index: 0 },
    explanation_en: "Official Indian government communications use the gov.in domain. Any variation like gov-india.net is a fake domain designed to look legitimate.",
    explanation_hi: "आधिकारिक भारत सरकार के संचार gov.in डोमेन का उपयोग करते हैं। gov-india.net जैसी कोई भी भिन्नता वैध दिखने के लिए बनाया गया नकली डोमेन है।",
    display_order: 1
  },
  {
    id: 'bb71757c-45e1-490b-b6ac-ce7eb82851fc',
    case_id: '3c01245a-b8b1-42b0-af72-0542b54bb54c',
    question_en: "Legitimate government scholarships typically:",
    question_hi: "वैध सरकारी छात्रवृत्तियां आमतौर पर:",
    question_type: 'multiple_choice',
    options: ["Never require upfront payment or processing fees", "Always use email for initial communication", "Require urgent action within 24 hours", "Send money through personal UPI IDs"],
    correct_answer: { answer: "Never require upfront payment or processing fees", index: 0 },
    explanation_en: "Genuine government scholarship programs NEVER ask for processing fees. All administrative costs are covered by the government. Any request for payment is a clear scam indicator.",
    explanation_hi: "वास्तविक सरकारी छात्रवृत्ति कार्यक्रम कभी भी प्रोसेसिंग शुल्क नहीं मांगते। सभी प्रशासनिक लागत सरकार द्वारा वहन की जाती है। भुगतान के लिए कोई भी अनुरोध एक स्पष्ट घोटाला संकेतक है।",
    display_order: 2
  },
  {
    id: '065ab4a2-2584-4a6c-8050-699d30fcbeea',
    case_id: '3c01245a-b8b1-42b0-af72-0542b54bb54c',
    question_en: "The payment link uses a URL shortener (bit.ly). Why is this concerning?",
    question_hi: "भुगतान लिंक URL शॉर्टनर (bit.ly) का उपयोग करता है। यह चिंताजनक क्यों है?",
    question_type: 'multiple_choice',
    options: ["It hides the true destination, which could be a phishing site", "URL shorteners are always malicious", "Government websites cannot use short links", "It makes the email look unprofessional"],
    correct_answer: { answer: "It hides the true destination, which could be a phishing site", index: 0 },
    explanation_en: "URL shorteners hide the actual destination. Scammers use them to disguise malicious links. Always hover over links to see the real URL before clicking.",
    explanation_hi: "URL शॉर्टनर वास्तविक गंतव्य छुपाते हैं। धोखेबाज दुर्भावनापूर्ण लिंक को छुपाने के लिए उनका उपयोग करते हैं। क्लिक करने से पहले वास्तविक URL देखने के लिए हमेशा लिंक पर होवर करें।",
    display_order: 3
  },
  {
    id: 'dffd4481-27ac-4f9f-8244-7a10bc975012',
    case_id: '3c01245a-b8b1-42b0-af72-0542b54bb54c',
    question_en: "Based on the WHOIS data, what does the recent domain registration suggest?",
    question_hi: "WHOIS डेटा के आधार पर, हाल की डोमेन पंजीकरण क्या सुझाव देता है?",
    question_type: 'short_answer',
    options: null,
    correct_answer: { keywords: ["recently created", "new domain", "suspicious", "scam", "fake", "temporary"] },
    explanation_en: "Domains registered just weeks before being used for \"official\" communications are almost always fraudulent. Legitimate government domains have been registered for years.",
    explanation_hi: "\"आधिकारिक\" संचार के लिए उपयोग किए जाने से कुछ ही सप्ताह पहले पंजीकृत डोमेन लगभग हमेशा धोखाधड़ी वाले होते हैं। वैध सरकारी डोमेन वर्षों से पंजीकृत हैं।",
    display_order: 4
  },
  {
    id: '55c04505-e006-4dc4-94a9-a4dd84e9ddc7',
    case_id: '3c01245a-b8b1-42b0-af72-0542b54bb54c',
    question_en: "What type of cyber threat does this case represent?",
    question_hi: "इस मामले में किस प्रकार का साइबर खतरा है?",
    question_type: 'multiple_choice',
    options: ["Financial Scam / Advance Fee Fraud", "Ransomware Attack", "Identity Theft", "Malware Distribution"],
    correct_answer: { answer: "Financial Scam / Advance Fee Fraud", index: 0 },
    explanation_en: "This is an Advance Fee Fraud where scammers promise a large reward (scholarship) but require a small upfront payment. Once paid, they either disappear or demand more money.",
    explanation_hi: "यह एक अग्रिम शुल्क धोखाधड़ी है जहां धोखेबाज एक बड़े इनाम (छात्रवृत्ति) का वादा करते हैं लेकिन एक छोटे अग्रिम भुगतान की आवश्यकता होती है। भुगतान के बाद, वे या तो गायब हो जाते हैं या अधिक पैसे की मांग करते हैं।",
    display_order: 5
  },
  
  // Case 2: Fake Internship
  {
    id: '01880704-5bf2-4cef-b45b-370fc93670b0',
    case_id: 'b11cea3f-c479-497e-b528-4ebaa16f6657',
    question_en: "What is suspicious about the email domain microsoft-careers.org?",
    question_hi: "microsoft-careers.org ईमेल डोमेन में क्या संदिग्ध है?",
    question_type: 'multiple_choice',
    options: ["Microsoft uses microsoft.com for all official communications", "The .org extension is never used by companies", "The domain name is too long", "All company emails should end in .in"],
    correct_answer: { answer: "Microsoft uses microsoft.com for all official communications", index: 0 },
    explanation_en: "Legitimate companies like Microsoft only use their official domain (microsoft.com). Any variation or look-alike domain is a phishing attempt.",
    explanation_hi: "माइक्रोसॉफ्ट जैसी वैध कंपनियां केवल अपने आधिकारिक डोमेन (microsoft.com) का उपयोग करती हैं। कोई भी भिन्नता या समान दिखने वाला डोमेन फ़िशिंग प्रयास है।",
    display_order: 1
  },
  {
    id: 'a81cffe4-8519-47e9-91b5-ebffcaaea496',
    case_id: 'b11cea3f-c479-497e-b528-4ebaa16f6657',
    question_en: "Why is the request to move communication to WhatsApp a red flag?",
    question_hi: "व्हाट्सएप पर संचार स्थानांतरित करने का अनुरोध लाल झंडा क्यों है?",
    question_type: 'multi_select',
    options: ["Professional recruitment uses official company email systems", "WhatsApp makes conversations harder to trace", "It bypasses company security protocols", "All of the above"],
    correct_answer: { answers: ["Professional recruitment uses official company email systems", "WhatsApp makes conversations harder to trace", "It bypasses company security protocols", "All of the above"], indices: [0, 1, 2, 3] },
    explanation_en: "Moving to personal messaging apps is a common scam tactic. It avoids corporate oversight, is harder to trace, and creates a false sense of personal connection.",
    explanation_hi: "व्यक्तिगत मैसेजिंग ऐप्स पर जाना एक आम घोटाला रणनीति है। यह कॉर्पोरेट निगरानी से बचता है, ट्रेस करना कठिन है, और व्यक्तिगत कनेक्शन की झूठी भावना पैदा करता है।",
    display_order: 2
  },
  {
    id: 'dd5b317b-236a-4795-bc8c-82f08de2233a',
    case_id: 'b11cea3f-c479-497e-b528-4ebaa16f6657',
    question_en: "The ₹1,00,000/month stipend for a student internship is:",
    question_hi: "छात्र इंटर्नशिप के लिए ₹1,00,000/माह का भत्ता है:",
    question_type: 'yes_no_reasoning',
    options: ["Yes, it is realistic", "No, it is unrealistically high"],
    correct_answer: { answer: "No, it is unrealistically high", index: 1 },
    explanation_en: "This amount is 3-4 times higher than typical internship stipends at top tech companies. Unusually high offers are designed to cloud judgment with excitement.",
    explanation_hi: "यह राशि शीर्ष टेक कंपनियों में सामान्य इंटर्नशिप भत्ते से 3-4 गुना अधिक है। असामान्य रूप से उच्च ऑफर उत्साह के साथ निर्णय को धुंधला करने के लिए डिज़ाइन किए गए हैं।",
    display_order: 3
  },
  {
    id: 'cd893e7e-9b84-4e0a-aa77-fe8753b679db',
    case_id: 'b11cea3f-c479-497e-b528-4ebaa16f6657',
    question_en: "What personal documents were requested, and why is this dangerous?",
    question_hi: "कौन से व्यक्तिगत दस्तावेज़ मांगे गए थे, और यह खतरनाक क्यों है?",
    question_type: 'short_answer',
    options: null,
    correct_answer: { keywords: ["aadhaar", "pan", "bank", "identity theft", "financial fraud", "loan", "steal"] },
    explanation_en: "Aadhaar, PAN, and bank details can be used for identity theft, fraudulent loans, and financial crimes. Never share these without verifying the request through official channels.",
    explanation_hi: "आधार, पैन और बैंक विवरण का उपयोग पहचान की चोरी, धोखाधड़ी वाले ऋण और वित्तीय अपराधों के लिए किया जा सकता है। आधिकारिक चैनलों के माध्यम से अनुरोध सत्यापित किए बिना इन्हें कभी साझा न करें।",
    display_order: 4
  },
  {
    id: '70481159-aa7a-49dc-8d47-43b3a0efb892',
    case_id: 'b11cea3f-c479-497e-b528-4ebaa16f6657',
    question_en: "The UPI payment is requested to user12345@ybl. What does this indicate?",
    question_hi: "UPI भुगतान user12345@ybl को अनुरोध किया गया है। यह क्या दर्शाता है?",
    question_type: 'multiple_choice',
    options: ["It is a personal account, not a corporate Microsoft account", "It is a verified Microsoft payment gateway", "YBL is Microsoft official payment partner", "All UPI IDs are equally safe"],
    correct_answer: { answer: "It is a personal account, not a corporate Microsoft account", index: 0 },
    explanation_en: "Corporate payments never use personal UPI IDs like @ybl or @paytm. Official corporate payments come through verified business accounts or invoice-based systems.",
    explanation_hi: "कॉर्पोरेट भुगतान कभी भी @ybl या @paytm जैसी व्यक्तिगत UPI ID का उपयोग नहीं करते। आधिकारिक कॉर्पोरेट भुगतान सत्यापित व्यावसायिक खातों या चालान-आधारित प्रणालियों के माध्यम से आते हैं।",
    display_order: 5
  },
  {
    id: 'e2671079-141e-419c-ba44-fd21e9b6086f',
    case_id: 'b11cea3f-c479-497e-b528-4ebaa16f6657',
    question_en: "What should Rahul do immediately?",
    question_hi: "राहुल को तुरंत क्या करना चाहिए?",
    question_type: 'multi_select',
    options: ["Report the incident to cybercrime.gov.in", "Verify the offer through official Microsoft careers page", "Block the WhatsApp number", "Warn others about this scam"],
    correct_answer: { answers: ["Report the incident to cybercrime.gov.in", "Verify the offer through official Microsoft careers page", "Block the WhatsApp number", "Warn others about this scam"], indices: [0, 1, 2, 3] },
    explanation_en: "All of these actions are recommended. Reporting helps authorities track scammers, verification prevents falling for scams, and warning others creates awareness.",
    explanation_hi: "इन सभी कार्यों की सिफारिश की जाती है। रिपोर्टिंग अधिकारियों को धोखेबाजों को ट्रैक करने में मदद करती है, सत्यापन घोटालों में फंसने से रोकता है, और दूसरों को चेतावनी देना जागरूकता पैदा करता है।",
    display_order: 6
  },
  
  // Case 3: Influencer Impersonation
  {
    id: 'ddbca50b-8664-452c-988b-7ce475e1694a',
    case_id: '621e582c-3cb9-4053-8370-e8bd54624616',
    question_en: "The fake account uses @officiaI_traveler. What technique is being used?",
    question_hi: "नकली अकाउंट @officiaI_traveler का उपयोग करता है। कौन सी तकनीक इस्तेमाल की जा रही है?",
    question_type: 'multiple_choice',
    options: ["Homograph/typosquatting attack (using similar-looking characters)", "SQL injection", "Man-in-the-middle attack", "Brute force attack"],
    correct_answer: { answer: "Homograph/typosquatting attack (using similar-looking characters)", index: 0 },
    explanation_en: "Homograph attacks use visually similar characters (like uppercase I for lowercase l) to create fake accounts that look identical to real ones. Always verify usernames carefully.",
    explanation_hi: "होमोग्राफ हमले दृष्टि से समान वर्णों का उपयोग करते हैं (जैसे छोटे l के लिए बड़ा I) नकली अकाउंट बनाने के लिए जो असली जैसे दिखते हैं। हमेशा यूजरनेम को ध्यान से सत्यापित करें।",
    display_order: 1
  },
  {
    id: '8b07b9d6-55d9-4503-a120-9dcfc9cff260',
    case_id: '621e582c-3cb9-4053-8370-e8bd54624616',
    question_en: "What are the red flags in the giveaway message?",
    question_hi: "गिवअवे संदेश में लाल झंडे क्या हैं?",
    question_type: 'multi_select',
    options: ["Asking for payment for a \"free\" prize", "Creating urgency with time limits", "Promise of expensive items for minimal cost", "All of these"],
    correct_answer: { answers: ["Asking for payment for a \"free\" prize", "Creating urgency with time limits", "Promise of expensive items for minimal cost", "All of these"], indices: [0, 1, 2, 3] },
    explanation_en: "Scammers use psychological manipulation: false urgency, too-good-to-be-true offers, and small payments to create commitment. Genuine giveaways never ask for money.",
    explanation_hi: "धोखेबाज मनोवैज्ञानिक हेरफेर का उपयोग करते हैं: झूठी तात्कालिकता, सच होने के लिए बहुत अच्छे ऑफर, और प्रतिबद्धता बनाने के लिए छोटे भुगतान। वास्तविक गिवअवे कभी पैसे नहीं मांगते।",
    display_order: 2
  },
  {
    id: 'a0dea851-e7ea-4307-8afb-8f076f8dfbcc',
    case_id: '621e582c-3cb9-4053-8370-e8bd54624616',
    question_en: "The fake account has 2,340 followers vs the real account's 540K. What does the follower discrepancy indicate?",
    question_hi: "नकली अकाउंट में 2,340 फॉलोअर्स हैं बनाम असली अकाउंट के 540K। फॉलोअर्स का अंतर क्या दर्शाता है?",
    question_type: 'short_answer',
    options: null,
    correct_answer: { keywords: ["fake", "new account", "impersonation", "not real", "recently created", "scam"] },
    explanation_en: "A massive follower difference is a clear sign of impersonation. Always check follower counts and account age when verifying celebrity or influencer accounts.",
    explanation_hi: "फॉलोअर्स में बड़ा अंतर प्रतिरूपण का स्पष्ट संकेत है। सेलिब्रिटी या प्रभावशाली खातों को सत्यापित करते समय हमेशा फॉलोअर काउंट और अकाउंट की उम्र जांचें।",
    display_order: 3
  },
  {
    id: '14af82d5-01b7-4bd2-88ff-4d5e8fa6e29a',
    case_id: '621e582c-3cb9-4053-8370-e8bd54624616',
    question_en: "Why did victims who paid ₹999 get asked for additional \"customs fees\"?",
    question_hi: "जिन पीड़ितों ने ₹999 का भुगतान किया, उनसे अतिरिक्त \"कस्टम शुल्क\" क्यों मांगा गया?",
    question_type: 'multiple_choice',
    options: ["It is an escalation tactic - once someone pays, they are more likely to pay again", "Customs fees are always legitimate", "The prize was shipped internationally", "Indian customs requires additional documentation"],
    correct_answer: { answer: "It is an escalation tactic - once someone pays, they are more likely to pay again", index: 0 },
    explanation_en: "This is the \"sunk cost\" psychological trap. Once victims invest money, they rationalize paying more hoping to recover their initial investment. Scammers exploit this.",
    explanation_hi: "यह \"डूबी लागत\" मनोवैज्ञानिक जाल है। एक बार पीड़ित पैसा लगाते हैं, वे अपने प्रारंभिक निवेश को वापस पाने की उम्मीद में अधिक भुगतान करने को तर्कसंगत बनाते हैं। धोखेबाज इसका शोषण करते हैं।",
    display_order: 4
  },
  {
    id: 'c25a21ea-b108-44c4-bc41-efcb99ce70a1',
    case_id: '621e582c-3cb9-4053-8370-e8bd54624616',
    question_en: "How can users verify if an influencer account is genuine?",
    question_hi: "उपयोगकर्ता कैसे सत्यापित कर सकते हैं कि प्रभावशाली खाता वास्तविक है?",
    question_type: 'multi_select',
    options: ["Check for the blue verification badge", "Compare follower count with known statistics", "Look at account creation date and history", "Visit official website for linked social profiles"],
    correct_answer: { answers: ["Check for the blue verification badge", "Compare follower count with known statistics", "Look at account creation date and history", "Visit official website for linked social profiles"], indices: [0, 1, 2, 3] },
    explanation_en: "Multiple verification methods should be used together. Scammers can fake individual signals, but rarely can fake all of them simultaneously.",
    explanation_hi: "कई सत्यापन विधियों का एक साथ उपयोग किया जाना चाहिए। धोखेबाज व्यक्तिगत संकेतों को नकली बना सकते हैं, लेकिन शायद ही कभी उन सभी को एक साथ नकली बना सकते हैं।",
    display_order: 5
  },
  {
    id: '6e466216-24bc-43f5-a546-1a6d8aec5fcc',
    case_id: '621e582c-3cb9-4053-8370-e8bd54624616',
    question_en: "What is the total financial and social impact of this scam based on the evidence?",
    question_hi: "सबूतों के आधार पर इस घोटाले का कुल वित्तीय और सामाजिक प्रभाव क्या है?",
    question_type: 'short_answer',
    options: null,
    correct_answer: { keywords: ["5495", "money", "trust", "victims", "blocked", "emotional", "damage"] },
    explanation_en: "Beyond the ₹5,495+ stolen, victims suffer emotional distress, loss of trust, and embarrassment. Some may not report due to shame, meaning actual damage is likely higher.",
    explanation_hi: "₹5,495+ की चोरी के अलावा, पीड़ित भावनात्मक संकट, विश्वास की हानि और शर्मिंदगी झेलते हैं। कुछ शर्म के कारण रिपोर्ट नहीं कर सकते, जिसका अर्थ है वास्तविक नुकसान संभवतः अधिक है।",
    display_order: 6
  },
  {
    id: 'e2e2487a-5cde-464d-84a9-3a723e78cf8d',
    case_id: '621e582c-3cb9-4053-8370-e8bd54624616',
    question_en: "What type of social engineering attack is this case primarily about?",
    question_hi: "यह मामला मुख्य रूप से किस प्रकार के सोशल इंजीनियरिंग हमले के बारे में है?",
    question_type: 'multiple_choice',
    options: ["Impersonation and Authority Exploitation", "Tailgating", "Dumpster Diving", "Shoulder Surfing"],
    correct_answer: { answer: "Impersonation and Authority Exploitation", index: 0 },
    explanation_en: "This attack exploits the trust and authority that influencers have over their followers. By impersonating a trusted figure, scammers bypass normal skepticism.",
    explanation_hi: "यह हमला प्रभावशाली व्यक्तियों के अपने अनुयायियों पर विश्वास और अधिकार का शोषण करता है। एक विश्वसनीय व्यक्ति का प्रतिरूपण करके, धोखेबाज सामान्य संदेह को बायपास करते हैं।",
    display_order: 7
  }
];

async function seedDatabase() {
  console.log('🚀 Starting Firebase seed process...\n');
  
  const batch = db.batch();
  
  // Seed Cases
  console.log('📁 Seeding cases...');
  for (const caseData of casesData) {
    const { id, ...data } = caseData;
    const docRef = db.collection('cases').doc(id);
    batch.set(docRef, data);
    console.log(`   ✓ Case: ${data.case_number} - ${data.title_en}`);
  }
  
  // Seed Evidence
  console.log('\n📋 Seeding evidence...');
  for (const evidence of evidenceData) {
    const { id, ...data } = evidence;
    const docRef = db.collection('case_evidence').doc(id);
    batch.set(docRef, data);
    console.log(`   ✓ Evidence: ${data.evidence_type} for case ${data.case_id.substring(0, 8)}...`);
  }
  
  // Seed Questions
  console.log('\n❓ Seeding questions...');
  for (const question of questionsData) {
    const { id, ...data } = question;
    const docRef = db.collection('case_questions').doc(id);
    batch.set(docRef, data);
    console.log(`   ✓ Question ${data.display_order}: ${data.question_en.substring(0, 50)}...`);
  }
  
  // Commit the batch
  console.log('\n💾 Committing to Firebase...');
  await batch.commit();
  
  console.log('\n✅ Database seeded successfully!');
  console.log(`   - ${casesData.length} cases`);
  console.log(`   - ${evidenceData.length} evidence items`);
  console.log(`   - ${questionsData.length} questions`);
  
  process.exit(0);
}

seedDatabase().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});

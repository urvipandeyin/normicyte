import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Landing & Auth
    'tagline': 'Cyber safety, normalized.',
    'subtitle': 'Your personal cyber command center. Train, detect, and defend against digital threats through AI-powered simulations.',
    'getStarted': 'Get Started with Google',
    'exploreDashboard': 'Explore Dashboard',
    'welcomeBack': 'Welcome back, Agent',
    'createAccount': 'Create Account',
    'loginSubtitle': 'Sign in to continue your cyber training',
    'signupSubtitle': 'Join the cyber defense force',
    'continueWithGoogle': 'Continue with Google',
    'orContinueWith': 'or continue with email',
    'email': 'Email',
    'password': 'Password',
    'signIn': 'Sign In',
    'signUp': 'Sign Up',
    'noAccount': "Don't have an account?",
    'hasAccount': 'Already have an account?',
    'backToHome': 'Back to Home',
    'loginSuccess': 'Welcome back, Agent!',
    'signupSuccess': 'Account created successfully!',
    'invalidCredentials': 'Invalid email or password',
    'emailAlreadyRegistered': 'This email is already registered',
    'logout': 'Logout',
    
    // Navigation
    'dashboard': 'Dashboard',
    'phishingSimulator': 'Phishing Simulator',
    'digitalDetective': 'Digital Detective',
    'missions': 'Training Missions',
    'campaigns': 'Campaigns',
    'aiAssistant': 'AI Assistant',
    'profile': 'Profile',
    
    // Dashboard
    'commandCenter': 'Cyber Command Center',
    'normiCyteScore': 'NormiCyte Score',
    'threatFeed': 'Threat Detection Feed',
    'activeMissions': 'Active Missions',
    'awareness': 'Awareness Campaigns',
    
    // Profile Setup
    'chooseAvatar': 'Choose Your Avatar',
    'avatarSubtitle': 'Select a cyber avatar or upload your own',
    'uploadCustom': 'Upload Custom',
    'uploading': 'Uploading...',
    'avatarUploaded': 'Avatar uploaded!',
    'uploadFailed': 'Upload failed',
    'invalidFileType': 'Please select an image file',
    'fileTooLarge': 'File must be less than 2MB',
    'yourIdentity': 'Your Identity',
    'identitySubtitle': 'How should we address you, Agent?',
    'displayName': 'Display Name',
    'displayNamePlaceholder': 'Agent Cyber',
    'username': 'Username',
    'optional': 'optional',
    'selectRole': 'Select Your Role',
    'roleSubtitle': 'What describes you best?',
    'roleStudent': 'Student',
    'roleStudentDesc': 'Learning cyber safety in school/college',
    'roleBeginner': 'Beginner',
    'roleBeginnerDesc': 'New to cybersecurity concepts',
    'roleCyberLearner': 'Cyber Learner',
    'roleCyberLearnerDesc': 'Actively improving cyber skills',
    'roleEnthusiast': 'Enthusiast',
    'roleEnthusiastDesc': 'Passionate about cybersecurity',
    'selectLanguage': 'Select Language',
    'languageSubtitle': 'Choose your preferred language',
    'back': 'Back',
    'next': 'Next',
    'complete': 'Complete Setup',
    'saving': 'Saving...',
    'enterDisplayName': 'Please enter a display name',
    'profileCreated': 'Profile created successfully!',
    'profileUpdateFailed': 'Failed to update profile',
    
    // Digital Detective
    'caseFiles': 'Case Files',
    'evidencePanel': 'Evidence Panel',
    'identifyThreat': 'Identify Threat Type',
    'submitAnalysis': 'Submit Analysis',
    'caseSolved': 'Case Solved',
    'caseList': 'Case List',
    'allCases': 'All Cases',
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
    'notStarted': 'Not Started',
    'inProgress': 'In Progress',
    'submitted': 'Submitted',
    'reviewed': 'Reviewed',
    'startInvestigation': 'Start Investigation',
    'continueInvestigation': 'Continue Investigation',
    'viewResults': 'View Results',
    'investigationObjective': 'Investigation Objective',
    'evidenceRoom': 'Evidence Room',
    'question': 'Question',
    'of': 'of',
    'saveAndContinue': 'Save & Continue',
    'submitFinalAnalysis': 'Submit Final Analysis',
    'yourResponses': 'Your Responses',
    'confirmSubmission': 'I confirm this is my final analysis',
    'submissionWarning': 'This submission is final and cannot be changed.',
    'caseVerdict': 'Case Verdict',
    'solved': 'Solved',
    'partiallySolved': 'Partially Solved',
    'needsImprovement': 'Needs Improvement',
    'accuracyScore': 'Accuracy Score',
    'questionReview': 'Question Review',
    'yourAnswer': 'Your Answer',
    'correctAnswer': 'Correct Answer',
    'explanation': 'Explanation',
    'keyLearning': 'Key Learning',
    'backToCases': 'Back to Cases',
    'xpEarned': 'XP Earned',
    
    // Score levels
    'secure': 'Secure',
    'moderate': 'Moderate',
    'lowRisk': 'Low Risk',
    'atRisk': 'At Risk',
    
    // Threat types
    'phishingAttempt': 'Phishing Attempt',
    'upiFraud': 'UPI Fraud Alert',
    'suspiciousLogin': 'Suspicious Login',
    'fakeWebsite': 'Fake Website',
    'Financial Scam': 'Financial Scam',
    'Job Fraud': 'Job Fraud',
    'Social Engineering': 'Social Engineering',
    
    // Status
    'detected': 'Detected',
    'blocked': 'Blocked',
    'investigating': 'Investigating',
    
    // Missions
    'spotThePhish': 'Spot the Phish',
    'securePasswords': 'Secure Your Passwords',
    'upiSafety': 'UPI Safety Check',
    'socialPrivacy': 'Social Media Privacy Audit',
    'fakeWebsiteDetection': 'Fake Website Detection',
    'otpProtection': 'OTP & PIN Protection',
    'continueMission': 'Continue Mission',
    'startMission': 'Start Mission',
    
    // Campaigns
    'upiSafetyWeek': 'UPI Safety Week',
    'phishingAwareness': 'Phishing Awareness Drive',
    'socialMediaPrivacy': 'Social Media Privacy Month',
    'jobScamAwareness': 'Job Scam Awareness',
    
    // Phishing Simulator
    'emailPhishing': 'Email Phishing',
    'chatScam': 'Chat Scam',
    'fakeLogin': 'Fake Login',
    'upiScam': 'UPI Message',
    'analyzeEmail': 'Analyze This Email',
    'report': 'Report',
    'ignore': 'Ignore',
    'clickLink': 'Click Link',
    
    // AI Assistant
    'askCyberMentor': 'Ask your Cyber Mentor',
    'typeQuestion': 'Type your question...',
    'isThisSafe': 'Is this safe?',
    'helpMe': 'Help me understand...',
  },
  hi: {
    // Landing & Auth
    'tagline': 'साइबर सुरक्षा, सामान्य बनाई।',
    'subtitle': 'आपका निजी साइबर कमांड सेंटर। AI-संचालित सिमुलेशन के माध्यम से डिजिटल खतरों से प्रशिक्षण, पहचान और रक्षा करें।',
    'getStarted': 'गूगल से शुरू करें',
    'exploreDashboard': 'डैशबोर्ड देखें',
    'welcomeBack': 'वापसी पर स्वागत, एजेंट',
    'createAccount': 'खाता बनाएं',
    'loginSubtitle': 'अपना साइबर प्रशिक्षण जारी रखने के लिए साइन इन करें',
    'signupSubtitle': 'साइबर रक्षा बल में शामिल हों',
    'continueWithGoogle': 'गूगल से जारी रखें',
    'orContinueWith': 'या ईमेल से जारी रखें',
    'email': 'ईमेल',
    'password': 'पासवर्ड',
    'signIn': 'साइन इन',
    'signUp': 'साइन अप',
    'noAccount': 'खाता नहीं है?',
    'hasAccount': 'पहले से खाता है?',
    'backToHome': 'होम पर वापस',
    'loginSuccess': 'वापसी पर स्वागत, एजेंट!',
    'signupSuccess': 'खाता सफलतापूर्वक बनाया गया!',
    'invalidCredentials': 'अमान्य ईमेल या पासवर्ड',
    'emailAlreadyRegistered': 'यह ईमेल पहले से पंजीकृत है',
    'logout': 'लॉग आउट',
    
    // Navigation
    'dashboard': 'डैशबोर्ड',
    'phishingSimulator': 'फ़िशिंग सिम्युलेटर',
    'digitalDetective': 'डिजिटल जासूस',
    'missions': 'प्रशिक्षण मिशन',
    'campaigns': 'अभियान',
    'aiAssistant': 'AI सहायक',
    'profile': 'प्रोफ़ाइल',
    
    // Dashboard
    'commandCenter': 'साइबर कमांड सेंटर',
    'normiCyteScore': 'नॉर्मीसाइट स्कोर',
    'threatFeed': 'खतरा पहचान फ़ीड',
    'activeMissions': 'सक्रिय मिशन',
    'awareness': 'जागरूकता अभियान',
    
    // Profile Setup
    'chooseAvatar': 'अपना अवतार चुनें',
    'avatarSubtitle': 'साइबर अवतार चुनें या अपना अपलोड करें',
    'uploadCustom': 'कस्टम अपलोड करें',
    'uploading': 'अपलोड हो रहा है...',
    'avatarUploaded': 'अवतार अपलोड हुआ!',
    'uploadFailed': 'अपलोड विफल',
    'invalidFileType': 'कृपया एक छवि फ़ाइल चुनें',
    'fileTooLarge': 'फ़ाइल 2MB से कम होनी चाहिए',
    'yourIdentity': 'आपकी पहचान',
    'identitySubtitle': 'एजेंट, हम आपको कैसे संबोधित करें?',
    'displayName': 'प्रदर्शन नाम',
    'displayNamePlaceholder': 'एजेंट साइबर',
    'username': 'यूजरनेम',
    'optional': 'वैकल्पिक',
    'selectRole': 'अपनी भूमिका चुनें',
    'roleSubtitle': 'आपका सबसे अच्छा वर्णन क्या है?',
    'roleStudent': 'छात्र',
    'roleStudentDesc': 'स्कूल/कॉलेज में साइबर सुरक्षा सीख रहे हैं',
    'roleBeginner': 'शुरुआती',
    'roleBeginnerDesc': 'साइबर सुरक्षा अवधारणाओं में नए',
    'roleCyberLearner': 'साइबर शिक्षार्थी',
    'roleCyberLearnerDesc': 'सक्रिय रूप से साइबर कौशल सुधार रहे हैं',
    'roleEnthusiast': 'उत्साही',
    'roleEnthusiastDesc': 'साइबर सुरक्षा के प्रति जुनूनी',
    'selectLanguage': 'भाषा चुनें',
    'languageSubtitle': 'अपनी पसंदीदा भाषा चुनें',
    'back': 'वापस',
    'next': 'आगे',
    'complete': 'सेटअप पूरा करें',
    'saving': 'सहेज रहा है...',
    'enterDisplayName': 'कृपया प्रदर्शन नाम दर्ज करें',
    'profileCreated': 'प्रोफ़ाइल सफलतापूर्वक बनाई गई!',
    'profileUpdateFailed': 'प्रोफ़ाइल अपडेट विफल',
    
    // Digital Detective
    'caseFiles': 'केस फाइलें',
    'evidencePanel': 'सबूत पैनल',
    'identifyThreat': 'खतरे का प्रकार पहचानें',
    'submitAnalysis': 'विश्लेषण जमा करें',
    'caseSolved': 'केस हल',
    'caseList': 'केस सूची',
    'allCases': 'सभी केस',
    'beginner': 'शुरुआती',
    'intermediate': 'मध्यम',
    'advanced': 'उन्नत',
    'notStarted': 'शुरू नहीं हुआ',
    'inProgress': 'प्रगति में',
    'submitted': 'जमा किया गया',
    'reviewed': 'समीक्षित',
    'startInvestigation': 'जांच शुरू करें',
    'continueInvestigation': 'जांच जारी रखें',
    'viewResults': 'परिणाम देखें',
    'investigationObjective': 'जांच उद्देश्य',
    'evidenceRoom': 'सबूत कक्ष',
    'question': 'प्रश्न',
    'of': 'का',
    'saveAndContinue': 'सहेजें और जारी रखें',
    'submitFinalAnalysis': 'अंतिम विश्लेषण जमा करें',
    'yourResponses': 'आपके उत्तर',
    'confirmSubmission': 'मैं पुष्टि करता हूं कि यह मेरा अंतिम विश्लेषण है',
    'submissionWarning': 'यह जमा अंतिम है और बदला नहीं जा सकता।',
    'caseVerdict': 'केस फैसला',
    'solved': 'हल',
    'partiallySolved': 'आंशिक रूप से हल',
    'needsImprovement': 'सुधार की जरूरत',
    'accuracyScore': 'सटीकता स्कोर',
    'questionReview': 'प्रश्न समीक्षा',
    'yourAnswer': 'आपका उत्तर',
    'correctAnswer': 'सही उत्तर',
    'explanation': 'व्याख्या',
    'keyLearning': 'मुख्य सीख',
    'backToCases': 'केसों पर वापस',
    'xpEarned': 'XP अर्जित',
    
    // Score levels
    'secure': 'सुरक्षित',
    'moderate': 'मध्यम',
    'lowRisk': 'कम जोखिम',
    'atRisk': 'जोखिम में',
    
    // Threat types
    'phishingAttempt': 'फ़िशिंग प्रयास',
    'upiFraud': 'UPI धोखाधड़ी अलर्ट',
    'suspiciousLogin': 'संदिग्ध लॉगिन',
    'fakeWebsite': 'नकली वेबसाइट',
    'Financial Scam': 'वित्तीय घोटाला',
    'Job Fraud': 'नौकरी धोखाधड़ी',
    'Social Engineering': 'सोशल इंजीनियरिंग',
    
    // Status
    'detected': 'पहचाना गया',
    'blocked': 'ब्लॉक किया गया',
    'investigating': 'जाँच जारी',
    
    // Missions
    'spotThePhish': 'फ़िश पहचानें',
    'securePasswords': 'पासवर्ड सुरक्षित करें',
    'upiSafety': 'UPI सुरक्षा जाँच',
    'socialPrivacy': 'सोशल मीडिया प्राइवेसी',
    'fakeWebsiteDetection': 'नकली वेबसाइट पहचान',
    'otpProtection': 'OTP और PIN सुरक्षा',
    'continueMission': 'मिशन जारी रखें',
    'startMission': 'मिशन शुरू करें',
    
    // Campaigns
    'upiSafetyWeek': 'UPI सुरक्षा सप्ताह',
    'phishingAwareness': 'फ़िशिंग जागरूकता अभियान',
    'socialMediaPrivacy': 'सोशल मीडिया प्राइवेसी माह',
    'jobScamAwareness': 'नौकरी घोटाला जागरूकता',
    
    // Phishing Simulator
    'emailPhishing': 'ईमेल फ़िशिंग',
    'chatScam': 'चैट घोटाला',
    'fakeLogin': 'नकली लॉगिन',
    'upiScam': 'UPI संदेश',
    'analyzeEmail': 'इस ईमेल का विश्लेषण करें',
    'report': 'रिपोर्ट करें',
    'ignore': 'अनदेखा करें',
    'clickLink': 'लिंक क्लिक करें',
    
    // AI Assistant
    'askCyberMentor': 'अपने साइबर गुरु से पूछें',
    'typeQuestion': 'अपना सवाल लिखें...',
    'isThisSafe': 'क्या यह सुरक्षित है?',
    'helpMe': 'मुझे समझाएं...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('normicyte_language', lang);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('normicyte_language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
      setLanguageState(savedLang);
    }
  }, []);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

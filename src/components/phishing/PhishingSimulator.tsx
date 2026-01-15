import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, MessageSquare, Globe, Smartphone, AlertTriangle, CheckCircle, XCircle, ChevronRight, Star, RefreshCw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  savePhishingAttempt,
  getPhishingStats,
  getCompletedPhishingScenarios,
} from '@/firebase/database';
import type { PhishingStats } from '@/firebase/types';

interface PhishingScenario {
  id: string;
  type: 'email' | 'chat' | 'website' | 'upi';
  from: string;
  subject?: string;
  content: string;
  time: string;
  isPhishing: boolean;
  redFlags: string[];
  redFlagsHi: string[];
}

const allScenarios: PhishingScenario[] = [
  // Email scenarios
  {
    id: 'e1',
    type: 'email',
    from: 'security@bankofind1a.com',
    subject: 'URGENT: Your account has been suspended!',
    content: 'Dear Customer, Your account has been temporarily suspended due to suspicious activity. Click here to verify your identity immediately or your account will be permanently closed within 24 hours.',
    time: '10:45 AM',
    isPhishing: true,
    redFlags: ['Misspelled domain (ind1a instead of india)', 'Urgent/threatening language', 'Generic greeting "Dear Customer"', 'Pressure to act immediately'],
    redFlagsHi: ['गलत डोमेन नाम (ind1a)', 'डराने वाली भाषा', 'सामान्य अभिवादन', 'तुरंत कार्रवाई का दबाव'],
  },
  {
    id: 'e2',
    type: 'email',
    from: 'noreply@flipkart.com',
    subject: 'Your order #FK12345 has been shipped',
    content: 'Hi, Your order containing iPhone 15 Pro has been shipped and will be delivered by tomorrow. Track your order using the Flipkart app.',
    time: '9:30 AM',
    isPhishing: false,
    redFlags: [],
    redFlagsHi: [],
  },
  {
    id: 'e3',
    type: 'email',
    from: 'hr@google-careers.net',
    subject: 'Congratulations! You\'ve been selected for Google Internship',
    content: 'We are pleased to inform you that you have been selected for our summer internship program with a stipend of ₹1,00,000/month. Please fill out the attached form with your bank details for salary processing.',
    time: 'Yesterday',
    isPhishing: true,
    redFlags: ['Unofficial domain (.net instead of .com)', 'Requesting bank details upfront', 'Too good to be true offer', 'Unsolicited job offer'],
    redFlagsHi: ['अनौपचारिक डोमेन (.net)', 'बैंक विवरण की मांग', 'बहुत अच्छा प्रस्ताव', 'बिना आवेदन के नौकरी'],
  },
  // Chat/SMS scenarios
  {
    id: 'c1',
    type: 'chat',
    from: '+91 98765 XXXXX',
    content: 'Dear SBI Customer, Your account will be blocked today. Update KYC immediately: sbi-kyc-update.in/verify',
    time: '2:30 PM',
    isPhishing: true,
    redFlags: ['Unofficial link (not sbi.co.in)', 'Creating urgency', 'Unknown number', 'Banks never ask KYC via SMS'],
    redFlagsHi: ['अनौपचारिक लिंक', 'जल्दबाजी पैदा करना', 'अज्ञात नंबर', 'बैंक SMS से KYC नहीं मांगते'],
  },
  {
    id: 'c2',
    type: 'chat',
    from: 'Amazon Delivery',
    content: 'Your Amazon order is out for delivery. OTP: 4523. Share this with delivery partner for verification.',
    time: '11:00 AM',
    isPhishing: false,
    redFlags: [],
    redFlagsHi: [],
  },
  {
    id: 'c3',
    type: 'chat',
    from: '+91 87654 XXXXX',
    content: 'Congrats! You won ₹50,00,000 in KBC! Call 9876543210 now to claim. Pay ₹5000 processing fee via GPay.',
    time: '4:15 PM',
    isPhishing: true,
    redFlags: ['Lottery/prize scam', 'Asking for money to claim prize', 'Random WhatsApp number', 'Legitimate prizes don\'t ask for fees'],
    redFlagsHi: ['लॉटरी धोखाधड़ी', 'पुरस्कार के लिए पैसे मांगना', 'अज्ञात नंबर', 'असली पुरस्कार में शुल्क नहीं होता'],
  },
  // Fake website scenarios
  {
    id: 'w1',
    type: 'website',
    from: 'amaz0n-deals.com',
    subject: 'Login Page',
    content: 'Sign in to Amazon\n\nEmail or mobile phone number: [_____]\nPassword: [_____]\n\n[Continue]\n\nBy continuing, you agree to Amazon\'s Conditions of Use and Privacy Notice.',
    time: '',
    isPhishing: true,
    redFlags: ['URL uses "0" instead of "o" (amaz0n)', 'Unofficial domain', 'Check URL carefully before entering credentials'],
    redFlagsHi: ['URL में "0" है "o" नहीं', 'अनौपचारिक डोमेन', 'क्रेडेंशियल डालने से पहले URL जांचें'],
  },
  {
    id: 'w2',
    type: 'website',
    from: 'paytm.com',
    subject: 'Paytm Wallet',
    content: 'Paytm\n\nLogin with your mobile number\n\nMobile: [_____]\n[Proceed Securely]\n\n🔒 100% Safe & Secure',
    time: '',
    isPhishing: false,
    redFlags: [],
    redFlagsHi: [],
  },
  // UPI scenarios
  {
    id: 'u1',
    type: 'upi',
    from: 'Random Seller',
    content: 'Payment Request\n\nSeller is requesting ₹15,000 from you.\nReason: "Refund for cancelled order"\n\n[Pay Now] [Decline]',
    time: 'Just now',
    isPhishing: true,
    redFlags: ['Refunds are never "requested" - they are sent directly', 'Unknown sender', 'You should receive refunds, not pay for them'],
    redFlagsHi: ['रिफंड "मांगा" नहीं जाता, सीधे भेजा जाता है', 'अज्ञात व्यक्ति', 'रिफंड मिलना चाहिए, देना नहीं'],
  },
  {
    id: 'u2',
    type: 'upi',
    from: 'OLX Buyer: Rahul',
    content: 'UPI Collect Request\n\n"I am sending ₹5000 advance for your laptop. Please approve to receive."\n\nAmount: ₹5000\n[Approve] [Decline]',
    time: '5 min ago',
    isPhishing: true,
    redFlags: ['To RECEIVE money, you never need to approve a collect request', 'Scammers use "collect" to steal money', 'Real payments come as direct transfers'],
    redFlagsHi: ['पैसे पाने के लिए collect approve नहीं करना होता', 'धोखेबाज collect से पैसे चुराते हैं', 'असली पेमेंट सीधे आती है'],
  },
  {
    id: 'u3',
    type: 'upi',
    from: 'PhonePe',
    content: 'Payment Successful!\n\n₹499 paid to Netflix India\nTransaction ID: PHN1234567890\nDate: Today, 3:45 PM',
    time: '3:45 PM',
    isPhishing: false,
    redFlags: [],
    redFlagsHi: [],
  },
];

const PhishingSimulator: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState<PhishingScenario | null>(null);
  const [answered, setAnswered] = useState<'report' | 'ignore' | 'click' | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [activeTab, setActiveTab] = useState('email');
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  const [stats, setStats] = useState<PhishingStats | null>(null);
  const [xpAwarded, setXpAwarded] = useState(0);

  // Load user's completed scenarios and stats
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const [completed, userStats] = await Promise.all([
          getCompletedPhishingScenarios(user.uid),
          getPhishingStats(user.uid),
        ]);
        setCompletedScenarios(completed);
        setStats(userStats);
        setScore({
          correct: userStats.correct_identifications,
          total: userStats.total_scenarios,
        });
      } catch (error) {
        console.error('Error loading phishing data:', error);
      }
    };

    loadUserData();
  }, [user]);

  const getScenariosByType = (type: string) => allScenarios.filter(s => s.type === type);

  const handleAction = async (action: 'report' | 'ignore' | 'click') => {
    if (!selectedScenario || !user) {
      setAnswered(action);
      return;
    }

    setAnswered(action);
    
    const isCorrect = 
      (selectedScenario.isPhishing && action === 'report') || 
      (!selectedScenario.isPhishing && action !== 'report');
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    // Save to Firebase and award XP
    try {
      const xp = await savePhishingAttempt(
        user.uid,
        selectedScenario.id,
        selectedScenario.type,
        isCorrect,
        action
      );
      
      if (xp > 0) {
        setXpAwarded(xp);
        toast.success(
          language === 'hi' 
            ? `+${xp} XP अर्जित!` 
            : `+${xp} XP earned!`
        );
        await refreshProfile();
      }

      // Update completed scenarios
      setCompletedScenarios(prev => [...prev, selectedScenario.id]);
    } catch (error) {
      console.error('Error saving phishing attempt:', error);
    }
  };

  const resetScenario = () => {
    setSelectedScenario(null);
    setAnswered(null);
    setXpAwarded(0);
  };

  const simulatorTypes = [
    { id: 'email', icon: Mail, label: t('emailPhishing') },
    { id: 'chat', icon: MessageSquare, label: t('chatScam') },
    { id: 'website', icon: Globe, label: t('fakeLogin') },
    { id: 'upi', icon: Smartphone, label: t('upiScam') },
  ];

  const renderScenarioList = (scenarios: PhishingScenario[]) => (
    <div className="glass-card p-4 rounded-2xl space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 px-2">
        {language === 'hi' ? 'परिदृश्य चुनें' : 'Select a scenario'}
      </h3>
      {scenarios.map((scenario) => {
        const isCompleted = completedScenarios.includes(scenario.id);
        return (
          <button
            key={scenario.id}
            onClick={() => { setSelectedScenario(scenario); setAnswered(null); setXpAwarded(0); }}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
              selectedScenario?.id === scenario.id
                ? 'bg-primary/10 border-primary/30'
                : isCompleted
                  ? 'bg-success/5 border-success/20 hover:border-success/30'
                  : 'bg-card/30 border-border/30 hover:border-border/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${isCompleted ? 'bg-success/20' : 'bg-muted/50'}`}>
                {scenario.type === 'email' && <Mail className={`w-4 h-4 ${isCompleted ? 'text-success' : 'text-muted-foreground'}`} />}
                {scenario.type === 'chat' && <MessageSquare className={`w-4 h-4 ${isCompleted ? 'text-success' : 'text-muted-foreground'}`} />}
                {scenario.type === 'website' && <Globe className={`w-4 h-4 ${isCompleted ? 'text-success' : 'text-muted-foreground'}`} />}
                {scenario.type === 'upi' && <Smartphone className={`w-4 h-4 ${isCompleted ? 'text-success' : 'text-muted-foreground'}`} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground truncate">{scenario.from}</span>
                  <div className="flex items-center gap-2">
                    {isCompleted && <CheckCircle className="w-4 h-4 text-success" />}
                    {scenario.time && <span className="text-xs text-muted-foreground">{scenario.time}</span>}
                  </div>
                </div>
                {scenario.subject && <p className="text-sm font-medium text-foreground truncate">{scenario.subject}</p>}
                <p className="text-xs text-muted-foreground truncate mt-1">{scenario.content.slice(0, 60)}...</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderScenarioDetail = () => {
    if (!selectedScenario) {
      return (
        <div className="glass-card p-8 rounded-2xl h-full flex items-center justify-center">
          <p className="text-muted-foreground">
            {language === 'hi' ? 'विश्लेषण के लिए एक परिदृश्य चुनें' : 'Select a scenario to analyze'}
          </p>
        </div>
      );
    }

    return (
      <div className="glass-card p-6 rounded-2xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{language === 'hi' ? 'से:' : 'From:'}</span>
            <span className="text-foreground font-medium">{selectedScenario.from}</span>
          </div>
          {selectedScenario.subject && (
            <h3 className="text-lg font-semibold text-foreground">{selectedScenario.subject}</h3>
          )}
        </div>

        {/* Content */}
        <div className="p-4 bg-muted/30 rounded-xl border border-border/30">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {selectedScenario.content}
          </p>
        </div>

        {/* Actions */}
        {!answered && (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleAction('report')}
              className="flex-1 bg-destructive/20 border border-destructive/30 text-destructive hover:bg-destructive/30"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t('report')}
            </Button>
            <Button
              onClick={() => handleAction('ignore')}
              variant="outline"
              className="flex-1"
            >
              {t('ignore')}
            </Button>
            <Button
              onClick={() => handleAction('click')}
              className="flex-1 bg-success/20 border border-success/30 text-success hover:bg-success/30"
            >
              {t('clickLink')}
            </Button>
          </div>
        )}

        {/* Result */}
        {answered && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${
              (selectedScenario.isPhishing && answered === 'report') || (!selectedScenario.isPhishing && answered !== 'report')
                ? 'bg-success/10 border-success/30'
                : 'bg-destructive/10 border-destructive/30'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {(selectedScenario.isPhishing && answered === 'report') || (!selectedScenario.isPhishing && answered !== 'report') ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="font-semibold text-success">
                      {language === 'hi' ? 'सही!' : 'Correct!'}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-destructive" />
                    <span className="font-semibold text-destructive">
                      {language === 'hi' ? 'गलत' : 'Incorrect'}
                    </span>
                  </>
                )}
              </div>
              
              {selectedScenario.isPhishing && selectedScenario.redFlags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {language === 'hi' ? 'इसमें खतरे के संकेत:' : 'Red Flags in this scenario:'}
                  </p>
                  <ul className="space-y-1">
                    {(language === 'hi' ? selectedScenario.redFlagsHi : selectedScenario.redFlags).map((flag, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!selectedScenario.isPhishing && (
                <p className="text-sm text-muted-foreground">
                  {language === 'hi' 
                    ? 'यह एक वैध संदेश है। सभी संदेश खतरनाक नहीं होते!' 
                    : 'This is a legitimate message. Not all messages are dangerous!'}
                </p>
              )}

              {/* Show XP earned */}
              {xpAwarded > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    +{xpAwarded} XP {language === 'hi' ? 'अर्जित!' : 'earned!'}
                  </span>
                </div>
              )}
            </div>

            <Button onClick={resetScenario} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              {language === 'hi' ? 'अगला परिदृश्य' : 'Next Scenario'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('phishingSimulator')}</h2>
          <p className="text-muted-foreground">
            {language === 'hi' 
              ? 'सुरक्षित वातावरण में फिशिंग पहचानना सीखें' 
              : 'Practice identifying phishing attempts in a safe environment'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats && stats.total_xp_earned > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30">
              <Trophy className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">
                {stats.total_xp_earned} XP
              </span>
            </div>
          )}
          {score.total > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {score.correct}/{score.total} {language === 'hi' ? 'सही' : 'Correct'}
              </span>
              <Progress value={(score.correct / score.total) * 100} className="w-20 h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Simulator Types */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); resetScenario(); }} className="w-full">
        <TabsList className="w-full bg-muted/30 border border-border/50 p-1 rounded-xl">
          {simulatorTypes.map((type) => {
            const Icon = type.icon;
            return (
              <TabsTrigger
                key={type.id}
                value={type.id}
                className="flex-1 flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/30 rounded-lg"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{type.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {['email', 'chat', 'website', 'upi'].map((type) => (
          <TabsContent key={type} value={type} className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {renderScenarioList(getScenariosByType(type))}
              {renderScenarioDetail()}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PhishingSimulator;

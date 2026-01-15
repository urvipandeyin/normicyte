import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bot, Send, Sparkles, Shield, AlertTriangle, Loader2, Smartphone, Lock,
  FileSearch, Link, Mail, MessageSquare, Copy, Check, RefreshCw,
  ChevronDown, Zap, Brain, Target, AlertCircle, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { callCyberAssistant, analyzeContent, clearAISession } from '@/firebase/assistant';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AnalysisResult {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  threatType: string;
  redFlags: string[];
  recommendation: string;
}

const quickPrompts = [
  { icon: Shield, text: 'Is this link safe?', textHi: 'क्या यह लिंक सुरक्षित है?', query: 'How can I check if a link is safe before clicking?' },
  { icon: AlertTriangle, text: 'Suspicious message', textHi: 'संदिग्ध संदेश', query: 'I received a suspicious message asking for my bank details. What should I do?' },
  { icon: Lock, text: 'Strong passwords', textHi: 'मजबूत पासवर्ड', query: 'How do I create a strong password that is hard to hack?' },
  { icon: Smartphone, text: 'UPI fraud', textHi: 'UPI धोखाधड़ी', query: 'How can I protect myself from UPI payment fraud in India?' },
];

const contentTypes = [
  { value: 'email', label: 'Email', labelHi: 'ईमेल', icon: Mail },
  { value: 'sms', label: 'SMS', labelHi: 'SMS', icon: MessageSquare },
  { value: 'url', label: 'URL/Link', labelHi: 'URL/लिंक', icon: Link },
  { value: 'message', label: 'Message', labelHi: 'संदेश', icon: MessageSquare },
];

const AIAssistant: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'analyze'>('chat');
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Analysis state
  const [analyzeContent_, setAnalyzeContent] = useState('');
  const [contentType, setContentType] = useState<'email' | 'sms' | 'url' | 'message'>('email');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send initial greeting
  useEffect(() => {
    const greeting: Message = {
      id: 'welcome',
      role: 'assistant',
      content: language === 'hi' 
        ? "नमस्ते! मैं **NormiCyte AI** हूं 🛡️\n\nमैं **Gemini AI** द्वारा संचालित आपका साइबर सुरक्षा मेंटर हूं:\n\n• 🎣 फिशिंग और स्कैम की पहचान\n• 💳 UPI धोखाधड़ी से बचाव\n• 🔐 पासवर्ड सुरक्षा\n• 📱 ऑनलाइन प्राइवेसी\n\n**नोट:** मैं डिजिटल डिटेक्टिव केस या क्विज़ के जवाब नहीं दूंगा, लेकिन साइबर सुरक्षा समझने में मदद करूंगा।\n\nअपना सवाल पूछें!"
        : "Hello! I'm **NormiCyte AI** 🛡️\n\nI'm your cybersecurity mentor powered by **Gemini AI**:\n\n• 🎣 Identifying phishing and scams\n• 💳 UPI fraud prevention\n• 🔐 Password security\n• 📱 Online privacy\n\n**Note:** I won't give answers to Digital Detective cases or quizzes, but I'll help you understand cybersecurity concepts.\n\nAsk your question!",
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, [language]);

  const handleSend = async (query?: string) => {
    const messageText = query || input;
    if (!messageText.trim() || isLoading) return;

    // Check if user is authenticated
    if (!user) {
      toast.error(language === 'hi' 
        ? 'कृपया AI असिस्टेंट का उपयोग करने के लिए साइन इन करें'
        : 'Please sign in to use the AI Assistant');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage]
        .filter(m => m.id !== 'welcome')
        .slice(-10)
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));

      // Pass language for local demo mode
      const { message, error } = await callCyberAssistant(conversationHistory, language);

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error calling AI assistant:', error);
      const errorMsg = error.message || (language === 'hi' 
        ? 'AI असिस्टेंट से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें।'
        : 'Failed to connect to AI assistant. Please try again.');
      toast.error(errorMsg);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'hi'
          ? '⚠️ क्षमा करें, कुछ गड़बड़ हुई। कृपया पुनः प्रयास करें।'
          : '⚠️ Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analyzeContent_.trim() || isAnalyzing) return;
    
    // Check if user is authenticated
    if (!user) {
      toast.error(language === 'hi' 
        ? 'कृपया विश्लेषण के लिए साइन इन करें'
        : 'Please sign in to analyze content');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Pass language for local demo mode
      const { analysis, error } = await analyzeContent(analyzeContent_, contentType, language);
      
      if (error) throw error;
      
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error(language === 'hi' 
        ? 'विश्लेषण में त्रुटि हुई। कृपया पुनः प्रयास करें।'
        : 'Error analyzing content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = async () => {
    // Clear backend session
    if (user) {
      try {
        await clearAISession();
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }

    // Reset local state
    const greeting: Message = {
      id: 'welcome',
      role: 'assistant',
      content: language === 'hi' 
        ? "नमस्ते! मैं **NormiCyte AI** हूं 🛡️\n\nमैं **Gemini AI** द्वारा संचालित आपका साइबर सुरक्षा मेंटर हूं:\n\n• 🎣 फिशिंग और स्कैम की पहचान\n• 💳 UPI धोखाधड़ी से बचाव\n• 🔐 पासवर्ड सुरक्षा\n• 📱 ऑनलाइन प्राइवेसी\n\n**नोट:** मैं डिजिटल डिटेक्टिव केस या क्विज़ के जवाब नहीं दूंगा, लेकिन साइबर सुरक्षा समझने में मदद करूंगा।\n\nअपना सवाल पूछें!"
        : "Hello! I'm **NormiCyte AI** 🛡️\n\nI'm your cybersecurity mentor powered by **Gemini AI**:\n\n• 🎣 Identifying phishing and scams\n• 💳 UPI fraud prevention\n• 🔐 Password security\n• 📱 Online privacy\n\n**Note:** I won't give answers to Digital Detective cases or quizzes, but I'll help you understand cybersecurity concepts.\n\nAsk your question!",
      timestamp: new Date(),
    };
    setMessages([greeting]);
    setAnalysisResult(null);
    setAnalyzeContent('');
  };

  // Simple markdown renderer for bold and bullets
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Handle bold text
      let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400">$1</strong>');
      
      // Check if it's a bullet point
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      
      return (
        <p 
          key={i} 
          className={`${isBullet ? 'pl-2' : ''} ${i > 0 ? 'mt-1' : ''}`}
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });
  };

  const getRiskLevelColor = (level: string) => {
    if (level.toLowerCase().includes('critical')) return 'text-red-500 bg-red-500/10 border-red-500/30';
    if (level.toLowerCase().includes('high')) return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    if (level.toLowerCase().includes('medium')) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30">
          <Brain className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {language === 'hi' ? 'साइबर मेंटर' : 'Cyber Mentor'}
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400">
              Gemini AI
            </span>
          </h2>
          <p className="text-sm text-zinc-400">
            {language === 'hi' ? 'आपका AI साइबर सुरक्षा सहायक' : 'Your AI Cybersecurity Assistant'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">
            {language === 'hi' ? 'ऑनलाइन' : 'Online'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'analyze')} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="chat" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <MessageSquare className="w-4 h-4 mr-2" />
            {language === 'hi' ? 'चैट' : 'Chat'}
          </TabsTrigger>
          <TabsTrigger value="analyze" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
            <FileSearch className="w-4 h-4 mr-2" />
            {language === 'hi' ? 'विश्लेषण' : 'Analyze'}
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`relative max-w-[85%] p-4 rounded-2xl group ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-br-md'
                      : 'bg-slate-800/70 border border-slate-700/50 rounded-bl-md'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium text-cyan-400">Cyber Mentor</span>
                    </div>
                  )}
                  <div className="text-sm leading-relaxed">
                    {renderMarkdown(message.content)}
                  </div>
                  
                  {/* Copy button for assistant messages */}
                  {message.role === 'assistant' && message.id !== 'welcome' && (
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-zinc-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-slate-800/70 border border-slate-700/50 p-4 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                      <div className="absolute inset-0 w-5 h-5 rounded-full bg-cyan-400/20 animate-ping" />
                    </div>
                    <div>
                      <span className="text-sm text-white">
                        {language === 'hi' ? 'Gemini सोच रहा है...' : 'Gemini is thinking...'}
                      </span>
                      <div className="flex gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 py-3 border-t border-slate-700/50">
            {quickPrompts.map((prompt, index) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleSend(prompt.query)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-sm text-zinc-400 hover:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon className="w-4 h-4" />
                  {language === 'hi' ? prompt.textHi : prompt.text}
                </button>
              );
            })}
            
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-zinc-500/30 transition-all text-sm text-zinc-500 hover:text-zinc-300 ml-auto"
            >
              <RefreshCw className="w-4 h-4" />
              {language === 'hi' ? 'नई चैट' : 'New Chat'}
            </button>
          </div>

          {/* Input */}
          <div className="flex gap-3 pt-3 border-t border-slate-700/50">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={language === 'hi' ? 'अपना सवाल पूछें...' : 'Ask your question...'}
              disabled={isLoading}
              className="flex-1 bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 text-white placeholder:text-zinc-500"
            />
            <Button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white px-6 border-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </TabsContent>

        {/* Analyze Tab */}
        <TabsContent value="analyze" className="flex-1 flex flex-col min-h-0 mt-0">
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Analyzer Card */}
            <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-900/90 to-violet-950/30 backdrop-blur-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/30">
                  <Target className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {language === 'hi' ? 'सामग्री विश्लेषक' : 'Content Analyzer'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {language === 'hi' 
                      ? 'संदिग्ध ईमेल, SMS, URL या संदेशों की जांच करें'
                      : 'Scan suspicious emails, SMS, URLs, or messages'}
                  </p>
                </div>
              </div>

              {/* Content Type Selection */}
              <div className="mb-4">
                <label className="text-sm text-zinc-400 mb-2 block">
                  {language === 'hi' ? 'सामग्री प्रकार' : 'Content Type'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {contentTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setContentType(type.value as typeof contentType)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          contentType === type.value
                            ? 'bg-violet-500/10 border-violet-500/50 text-violet-400'
                            : 'bg-slate-800/30 border-slate-700/50 text-zinc-400 hover:border-slate-600/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">
                          {language === 'hi' ? type.labelHi : type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Input */}
              <div className="mb-4">
                <label className="text-sm text-zinc-400 mb-2 block">
                  {language === 'hi' ? 'जांच के लिए सामग्री पेस्ट करें' : 'Paste content to analyze'}
                </label>
                <Textarea
                  value={analyzeContent_}
                  onChange={(e) => setAnalyzeContent(e.target.value)}
                  placeholder={
                    contentType === 'url' 
                      ? (language === 'hi' ? 'संदिग्ध URL यहां पेस्ट करें...' : 'Paste suspicious URL here...')
                      : (language === 'hi' ? 'संदिग्ध सामग्री यहां पेस्ट करें...' : 'Paste suspicious content here...')
                  }
                  className="min-h-[150px] bg-slate-800/30 border-slate-700/50 text-white placeholder:text-zinc-600 focus:border-violet-500/50"
                />
              </div>

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !analyzeContent_.trim()}
                className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white border-0"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {language === 'hi' ? 'विश्लेषण हो रहा है...' : 'Analyzing...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {language === 'hi' ? 'AI से विश्लेषण करें' : 'Analyze with AI'}
                  </span>
                )}
              </Button>
            </div>

            {/* Analysis Result */}
            {analysisResult && (
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm overflow-hidden animate-fade-in">
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                      <FileSearch className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {language === 'hi' ? 'विश्लेषण परिणाम' : 'Analysis Result'}
                    </h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="prose prose-invert max-w-none text-sm text-zinc-300 leading-relaxed">
                    {renderMarkdown(analysisResult)}
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/20">
                  <p className="text-xs text-zinc-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {language === 'hi' 
                      ? 'यह AI-जनित विश्लेषण है। संदेह होने पर हमेशा सत्यापित करें।'
                      : 'This is AI-generated analysis. Always verify when in doubt.'}
                  </p>
                </div>
              </div>
            )}

            {/* Tips */}
            {!analysisResult && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {language === 'hi' ? 'विश्लेषण टिप्स' : 'Analysis Tips'}
                </h4>
                <ul className="space-y-2 text-xs text-zinc-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {language === 'hi' 
                      ? 'पूरा ईमेल या संदेश पेस्ट करें, जिसमें प्रेषक का पता भी शामिल हो'
                      : 'Paste the complete email or message, including sender address'}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {language === 'hi' 
                      ? 'URL के लिए, पूरा लिंक पेस्ट करें (https:// सहित)'
                      : 'For URLs, paste the complete link (including https://)'}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {language === 'hi' 
                      ? 'AI सामान्य घोटाला पैटर्न और लाल झंडों की पहचान करेगा'
                      : 'AI will identify common scam patterns and red flags'}
                  </li>
                </ul>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistant;

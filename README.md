# NormiCyte 🛡️
### let's normalise cyber.

> **🔗 Live Demo: [normicyte.web.app](https://normicyte.web.app)**

---

## 🎯 what's this about?

so here's the thing - cybersecurity feels intimidating to most people. like, who has time to learn about phishing when you're drowning in assignments? but then your friend gets scammed on OLX, your mom almost shared her OTP with a fake "bank" caller, and suddenly it hits different.

**NormiCyte** is our attempt to make cyber awareness... normal. not scary, not boring - just something you pick up while having fun. think duolingo but for not getting scammed.

we built this for a campus hackathon but honestly? this stuff affects everyone - students, parents, that uncle who forwards everything on WhatsApp.

---

## 💡 the problem we're solving

campus life = online life. we're constantly:
- paying fees through UPI
- logging into portals
- clicking links in "placement" emails
- sharing stuff on social media

and scammers LOVE targeting students. fake internship offers, UPI collect request scams, phishing emails that look legit... you name it.

**but nobody teaches us this stuff.** cyber hygiene should be as normal as washing hands, right?

---

## ✨ what can you do on NormiCyte?

### 🕵️ Digital Detective
solve real-world cyber cases. analyze suspicious emails, trace fake profiles, figure out how scams work. it's like being a detective but for the internet.

### 🎣 Phishing Simulator  
practice spotting fake emails and messages. get it wrong? no worries - better to learn here than lose money irl. you earn XP for every correct catch!

### 🎮 Missions
bite-sized lessons on UPI safety, password security, social media privacy, etc. complete quizzes, earn XP, level up your cyber skills.

### 📢 Campaigns
join community challenges like "UPI Safety Week" or "Phishing Awareness Month". learn together, compete on leaderboards.

### 🤖 AI Mentor (coming soon)
got a suspicious message? not sure if something's a scam? ask our AI buddy - it's like having a cybersecurity friend on speed dial.

### 🌐 Hindi + English
because cyber safety shouldn't need you to know english. toggle between languages anytime.

---

## 🏗️ project structure

```
normicyte/
├── src/
│   ├── components/
│   │   ├── assistant/      # AI chat (coming soon)
│   │   ├── auth/           # login/signup stuff
│   │   ├── dashboard/      # home screen widgets
│   │   ├── detective/      # case investigation game
│   │   ├── landing/        # the cool landing page
│   │   ├── phishing/       # phishing practice simulator
│   │   ├── profile/        # user profile setup
│   │   └── ui/             # reusable UI components
│   │
│   ├── contexts/           # app-wide state (auth, language)
│   ├── firebase/           # database & auth config
│   ├── hooks/              # custom react hooks
│   ├── lib/                # helper functions
│   └── pages/              # main app screens
│       ├── Dashboard.tsx   # home after login
│       ├── Detective.tsx   # cyber case solver
│       ├── Missions.tsx    # learning missions
│       ├── MissionContent.tsx  # interactive lesson pages
│       ├── Campaigns.tsx   # community campaigns
│       ├── Phishing.tsx    # phishing practice
│       └── Profile.tsx     # user settings
│
├── functions/              # firebase cloud functions
├── scripts/                # database seeding & migration
├── public/                 # static assets
└── dist/                   # production build
```

---

## 🛠️ tech stack

nothing fancy, just stuff that works:

| what | why |
|------|-----|
| React + TypeScript | because type safety saves headaches |
| Vite | fast builds, instant hot reload |
| Tailwind CSS | utility-first styling (no more CSS files everywhere) |
| shadcn/ui | beautiful components out of the box |
| Firebase | auth, database, hosting - all in one place |
| React Router | navigation between pages |

---

## 🚀 wanna run it locally?

### you'll need:
- Node.js 18+ 
- npm
- a Firebase project (free tier works)

### setup:

```bash
# clone it
git clone https://github.com/urvipandeyin/normicyte.git
cd normicyte

# install stuff
npm install

# create .env file with your firebase config
# (check .env.example for format)

# run it
npm run dev
```

boom, open `http://localhost:8080` and you're in.

### seed the database (optional):
```bash
node scripts/seedMissionsCampaigns.cjs
```
this adds sample missions, campaigns, and security tips.

---

## 📦 scripts

| command | what it does |
|---------|--------------|
| `npm run dev` | starts dev server |
| `npm run build` | builds for production |
| `npm run preview` | preview the build locally |
| `firebase deploy` | ship it to the internet |

---

## 🎪 deployment

we're live on Firebase Hosting:

**🔗 [normicyte.web.app](https://normicyte.web.app)**

to deploy your own:
```bash
npm run build
firebase deploy --only hosting
```

---

## 🤝 team

built with ☕ and sleep deprivation for [Your Hackathon Name]

---

## 📞 for actual emergencies

if you or someone you know has been scammed:

**🚨 National Cyber Crime Helpline: 1930**  
**🌐 Report online: [cybercrime.gov.in](https://cybercrime.gov.in)**

---

## 📄 license

MIT - do whatever you want with it, just don't use it to scam people (obviously)

---

*"because getting scammed shouldn't be a rite of passage"* ✌️

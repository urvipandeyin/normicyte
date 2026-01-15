# NormiCyte 
### Let's normalise cyber.

> **🔗 Live Demo: [normicyte.web.app](https://normicyte.web.app)**

---

## What's this about?

So here's the thing, cybersecurity feels intimidating to most people. Like, who has time to learn about phishing when you're drowning in assignments? but then your friend gets scammed on OLX, your mom almost shared her OTP with a fake "bank" caller and suddenly it hits different.

**NormiCyte** is our attempt to make cyber awareness... normal. Not scary, not boring, just something you pick up when you have nothing to do. Think the early-duolingo but for not getting scammed.

We built this for a campus hackathon but honestly? this stuff affects everyone: students, parents, that uncle who forwards everything on WhatsApp.

---

## The problem we're solving

Campus life = online life. 

We're constantly:
- paying fees through UPI
- logging into portals
- clicking links in "placement" emails
- sharing stuff on social media

and scammers LOVE targeting students. Fake internship offers, UPI collect request scams, phishing emails that look legit... you just name it.

**But nobody teaches us this stuff.** cyber hygiene should be as normal as washing hands, right!?

---

## What can you do on NormiCyte?

### Digital Detective
Solve real-world cyber cases. Analyse suspicious emails, trace fake profiles, figure out how scams work. It's like being a detective but for the internet.

### Phishing Simulator  
Practice spotting fake emails and messages. Get it wrong? No worries, better to learn here than lose money irl. You earn XP for every correct catch!

### Missions
Bite-sized lessons on UPI safety, password security, social media privacy, etc. complete quizzes, earn XP, level up your cyber skills.

### Campaigns
Join community challenges like "UPI Safety Week" or "Phishing Awareness Month". Learn together and compete on leaderboards.

### AI Mentor (coming soon)
Got a suspicious message? Not sure if something's a scam? Ask our AI buddy. 

### Hindi + English
Because cyber safety shouldn't need you to know english. Toggle between languages anytime.

---

## Project structure

```
normicyte/
├── src/
│   ├── components/
│   │   ├── assistant/      # AI chat
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

## Tech stack

| what | why |
|------|-----|
| React + TypeScript | because type safety saves headaches |
| Vite | fast builds, instant hot reload |
| Tailwind CSS | utility-first styling (no more CSS files everywhere) |
| shadcn/ui | beautiful components out of the box |
| Firebase | auth, database, hosting - all in one place |
| React Router | navigation between pages |

---

## Wanna run it locally?

### You'll need:
- Node.js 18+ 
- npm
- A Firebase project (free tier works)

### Setup:

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

### Seed the database (optional):
```bash
node scripts/seedMissionsCampaigns.cjs
```
This adds sample missions, campaigns, and security tips.

---

## Scripts

| command | what it does |
|---------|--------------|
| `npm run dev` | starts dev server |
| `npm run build` | builds for production |
| `npm run preview` | preview the build locally |
| `firebase deploy` | ship it to the internet |

---

## Deployment

We're live on Firebase Hosting:

**🔗 [normicyte.web.app](https://normicyte.web.app)**

To deploy your own:
```bash
npm run build
firebase deploy --only hosting
```

---

## Team

Built with ☕ and sleep deprivation for techsprint hackathon GDG SDSF by Team NextNorms.

---

## For actual emergencies

If you or someone you know has been scammed:

**National Cyber Crime Helpline: 1930**  
**Report online: [cybercrime.gov.in](https://cybercrime.gov.in)**

---

## License

MIT - do whatever you want with it, just don't use it to scam people (obviously)

---

**"Because getting scammed shouldn't be a rite of passage"** Peace out. 

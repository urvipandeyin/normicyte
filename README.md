# NormiCyte - Your Cyber Guardian 🛡️

A comprehensive cyber awareness platform designed to help users in India stay safe online through interactive learning, phishing simulations, and AI-powered guidance.

## Features

- **Digital Detective**: Solve interactive cybersecurity cases to learn threat identification
- **Phishing Simulator**: Practice identifying fake emails and messages
- **AI Cyber Mentor**: Get instant guidance on cybersecurity questions
- **NormiCyte Score**: Track your cyber awareness progress
- **Bilingual Support**: Available in English and Hindi

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **State Management**: React Query, React Context
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or bun
- Firebase account

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd normicyte-your-cyber-guardian

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase configuration

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Project Structure

```
src/
├── components/     # React components
│   ├── assistant/  # AI chat assistant
│   ├── auth/       # Authentication components
│   ├── dashboard/  # Dashboard widgets
│   ├── detective/  # Digital detective game
│   ├── landing/    # Landing page components
│   ├── phishing/   # Phishing simulator
│   └── ui/         # shadcn/ui components
├── contexts/       # React contexts (Auth, Language)
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── pages/          # Page components
└── firebase/       # Firebase configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (select Hosting)
firebase init

# Deploy
firebase deploy
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For cybersecurity emergencies in India, contact the Cyber Crime Helpline: **1930**

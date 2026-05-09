# ⚔️ VS-Engine

**Built for the AI Engineer Hackathon** 🚀

VS-Engine is a dynamic, AI-powered battle simulator built with Next.js 16. It pits dynamic characters against each other, generating photorealistic cinematic battle cards using cutting-edge generative AI, leveraging Fal.ai (Flux) for ultra-fast and stunning visual generation.

## 🌟 Hackathon Highlights

- **AI-Generated Battle Portraits**: On-the-fly cinematic, photorealistic card generation of characters facing off in specific arenas with weapons and modifiers.
- **Lightning Fast AI Inference**: Switched from standard GPT generation to high-speed **Fal.ai (Flux)** for realtime low-latency image delivery.
- **Robust Next.js 16 Architecture**: Built on the bleeding edge of the Next.js ecosystem.
- **Tailwind CSS UI**: A premium, visually stunning and interactive user interface designed to wow!
- **Convex Backend**: Serverless, real-time sync for battle results, rankings, and match history.

## 🛠 Technology Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Backend / Database:** Convex
- **AI Integration:** Fal.ai (Flux) / OpenAI
- **Styling:** Tailwind CSS v4
- **Typography:** Custom Geist fonts for a sleek look.

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js and npm (or yarn/pnpm/bun) installed.

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd vs-engine
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` or `.env` file in the root and add your keys:
   ```env
   # AI Generation
   FAL_API_KEY=your_fal_key_here
   OPENAI_API_KEY=your_openai_key_here

   # Convex Configuration (if applicable)
   CONVEX_DEPLOYMENT=your_deployment_url
   NEXT_PUBLIC_CONVEX_URL=your_public_url
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

5. **Let the Battle Begin:**
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application and start generating showdowns.

## 🏆 What's Next?
Our roadmap post-hackathon includes:
- Animated battle sequences (video generation).
- User accounts and leaderboards.
- Expanded AI personalities and dynamic battle narratives.

## 📜 License

This project is licensed under the MIT License.

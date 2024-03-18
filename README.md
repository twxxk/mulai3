This is a multi generative AIs application.

The program is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and integrated with [`AI SDK`](https://github.com/vercel/ai).

You can chat with AIs from several different platforms such as OpenAI, Fireworks.ai, Mistral, Groq, and Perplexity. Some models accept function calls.

The followings are supported functions:
- `get_flight_info` Get the information for a flight
- `get_mulai3_app_info` Get the information of Mulai3 app
- `get_current_weather` Get current weather information of the specified city
- `generate_images` Generate images based on the given prompt using Dall-E 3 and 2.


## Getting Started

Create `.env.local` and configure several API_KEYs from `.env.example`.

Run the development server:

```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can build to see lint errors on production environment.

```bash
pnpm build
```

## Deployment

The program uses edge functions (app/api/chat/route.ts). It is intended to deploy to [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftwxxk%2Fmulai3&env=OPENAI_API_KEY,FIREWORKS_API_KEY,MISTRAL_API_KEY,GROQ_API_KEY,PERPLEXITY_API_KEY,OPENWEATHER_API_KEY&envDescription=See%20.env.example%20for%20other%20environment%20variable&demo-title=Mulai3&demo-url=https%3A%2F%2Fmulai3.vercel.app%2F)

## Reference

I created a brother project [`Mulai`](https://github.com/twxxk/mulai) which utilizes more React Client Components. You might also want to review it.

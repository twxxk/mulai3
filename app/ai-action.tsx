import 'server-only'

import { OpenAI } from "openai";
import { createAI, getMutableAIState, render } from "ai/rsc";
import { z } from "zod";
import { ChatModel, getModelByValue } from '@/lib/ai-model';
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const fireworksai = new OpenAI({
  apiKey: process.env.FIREWORKS_API_KEY,
  baseURL: 'https://api.fireworks.ai/inference/v1',
});
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})
const perplexity  = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai/',
})

function getProvider(model:ChatModel) {
  const providerMap:{[key:string]:any} = {
    openai, fireworksai, groq, perplexity
  }
  console.log(model.provider)
  const provider = providerMap[model.provider]
  if (!provider) {
    console.error('unsupported model', model)
    return null
  }
  return provider
}

// An example of a spinner component. You can also import your own components,
// or 3rd party component libraries.
// function Spinner() {
//   return <div>Loading...</div>;
// }
 
// An example of a flight card component.
// function FlightCard({ flightInfo }:{ flightInfo:any }) {
//   return (
//     <div>
//       <h2>Flight Information</h2>
//       <p>Flight Number: {flightInfo.flightNumber}</p>
//       <p>Departure: {flightInfo.departure}</p>
//       <p>Arrival: {flightInfo.arrival}</p>
//     </div>
//   );
// }
 
// An example of a function that fetches flight information from an external API.
// async function getFlightInfo(flightNumber: string) {
//   return {
//     flightNumber,
//     departure: 'New York',
//     arrival: 'San Francisco',
//   };
// }

async function submitUserMessage(userInput: string) {
  'use server';
 
  const aiState = getMutableAIState<typeof AIAction>();
 
  // Update the AI state with the new user message.
  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        role: 'user',
        content: userInput,
      },
    ]
  });
 
  // The `render()` creates a generated, streamable UI.
  // console.log('model:', modelValue, aiState.get().modelValue)
  const ui:any = render({
    model: aiState.get().model.sdkModelValue,
    provider: getProvider(aiState.get().model),
    messages: [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: userInput }
    ],
    // `text` is called when an AI returns a text response (as opposed to a tool call).
    // Its content is streamed from the LLM, so this function will be called
    // multiple times with `content` being incremental.
    text: ({ content, done }) => {
      // When it's the final content, mark the state as done and ready for the client to access.
      if (done) {
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              role: "assistant",
              content
            }
          ]
        });
      }
 
      return <p>{content}</p>
    },
    // tools: {
    //   get_flight_info: {
    //     description: 'Get the information for a flight',
    //     parameters: z.object({
    //       flightNumber: z.string().describe('the number of the flight')
    //     }).required(),
    //     render: async function* ({ flightNumber }) {
    //       // Show a spinner on the client while we wait for the response.
    //       yield <Spinner/>
 
    //       // Fetch the flight information from an external API.
    //       const flightInfo = await getFlightInfo(flightNumber)
 
    //       // Update the final AI state.
    //       aiState.done([
    //         ...aiState.get(),
    //         {
    //           role: "function",
    //           name: "get_flight_info",
    //           // Content can be any string to provide context to the LLM in the rest of the conversation.
    //           content: JSON.stringify(flightInfo),
    //         }
    //       ]);
 
    //       // Return the flight card to the client.
    //       return <FlightCard flightInfo={flightInfo} />
    //     }
    //   }
    // }
  })
 
  return {
    id: Date.now(),
    display: ui
  };
}
 
type MessageAIState = {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}

// Define the initial state of the AI. It can be any JSON object.
type AIState = {
  messages: MessageAIState[],
  model: ChatModel,
}

type MessageUIState = {
  id: number;
  display: React.ReactNode;
}

// The initial UI state that the client will keep track of, which contains the message IDs and their UI nodes.
type InitialUIState = {
  messages: MessageUIState[],
}


const initialAIState:AIState = {
  messages: [], 
  model: getModelByValue('gpt-3.5-turbo') as ChatModel,
};

const initialUIState: InitialUIState = {
  messages: [],
}

// AI is a provider you wrap your application with so you can access AI and UI state in your components.
export const AIAction = createAI({
  actions: {
    submitUserMessage
  },
  // Each state can be any shape of object, but for chat applications
  // it makes sense to have an array of messages. Or you may prefer something like { id: number, messages: Message[] }
  initialUIState,
  initialAIState
});

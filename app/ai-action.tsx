import 'server-only'

import { OpenAI } from "openai";
import { createAI, getMutableAIState, render } from "ai/rsc";
import { z } from "zod";
import { ChatModel, getModelByValue } from '@/lib/ai-model';
import Image from 'next/image'
import ChatMessage, { ChatContentMarkdown } from '@/lib/components/chat-message';
import { WeatherCard } from '@/components/component/weather-card';
import { OpenWeatherMapErrorResponse, OpenWeatherMapResponse } from '@/lib/open-weather-map';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources/index.mjs';
 
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
const mistral = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1',
})

function getProvider(model:ChatModel) {
  const providerMap:{[key:string]:any} = {
    openai, fireworksai, groq, perplexity, mistral,
  } as const

  const provider = providerMap[model.provider]
  if (!provider) {
    console.error('unsupported model', model)
    return null
  }

  return provider
}

// An example of a spinner component. You can also import your own components,
// or 3rd party component libraries.
function Spinner() {
  return <div>Loading...</div>;
}

// for test purpose
async function wait(msec:number) {
  await new Promise(resolve => setTimeout(resolve, msec));  
}

function AppCard({ appInfo }:{ appInfo:any }) {
  return (
    <div>
      <h2>App Information (Function calling example)</h2>
      <p>App Name: {appInfo.name}</p>
      <p>Author: {appInfo.author}</p>
    </div>
  );
}

async function getAppInfo() {
  return {
    name: 'Mulai3',
    author: 'twk',
  };
}


async function getCurrentWeather(city:string) {
  const api_key = process.env.OPENWEATHER_API_KEY
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=metric`
  console.log(url)

  const response = await fetch(url)
  const json = await response.json() 

  if (json.cod === 200)
    return json as OpenWeatherMapResponse
  else
    return json as OpenWeatherMapErrorResponse
}  

function WeatherCardOrError({ city, weatherInfo }: { city: string, weatherInfo: OpenWeatherMapResponse | OpenWeatherMapErrorResponse }) {
  if (weatherInfo.cod !== 200) {
    return (
      <div>
        Weather info of {city} is not found.
      </div>
    )
  }
  return (
    <WeatherCard weather={weatherInfo as OpenWeatherMapResponse} />
  )
}

// An example of a flight card component.
function FlightCard({ flightInfo }:{ flightInfo:any }) {
  return (
    <div>
      <h2>Flight Information (Function calling example)</h2>
      <p>Flight Number: {flightInfo.flightNumber}</p>
      <p>Departure: {flightInfo.departure}</p>
      <p>Arrival: {flightInfo.arrival}</p>
    </div>
  );
}
 
// An example of a function that fetches flight information from an external API.
async function getFlightInfo(flightNumber: string) {
  return {
    flightNumber,
    departure: 'New York',
    arrival: 'San Francisco',
  };
}

type MessageUIState = {
  id: number;
  display: React.ReactNode;
}

async function submitUserMessage(userInput: string):Promise<MessageUIState> {
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
  // console.log(aiState.get().messages);
 
  // The `render()` creates a generated, streamable UI.
  //  console.log('model:', aiState.get().model)
  const ui:React.ReactNode = render({
    model: aiState.get().model.sdkModelValue,
    provider: getProvider(aiState.get().model),
    messages: 
      [
        { role: 'system', content: 'You are a helpful assistant' },
        ...aiState.get().messages.map((message) => ({role: message.role, content: message.content})) as ChatCompletionMessageParam[],
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
 
      return <ChatMessage role="assistant">{content}</ChatMessage>
    },
    // Some models (fireworks, perplexity) just ignore and some (groq) throw errors
    ...(aiState.get().model.doesToolSupport ? {
      tools: {
        get_flight_info: {
          description: 'Get the information for a flight',
          parameters: z.object({
            flightNumber: z.string().describe('the number of the flight')
          }).required(),
          render: async function* ({flightNumber}:{flightNumber:string}) {
            console.log('get_flight_info', flightNumber);
            try {
              // Show a spinner on the client while we wait for the response.
              yield <Spinner/>
    
              // console.log(typeof params)
    
              console.log('flight#', flightNumber)
              // Fetch the flight information from an external API.
              const flightInfo = await getFlightInfo(flightNumber)
              console.log('flightInfo:', flightInfo)
      
              // Update the final AI state.
              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    role: "function",
                    name: "get_flight_info",
                    // Content can be any string to provide context to the LLM in the rest of the conversation.
                    content: JSON.stringify(flightInfo),
                  }
              ]});
    
              // Return the flight card to the client.
              return <FlightCard flightInfo={flightInfo} />
            } catch (e:any) {
              console.log('got error', e, flightNumber)
              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    role: "function",
                    name: "get_app_info",
                    content: e.toString(),
                  },
                ]
              });
              return <span>{e.toString()}</span>                
            }              
          }
        },
        get_mulai3_app_info: {
          description: 'Get the information of Mulai3 app',
          parameters: z.object({}), // no params
          render: async function* () {
            console.log('get_mulai3_app_info');
            try {
              yield <Spinner />
              await wait(2000);
              const appInfo = await getAppInfo()  

              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    role: "function",
                    name: "get_mulai3_app_info",
                    content: JSON.stringify(appInfo),
                  },
                ]
              });
              await new Promise(resolve => setTimeout(resolve, 2000));
    
              return <AppCard appInfo={appInfo} />
            } catch (e:any) {
              console.log('got error', e)
              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    role: "function",
                    name: "get_app_info",
                    content: e.toString(),
                  },
                ]
              });
              return <span>{e.toString()}</span>                
            }            
          }
        } as any,
        get_current_weather: {
          description: 'Get current weather information of the specified city',
          parameters: z.object({
            city: z.string().describe('the city to get current weather')
          }).required(),
          render: async function* ({city}:{city:string}) {
            console.log('get_current_weather', city);
            try {
              const weatherInfo = await getCurrentWeather(city)  
              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    role: "function",
                    name: "get_app_info",
                    content: JSON.stringify(weatherInfo),
                  },
                ]
              });
              return <WeatherCardOrError city={city} weatherInfo={weatherInfo} />  
            } catch (e:any) {
              console.log('got error', e, city)
              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    role: "function",
                    name: "get_app_info",
                    content: e.toString(),
                  },
                ]
              });
              return <span>{e.toString()}</span>                
            }
          }
        } as any,
      },
    } : {}),
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

export function createAIAction({initialModel}:{initialModel:ChatModel}):typeof AIAction {
  return createAI({
    actions: {
      submitUserMessage
    },
    // Each state can be any shape of object, but for chat applications
    // it makes sense to have an array of messages. Or you may prefer something like { id: number, messages: Message[] }
    initialUIState,
    initialAIState: {...initialAIState, model: initialModel},
  });
}

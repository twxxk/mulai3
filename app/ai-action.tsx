import 'server-only'

import { OpenAI } from "openai";
import { createAI, getMutableAIState, render } from "ai/rsc";
import { z } from "zod";
import { ChatModel, getModelByValue } from '@/lib/ai-model';
import Image from 'next/image'
import ChatMessage from '@/components/component/chat-message';
import { WeatherCard } from '@/components/component/weather-card';
import { OpenWeatherMapErrorResponse, OpenWeatherMapResponse } from '@/lib/open-weather-map';
import { ChatCompletionMessageParam, ImageGenerateParams } from 'openai/resources/index.mjs';
import { Card, CardContent } from '@/components/ui/card';
import { getTranslations } from '@/lib/localizations';
 
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
  return <div className='m-1'>Loading...</div>;
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

function WeatherCardOrError({ locale, city, weatherInfo }: { locale: string, city: string, weatherInfo: OpenWeatherMapResponse | OpenWeatherMapErrorResponse }) {
  if (weatherInfo.cod !== 200) {
    return (
      <div>
        Weather info of {city} is not found.
      </div>
    )
  }
  return (
    <WeatherCard locale={locale} weather={weatherInfo as OpenWeatherMapResponse} />
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

async function generateImages(prompt:string, modelValue:'dall-e-2'|'dall-e-3') {
  // https://platform.openai.com/docs/api-reference/images/create
  const baseParams:ImageGenerateParams = { prompt: prompt, response_format: 'url' }
  const e2Params:ImageGenerateParams = { ...baseParams, model: 'dall-e-2', size: '256x256' }
  const e3Params:ImageGenerateParams = { ...baseParams, model: "dall-e-3", size: '1024x1024' }
  const params = modelValue == 'dall-e-3' ? e3Params : e2Params

  const responseImage = await openai.images.generate(params);
  const data = responseImage.data.map((image) => ({...image, model: modelValue}))
  return data
}

type MessageUIState = {
  id: number;
  display: React.ReactNode;
}

async function submitUserMessage(locale: string, userInput: string, doesCallTools: boolean):Promise<MessageUIState> {
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
        ...aiState.get().messages as ChatCompletionMessageParam[],
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
 
      return <ChatMessage locale={locale} role="assistant">{content}</ChatMessage>
    },
    // Some models (fireworks, perplexity) just ignore and some (groq) throw errors
    ...(doesCallTools ? {
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
                    name: "get_flight_info",
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
                    name: "get_mulai3_app_info",
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
                    name: "get_current_weather",
                    content: JSON.stringify(weatherInfo),
                  },
                ]
              });
              return <WeatherCardOrError locale={locale} city={city} weatherInfo={weatherInfo} />  
            } catch (e:any) {
              console.log('got error', e, city)
              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    role: "function",
                    name: "get_current_weather",
                    content: e.toString(),
                  },
                ]
              });
              return <span>{e.toString()}</span>                
            }
          }
        } as any,
        generate_images: {
          description: 'Generate images based on the given prompt',
          parameters: z.object({
            prompt: z.string().describe('the image description to be generated'),
          }),
          render: async function* ({prompt}:{prompt:string}) {
            console.log('generate_images', prompt);
            const modelNames = [
              'dall-e-2', 
              'dall-e-3'
            ] as const
            try {
              yield (
                <Card className="m-1 p-3">
                  <CardContent className="flex flex-row gap-3 justify-center">
                    {modelNames.map((modelName) => {
                      const generatingTitle = `${modelName} generating an image: ${prompt}`;
                      return (<div key={modelName} title={generatingTitle} className='size-64 border animate-pulse grid place-content-center place-items-center gap-3'>
                        <div className="rounded-3xl bg-slate-200 size-24 mx-auto"></div>
                        <div className="rounded w-32 h-3 bg-slate-200"></div>
                        <div className="rounded w-32 h-3 bg-slate-200"></div>
                      </div>)
                    })}
                  </CardContent>
                </Card>
              )
              
              const results = await Promise.all(
                modelNames.map((modelName) => generateImages(prompt, modelName)))
              // console.log(results)
              const images = results.flat()
              // console.log(images)

              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    role: "function",
                    name: "generate_images",
                    content: JSON.stringify(images),
                  },
                ]
              });

              return (
                <Card className="m-1 p-3">
                  <CardContent className="flex flex-row gap-3 justify-center">
                    {images.map((image) => {
                      const title = image.model + ': ' + (image.revised_prompt ?? prompt)
                      return (<Image key={image.url} src={image.url!} title={title} alt={title} width={256} height={256} className='size-64 border' />)
                    })}
                  </CardContent>
                </Card>
              )
            } catch (e:any) {
              console.log('got error', e, prompt);
              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    role: "function",
                    name: "generate_images",
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

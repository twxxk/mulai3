import 'server-only'

import { OpenAI } from "openai";
import { createAI, getMutableAIState, render } from "ai/rsc";
import { z } from "zod";
import { ChatModel, getModelByValue } from '@/lib/ai-model';
import Image from 'next/image'
 
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

// https://openweathermap.org/weather-conditions
type OpenWeatherMapErrorResponse = {
  cod:number,
  message:string,
}
type OpenWeatherMapWeather = {
  id: number, main: string, description: string, icon: string
}
type OpenWeatherMapResponse = {
  coord: {lon:number, lat:number},
  weather: OpenWeatherMapWeather[],
  base: string,
  main: {temp:number, feels_like:number, temp_min:number, temp_max:number, pressure:number, humidity:number},
  visibility: number,
  wind: {speed:number, deg:number},
  rain: {"1h":number},
  clouds: {all:number},
  dt: number,
  sys: {type:number, id:number, country:string, sunrise:number, sunset:number},
  timezone: number,
  id: number,
  name: string,
  cod: number,
}

async function getCurrentWeather(city:string) {
  const api_key = process.env.OPENWEATHER_API_key
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=metric`
  console.log(url)

  const response = await fetch(url)
  const json = await response.json() 

  if (json.cod === 200)
    return json as OpenWeatherMapResponse
  else
    return json as OpenWeatherMapErrorResponse
}  

function WeatherIcon({ weather }:{ weather: OpenWeatherMapWeather }) {
  const url = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`
  return <Image src={url} alt={weather.description} width={32} height={32} />
}

function WeatherCard({ city, weatherInfo }: { city: string, weatherInfo: OpenWeatherMapResponse | OpenWeatherMapErrorResponse }) {
  if (weatherInfo.cod !== 200) {
    return (
      <div>
        Weather info of {city} is not found.
      </div>
    )
  }
  const w = weatherInfo as OpenWeatherMapResponse
  return (
    <div>
      <h2>{w.name}</h2>
      <WeatherIcon weather={w.weather[0]} />
      {w.weather[0].description}<br />
      Temparature: {w.main.temp}<br />
      Humidity: {w.main.humidity}%<br />
      {/* {JSON.stringify(weatherInfo)} */}
    </div>
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
  //  console.log('model:', aiState.get().model)
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
              return <WeatherCard city={city} weatherInfo={weatherInfo} />  
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

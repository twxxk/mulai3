'use client'
 
import { useState } from 'react';
import { useUIState, useActions, useAIState, getAIState } from "ai/rsc";
import type { AIAction } from "../ai-action";
import { ChatModel, allModels, getModelByValue, openAiCompatipleProviders } from '@/lib/ai-model';

const openaiCompatibleModels = allModels.filter((model) => {
  return openAiCompatipleProviders.indexOf(model.provider) >= 0
})

export default function ChatPage({className}:{className?:string}) {
  const [inputValue, setInputValue] = useState('');
  const [uiState, setUIState] = useUIState<typeof AIAction>();
  const [aiState, setAIState] = useAIState<typeof AIAction>();
  const chatModel = aiState.model
  const { submitUserMessage } = useActions<typeof AIAction>();
 
  return (
    <div className={className}>
      {
        // View messages in UI state
        uiState.messages.map((message) => (
          <div key={message.id}>
            {message.display}
          </div>
        ))
      }
 
      <form onSubmit={async (e) => {
        e.preventDefault();
 
        // Add user message to UI state
        setUIState((currentUIState) => ({
          ...currentUIState,
          messages: [
            ...currentUIState.messages,
            {
              id: Date.now(),
              display: <div>{inputValue}</div>,
            },
          ]
        }))
 
        // Submit and get response message
        const responseMessage = await submitUserMessage(inputValue);
        setUIState((currentUIState) => ({
          ...currentUIState,
          messages: [
            ...currentUIState.messages,
            responseMessage,
          ]
        }));
 
        setInputValue('');
      }}>
        <select value={chatModel.modelValue} onChange={(event) => {
          const newModelValue = event.target.value
          const newModel = getModelByValue(newModelValue) as ChatModel
          setAIState((currentAIState) => ({
            ...currentAIState,
            model: newModel,
          }))
        }}>
          {openaiCompatibleModels.map((model) => (
            <option key={model.sdkModelValue} value={model.modelValue}>{model.label}</option>
          ))}
        </select><br />
        <input
          placeholder="Send a message..."
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value)
          }}
          className='w-full'
        />
      </form>
    </div>
  )
}
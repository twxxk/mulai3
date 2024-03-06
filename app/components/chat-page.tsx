'use client'
 
import { useState } from 'react';
import { useUIState, useActions, useAIState, getAIState } from "ai/rsc";
import type { AIAction } from "../ai-action";

export default function ChatPage({className, model}:{className?:string, model?:string}) {
  const [inputValue, setInputValue] = useState('');
  const [modelValue, setModelValue] = useState('gpt-3.5-turbo');
  const [uiState, setUIState] = useUIState<typeof AIAction>();
  const [aiState, setAIState] = useAIState<typeof AIAction>();
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
        // console.log('modelValue:', modelValue)
 
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
        <select value={modelValue} onChange={(event) => {
          const newModelValue = event.target.value
          setModelValue(newModelValue)
          // console.log('new:', newModelValue)
          setAIState((currentAIState) => ({
            ...currentAIState,
            modelValue: newModelValue,
          }))
        }}>
          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
          <option value="gpt-4-turbo-preview">gpt-4-turbo-preview</option>
          <option value="gpt-4">gpt-4</option>
        </select>
        <input
          placeholder="Send a message..."
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value)
          }}
        />
      </form>
    </div>
  )
}
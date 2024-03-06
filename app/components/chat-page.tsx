'use client'
 
import { useCallback, useContext, useEffect, useState } from 'react';
import { useUIState, useActions, useAIState } from "ai/rsc";
import type { AIAction } from "../ai-action";
import { ChatModel, allModels, getModelByValue, openAiCompatipleProviders } from '@/lib/ai-model';
import { eventBus, EventName } from "@/lib/event-emitter"
import { LocaleContext, getTranslations } from '@/lib/locale-context';

const openaiCompatibleTextModels = allModels.filter((model) => {
  return openAiCompatipleProviders.indexOf(model.provider) >= 0 && model.modelValue !== 'gpt-4-vision-preview'
})

export default function ChatPage({className}:{className?:string}) {
	const locale = useContext(LocaleContext)
  const {t} = getTranslations(locale)

  const [inputValue, setInputValue] = useState('');
  const [uiState, setUIState] = useUIState<typeof AIAction>();
  const [aiState, setAIState] = useAIState<typeof AIAction>();
  const chatModel = aiState.model
  const { submitUserMessage } = useActions<typeof AIAction>();
 
  const handleSubmit = useCallback(async () => { 
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
  }, [inputValue, setInputValue, setUIState, submitUserMessage])

  useEffect(() => {
    const handleSubmitBroadcastMessage = (data:string) => {
      // console.log('onsubmit', data);
      handleSubmit()
    };
    eventBus.on(EventName.onSubmitBroadcastMessage, handleSubmitBroadcastMessage);
    const handleChangeBroadcastMessage = (data:string) => {
      // console.log('onchange', data);
      setInputValue(data)
    };
    eventBus.on(EventName.onChangeBroadcastMessage, handleChangeBroadcastMessage);
      
    return () => {
      eventBus.removeListener(EventName.onSubmitBroadcastMessage, handleSubmitBroadcastMessage);
      eventBus.removeListener(EventName.onChangeBroadcastMessage, handleChangeBroadcastMessage);
    };
  }, [handleSubmit]);

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
        handleSubmit();
      }}>
        <select value={chatModel.modelValue} onChange={(event) => {
          const newModelValue = event.target.value
          const newModel = getModelByValue(newModelValue) as ChatModel
          setAIState((currentAIState) => ({
            ...currentAIState,
            model: newModel,
          }))
        }}>
          {openaiCompatibleTextModels.map((model) => (
            <option key={model.sdkModelValue} value={model.modelValue}>{model.label}</option>
          ))}
        </select><br />
        <input
          placeholder={t('childInputPlaceholder')}
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value)
          }}
          className='w-full'
        /><br />

        <label className='whitespace-nowrap overflow-hidden'>
          <input type="checkbox" className='mr-1'
            checked={true}
            disabled
          />
          {t('acceptsBroadCast')}
        </label>

      </form>
    </div>
  )
}
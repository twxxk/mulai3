'use client'
 
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useUIState, useActions, useAIState } from "ai/rsc";
import type { AIAction } from "../ai-action";
import { ChatModel, allModels, getModelByValue, openAiCompatipleProviders } from '@/lib/ai-model';
import { eventBus, EventName } from "@/lib/event-emitter"
import { getTranslations } from "@/lib/locale-context";
import { LocaleContext } from "@/lib/locale-provider";
import ChatMessage from '@/lib/components/chat-message';
import EnterableTextarea from './enterable-textarea';
import { SendIcon } from 'lucide-react';

const openaiCompatibleTextModels = allModels.filter((model) => {
  return openAiCompatipleProviders.indexOf(model.provider) >= 0 && model.modelValue !== 'gpt-4-vision-preview'
})

export default function ChatPane({className}:{className?:string}) {
	const locale = useContext(LocaleContext)
  const {t} = getTranslations(locale)

  const [inputValue, setInputValue] = useState('');
  const [uiState, setUIState] = useUIState<typeof AIAction>();
  const [aiState, setAIState] = useAIState<typeof AIAction>();
  const chatModel = aiState.model
  const { submitUserMessage } = useActions<typeof AIAction>();
  
  const [acceptsBroadcast, setAcceptsBroadcast] = useState(true)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = useCallback(async () => { 
    // Add user message to UI state
    setUIState((currentUIState) => ({
      ...currentUIState,
      messages: [
        ...currentUIState.messages,
        {
          id: Date.now(),
          display: <ChatMessage role="user">{inputValue}</ChatMessage>,
        },
      ]
    }))
    setInputValue(''); // clear in the next renderering

    // Submit and get response message
    const responseMessage = await submitUserMessage(inputValue);
    setUIState((currentUIState) => ({
      ...currentUIState,
      messages: [
        ...currentUIState.messages,
        responseMessage,
      ]
    }));
  }, [inputValue, setInputValue, setUIState, submitUserMessage])

  useEffect(() => {
    const handleSubmitBroadcastMessage = (data:string) => {
      // console.log('onsubmit', data);
      if (acceptsBroadcast)
        handleSubmit()
    };
    eventBus.on(EventName.onSubmitBroadcastMessage, handleSubmitBroadcastMessage);

    const handleChangeBroadcastMessage = (data:string) => {
      // console.log('onchange', data);
      if (acceptsBroadcast)
        setInputValue(data)
    };
    eventBus.on(EventName.onChangeBroadcastMessage, handleChangeBroadcastMessage);
      
    return () => {
      eventBus.removeListener(EventName.onSubmitBroadcastMessage, handleSubmitBroadcastMessage);
      eventBus.removeListener(EventName.onChangeBroadcastMessage, handleChangeBroadcastMessage);
      eventBus.removeListener(EventName.onResetMessages, handleResetMessages);
    };
  }, [handleSubmit, acceptsBroadcast]);

  return (
    <article className={'flex flex-col w-full h-full ' + className}>
      <div className='flex-1 overflow-y-auto w-full'>
        <div className='px-3 py-1 font-bold text-teal-800'>
          {t('ai')}<span className='text-teal-800'>{chatModel.label}</span>
        </div>
        {
          // View messages in UI state
          uiState.messages.map((message) => (
            <div key={message.id}>
              {message.display}
            </div>
          ))
        }
      </div>

      <form ref={formRef} className='transition-opacity duration-50 bottom-0 bg-slate-50 px-2 pt-1 rounded-sm'
        onSubmit={async (e) => {
          e.preventDefault();
          handleSubmit();
      }}>
        {t('model')} 
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
        <div className={
          acceptsBroadcast ? 'hidden' : 
          'flex w-full'}>
          <EnterableTextarea 
              className="flex-1 p-2 my-1 border border-gray-300 rounded h-8 resize-none overflow-hidden disabled:text-gray-300"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value)
              }}
              onEnter={() => {
                formRef?.current?.requestSubmit()
              }}
              // onCompositeChange={onCompositeChange}
              placeholder={t('childInputPlaceholder')}
              />
          {/* disabled is useful to stop submitting with enter */}
          <button type="submit" 
            className='ml-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600' 
            disabled={inputValue.length === 0}>
            <SendIcon className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </button>          
        </div>
        <label className='whitespace-nowrap overflow-hidden'>
          <input type="checkbox" className='mr-1'
            checked={acceptsBroadcast}
            onChange={() => setAcceptsBroadcast(!acceptsBroadcast)}
          />
          {t('acceptsBroadCast')}
        </label>
      </form>
    </article>
  )
}
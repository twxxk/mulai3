'use client'
 
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useUIState, useActions, useAIState } from "ai/rsc";
import type { AIAction } from "../ai-action";
import { ChatModel, allModels, getModelByValue, openAiCompatipleProviders } from '@/lib/ai-model';
import { eventBus, EventName } from "@/lib/event-emitter"
import { getTranslations } from "@/lib/localizations";
import { LocaleContext } from "@/lib/client/locale-context";
import ChatMessage from '@/components/component/chat-message';
import EnterableTextarea from './enterable-textarea';
import { SendIcon } from 'lucide-react';

const openaiCompatibleTextModels = allModels.filter((model) => {
  return openAiCompatipleProviders.indexOf(model.provider) >= 0 && model.modelValue !== 'gpt-4-vision-preview'
})

function configureHistoryAutoScroll(historyElementRef:any) {
  return () => {
    if (historyElementRef.current) {
      // Scroll
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          // console.log('resize top=', entry.target.scrollTop, ', height=', entry.target.scrollHeight);
          const historyElement = historyElementRef.current as unknown as Element
          // When you save source during develpment, historyElement could be null
          if (!historyElement) continue;
          historyElement.scrollTop = historyElement.scrollHeight
        }
      });

      // Called when the new answer is added
      let lastObservedNode:Element
      const mutationObserver = new MutationObserver(entries => {
        for (const mutation of entries) {
          // only childList is being observed
          // if (mutation.type !== 'childList')
          //   continue;

          // Set the resize observer to the last node which should be the expanding
          // console.log('added nodes=', mutation.addedNodes.length)
          const addedNode = mutation.addedNodes.item(mutation.addedNodes.length - 1)

          if (addedNode?.nodeType !== Node.ELEMENT_NODE) {
            console.log('node type=', addedNode?.nodeType)
            continue;
          }

          if (lastObservedNode)
            resizeObserver.unobserve(lastObservedNode)
          
          const addedElement = addedNode as Element
          resizeObserver.observe(addedElement)
          lastObservedNode = addedElement
        }
      });

      mutationObserver.observe(historyElementRef.current, { attributes: false, characterData: false, childList: true });

      // cleanup
      return () => {
        // console.log('cleaning observers'); 
        mutationObserver.disconnect()
        resizeObserver.disconnect()
      };
    }
  }
}

export default function ChatPane({className}:{className?:string}) {
	const locale = useContext(LocaleContext)
  const {t} = getTranslations(locale)

  const [inputValue, setInputValue] = useState('');
  const [uiState, setUIState] = useUIState<typeof AIAction>();
  const [aiState, setAIState] = useAIState<typeof AIAction>();
  const chatModel = aiState.model
  const { submitUserMessage } = useActions<typeof AIAction>();
  
  const [acceptsBroadcast, setAcceptsBroadcast] = useState(true)
  const historyElementRef = useRef(null);
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = useCallback(async () => { 
    // Add user message to UI state
    setUIState((currentUIState) => ({
      ...currentUIState,
      messages: [
        ...currentUIState.messages,
        {
          id: Date.now(),
          display: <ChatMessage locale={locale} role="user">{inputValue}</ChatMessage>,
        },
      ]
    }))
    setInputValue(''); // clear in the next renderering

    // Submit and get response message
    const responseMessage = await submitUserMessage(locale, inputValue);
    setUIState((currentUIState) => ({
      ...currentUIState,
      messages: [
        ...currentUIState.messages,
        responseMessage,
      ]
    }));
  }, [inputValue, setInputValue, setUIState, submitUserMessage, locale])

  const handleResetMessages = useCallback(() => {
    console.log('reset')
    setUIState((currentUIState) => ({
      ...currentUIState,
      messages: []
    }))
    setAIState((currentAIState) => ({
      ...currentAIState,
      messages: [],
    }))
  }, [setUIState, setAIState]);

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

    eventBus.on(EventName.onResetMessages, handleResetMessages)
      
    return () => {
      eventBus.removeListener(EventName.onSubmitBroadcastMessage, handleSubmitBroadcastMessage);
      eventBus.removeListener(EventName.onChangeBroadcastMessage, handleChangeBroadcastMessage);
      eventBus.removeListener(EventName.onResetMessages, handleResetMessages);
    };
  }, [handleSubmit, acceptsBroadcast, handleResetMessages]);

  // Can ignore a warning for the external pure function
  useEffect( // eslint-disable-line react-hooks/exhaustive-deps
    configureHistoryAutoScroll(historyElementRef),
  [historyElementRef]);
    
  return (
    <article className={'flex flex-col w-full h-full ' + className}>
      <div className='flex-1 overflow-y-auto w-full' ref={historyElementRef}>
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
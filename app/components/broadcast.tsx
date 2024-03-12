'use client'

import { eventBus, EventName } from "@/lib/event-emitter"
import { getTranslations } from "@/lib/localizations";
import { LocaleContext } from "@/lib/client/locale-context";
import { SendIcon, Trash2Icon } from "lucide-react";
import { useContext, useRef, useState } from "react";
import EnterableTextarea from "./enterable-textarea";

export default function Broadcast({className}:{className?: string}) {
	const locale = useContext(LocaleContext)
    const {t} = getTranslations(locale)

    const [broadcastText, setBroadcastText] = useState('')
    const formRef = useRef<HTMLFormElement>(null)
    const isUsingIME = useRef(false)

    return (<form ref={formRef}
        className={className}
        onSubmit={async (e) => {
            e.preventDefault();
            eventBus.emit(EventName.onSubmitBroadcastMessage, broadcastText);
            setBroadcastText('')
        }}>
        <EnterableTextarea 
          autoFocus={true}
          className="m-1 p-1 border flex-1 border-gray-300 rounded text-sm resize-none overflow-hidden"
          value={broadcastText}
          onChange={(e)=>{
            const newValue = e.target.value
            setBroadcastText(newValue); 
            eventBus.emit(EventName.onChangeBroadcastMessage, newValue);            
          }}
          onEnter={()=>{
            formRef?.current?.requestSubmit()
          }}
          onCompositeChange={(value)=>isUsingIME.current = value}
          placeholder={t('parentInputPlaceholder')}
        />

        {/* disabled is useful to stop submitting with enter */}
        <button type="submit" 
          className={'p-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'} 
          disabled={broadcastText.length === 0}
          >
          <SendIcon className="size-5" />
          <span className="sr-only">Send</span>
        </button>
        <button type="button" onClick={(e)=>{
            eventBus.emit(EventName.onResetMessages)
          }} 
          className='p-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'
          >
          <Trash2Icon className="size-5" />
          <span className="sr-only">Trash</span>
        </button>         
    </form>
    )
}
import { AIAction, createAIAction } from "./ai-action";
import ChatPane from './components/chat-pane';
import Broadcast from './components/broadcast';
import { Fragment } from "react";
import { getModelByValue } from "@/lib/ai-model";

export default function Page() {
  const ais = [
    {modelValue: 'firefunction-v1', className: ""},
    {modelValue: 'gpt-3.5-turbo', className: ""},
    {modelValue: 'gpt-4', className: ""},
  ]
  
  const AIActions:typeof AIAction[] = ais.map((ai) => 
    createAIAction({initialModel: getModelByValue(ai.modelValue)!})
  )

  return (
    <div className='h-full flex flex-col'>
      <div className='h-full flex-1 flex flex-row text-xs overflow-auto min-h-0'>
        {ais.map((ai, index) => {
          const CustomAIAction = AIActions[index]
          return <Fragment key={index}>
            {index === 0 ? null : 
              // cursor-col-resize
              <div className="w-1 h-full bg-teal-600">&nbsp;</div>
            }
            <CustomAIAction>
              <ChatPane className={ai.className} />
            </CustomAIAction>
          </Fragment>
        })}
      </div>
      
      <Broadcast className="w-screen bottom-0 flex min-h-12" />
    </div>
  )
}

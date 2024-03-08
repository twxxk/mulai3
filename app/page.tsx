import { AIAction } from "./ai-action";
import ChatPage from './components/chat-page';
import Broadcast from './components/broadcast';
import { Fragment } from "react";

export default function Page() {
  const ais = [
    {className: "flex-1 border-r border-r-teal-500 p-2"},
    {className: "flex-1 border-r border-r-teal-500 p-2"},
    {className: 'flex-1 border-teal-500 p-2'},
  ]

  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 flex flex-row'>
        {ais.map((ai, index) => <Fragment key={index}>
          {index === 0 ? null : 
            // cursor-col-resize
            <div className="w-1 h-full bg-teal-600">&nbsp;</div>
          }
          <AIAction key={index}>
            <ChatPage className={ai.className} />
          </AIAction>
        </Fragment>)}
      </div>
      
      <hr />
      <p>Broadcast</p>
      <Broadcast />

    </div>
  )
}

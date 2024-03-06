import { useState } from 'react';
import { useUIState, useActions } from "ai/rsc";
import { AIAction } from "./ai-action";
import ChatPage from './components/chat-page';
import Broadcast from './components/broadcast';

export default function Page() {
  return (
  <div className='h-full flex flex-col'>
    <div className='flex-1 flex flex-row'>
      <AIAction>
        <ChatPage className="flex-1 border-r border-r-teal-500 p-2" />
      </AIAction>
      <AIAction>
        <ChatPage className='flex-1 border-teal-500 p-2'/>
      </AIAction>
    </div>
  </div>)
}

import { useState } from 'react';
import { useUIState, useActions } from "ai/rsc";
import { AIAction } from "./ai-action";
import ChatPage from './components/chat-page';

export default function Page() {
  return (<div className='flex w-screen flex-row'>
    <AIAction>
      <ChatPage className="flex-1" />
    </AIAction>
    <AIAction>
      <ChatPage className='flex-1'/>
    </AIAction>
  </div>)
}

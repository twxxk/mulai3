import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/default-highlight'
import { a11yDark  } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';
import rehypeExternalLinks from 'rehype-external-links'
import { getTranslations } from "@/lib/locale-context";
import { ClipboardCopyIcon } from 'lucide-react';

// FIXME Client Component only
function CodeCopyBtn({children}:{children:React.Component<any, any>}) {
    const handleClick = () => {
      navigator.clipboard.writeText(children?.props?.children);
    }
    return (
      <button onClick={handleClick} className="text-teal-600 enabled:hover:text-teal-500 enabled:active:text-teal-100">
        <ClipboardCopyIcon className="h-5 w-5" />
        <span className='sr-only'>Copy</span>
      </button>
    )
}
    
export default function ChatMessage({role, children}:{role:string, children:React.ReactNode}) {
    // const locale = useContext(LocaleContext) // server componennt cannot call useContext
    // const locale = headers().get('x-negotiated-locale') ?? 'en' as string // You're importing a component that needs next/headers. That only works in a Server Component which is not supported in the pages/ directory. Read more: https://nextjs.org/docs/getting-started/ │ react-essentials#server-components
    const locale = 'en' // XXX
    const {t} = getTranslations(locale)

  return (
  <div className={
    /* #2b2b2b=a11yDark */
    "rounded-sm px-2 py-1 m-1 max-w-full text-sm leading-normal prose prose-sm prose-p:mt-0 prose-pre:mt-1 prose-pre:mb-1 prose-pre:bg-[#2b2b2b] prose-img:my-1 " + 
    (role === "user"
      ? " bg-slate-50"
      : role === "assistant"
      ? " "
      : process.env.NODE_ENV !== 'development'
      ? " hidden" // system
      : " bg-gray-100 text-gray-400"
  )}>
    <div className={'font-bold text-xs ' +
      (role === 'user' ? ' text-slate-800'
      : ' text-teal-800')
    }>
      {role === 'user' ? t('user')
      : role === 'assistant' ? t('ai')
      : t('system')}
    </div>
    {role === "user" 
      ? <div className='whitespace-pre-wrap overflow-auto'>{children}</div>
      : <ChatContentMarkdown>{children}</ChatContentMarkdown>
    }
  </div>
  )
}

export function ChatContentMarkdown({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>){
    // console.log(children)
    return <ReactMarkdown
        urlTransform={(url: string) => {
        // image data https://github.com/remarkjs/react-markdown/issues/774
        // console.log(url)
        if (url.startsWith('data:image/'))
            return url
        return defaultUrlTransform(url)
        }}
        rehypePlugins={[[rehypeExternalLinks, {target: '_blank'}]]}
        remarkPlugins={[remarkGfm]}
        components={{
        img({alt, ...props}) {
            // dynamic image, width/height are not clear
            /* eslint-disable @next/next/no-img-element */
            return (<img className="max-w-64 max-h-64" alt={alt ?? ''} {...props} />)
        },
        pre({children}) {
            return (
            <div className='relative'>
                {children}
                <div className='absolute top-1 right-1'>
                {/* <CodeCopyBtn>{children as any}</CodeCopyBtn> */}
                </div>
            </div>
            )
        },
        code({className, children}) {
            const language = (/language-(\w+)/.exec(className || '') || ['',''])[1]
            if (language || String(children).length >= 50) {
            return (
                <SyntaxHighlighter language={language} style={a11yDark} wrapLongLines={true}>
                {children as any}
                </SyntaxHighlighter>
            )
            } else {
            // inline
            return <code>{children}</code>
            }
        },
    }}>
    {children?.toString()}
    </ReactMarkdown>
}

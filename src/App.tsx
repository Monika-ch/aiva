// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import ChatContainer from "./components/ChatContainer";
import ChatHeader from "./components/ChatHeader";
import ChatInput from "./components/ChatInput";
import { useState } from "react";

function App() {
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = (msg: string) => {
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <ChatContainer>
        <ChatHeader />
        <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-white'>
          {messages.map((msg, i) => (
            <div
              key={i}
              className='self-end max-w-xs ml-auto px-4 py-2 bg-blue-500 text-white rounded-lg shadow'
            >
              {msg}
            </div>
          ))}
        </div>
        <ChatInput onSend={handleSend} />
      </ChatContainer>
    </div>
  );
}

export default App;


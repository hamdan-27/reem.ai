import {
  QueryClient,
  QueryClientProvider} from '@tanstack/react-query';
import AnimatedHeader from './components/AnimatedHeader';
import ChatBot from './components/ChatBot';
function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <main className="font-poppins h-screen w-full bg-zinc-900 overflow-hidden">
        <AnimatedHeader/>
        <ChatBot/>
      </main>
    </QueryClientProvider>
  );
}

export default App;

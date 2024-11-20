import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CaretRight } from "@phosphor-icons/react";
import AnimatedChatMessage from "./AnimatedChatMessage";
import AnimatedLoader from "./AnimatedLoader";
import { Message } from "../types/Message";
import { motion } from "motion/react";
import  { AnimatedToast,type ToastProps}  from "./AnimatedToast";
import viewitLogo from "../assets/viewit-logo-no-text.png";
import { realEstateQuestions } from "../assets/questions";

const apiURL = import.meta.env.VITE_API_URL;


const initalQuestions = realEstateQuestions.sort(() => Math.random() - 0.5).slice(0, 4);

function ChatBot() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [predefinedQuestions, setPredefinedQuestions] = useState<string[]>(initalQuestions);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Useeffect for handling window resize for the input box
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchBotResponse = useCallback(async (textPrompt: string) => {
    if (!textPrompt.trim()) return "";
    const response = await fetch(
      `${apiURL}/${textPrompt}`
    );
    if (!response.ok) {
      const responseErrorToast: ToastProps = {
        type: "fail",
        message: `${response.statusText}, please try again`,
        position: "top-right",
      }
      setToasts((prevToasts) => [...prevToasts, responseErrorToast]);
      throw new Error(response.statusText);
    }
    const data = await response.json();
    const message = data.messages.content
    setMessages((prevMessages) => [
      ...prevMessages,
      { isBot: true, messageText: message, sentAt: new Date() },
    ]);
    setQuery("");
    return data;
  }, []);

  const { isLoading } = useQuery({
    queryKey: ["botResponse", query],
    queryFn: () => fetchBotResponse(query),
    enabled: query.length > 0,
  });

  const scrollToBottom = useCallback(() => {
    chatBottomRef.current?.scrollTo({
      top: chatBottomRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  // Useeffect for randomizing predefined questions
  useEffect(() => {
    const shuffledQuestions = [...realEstateQuestions].sort(() => Math.random() - 0.5).slice(0, 4);
    setPredefinedQuestions(shuffledQuestions);
  }, [messages]);
  // Useeffect for scrolling to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

 const handleSend = (text: string = input) => {
    if (text.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { isBot: false, messageText: text, sentAt: new Date() },
      ]);
      setInput(""); // Clear the input field after sending
      setQuery(text); // Set the query to trigger the fetch
    }else{
      const inputErrorToast: ToastProps = {
        type: "warning",
        message: "Please enter a message",
        position: "top-right",
      }
      setToasts((prevToasts) => [...prevToasts, inputErrorToast]);
    }
  };

  const handlePredefinedQuestion = useCallback((question: string) => {
    setInput(question);
    handleSend(question); // Send the predefined question
  }, []);
  return (
    <div className="flex flex-col 2xl:items-center sm:pb-48 text-white w-full h-full">
      {messages.length === 0 && (
        <motion.div
          className="text-center w-full flex flex-col justify-center items-center gap-5 overflow-auto py-48 sm:py-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1,type:"tween",ease:"easeInOut" }}
          className="h-24 w-full">
            <img
              src={viewitLogo}
              alt=""
              className="h-24 w-full object-contain"
            />
          </motion.div>
          {/* <h2 className="text-2xl px-5 lg:px-0">
            Welcome to Viewit Virtual Agent. <br /> Let's get started by typing
            a message or selecting one of the options.
          </h2> */}
          <h2 className="text-2xl px-5 lg:px-0">
            Hi! I am Reem, your Virtual Abu Dhabi Real Estate Agent. <br /> Let's get started by typing
            a message or selecting one of the options.
          </h2>
          <div className="flex flex-col gap-2 px-5 lg:px-0">
            {predefinedQuestions.map((question, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  // Send a new text prompt
                  handlePredefinedQuestion(question);
                }}
                className="bg-zinc-800 hover:bg-zinc-700 rounded-2xl 2xl:rounded-full p-4 w-full"
              >
                {question}
              </button>
            ))}
          </div>
        </motion.div>
      )}
      {messages.length > 0 && (
          <div
            ref={chatBottomRef}
            className={`2xl:max-w-[900px] flex flex-col items-center justify-between gap-5 h-dvh overflow-auto px-6 pt-10`}
          >
            {messages.map((message, index) => (
              <AnimatedChatMessage key={index} message={message} />
            ))}
            {isLoading && <AnimatedLoader text="Getting your answer" />}
            {!isLoading && <div className="flex flex-col justify-center gap-2">
              <p className="text-center">Suggested questions:</p>
            {predefinedQuestions.map((question, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  // Send a new text prompt
                  handlePredefinedQuestion(question);
                }}
                className="bg-zinc-800 hover:bg-zinc-700 rounded-2xl 2xl:rounded-full p-4"
              >
                {question}
              </button>
            ))}
          </div>}
          </div>
          
      )}
      {/* 1536 is the value 2xl breakpoint */}
      <motion.form
         initial={{ opacity: 0, y: 100, x: windowWidth < 1536 ? 0 : '-50%' }}
         animate={{ opacity: 1, y: 0, x: windowWidth < 1536 ? 0 : '-50%' }}
         transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 fixed w-full 2xl:w-[900px] bottom-0 2xl:bottom-5 2xl:left-1/2 2xl:-translate-x-1/2 p-4 bg-zinc-800 2xl:rounded-full"
      >
        <input
          type="text"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Getting your answer" : "Type a message"}
          disabled={isLoading}
          className="bg-transparent focus-within:outline-none bg-zinc-700 rounded-full px-4 py-2 w-full"
        />
        <button 
        disabled={isLoading}
        type="submit" className="bg-primary rounded-full p-2 disabled:bg-gray-500">
          <CaretRight size={24} />
        </button>
      </motion.form>
      {toasts.map((toast, index) => (
        <AnimatedToast key={index} type={toast.type} message={toast.message} position={toast.position} />
      ))}
    </div>
  );
}

export default ChatBot;

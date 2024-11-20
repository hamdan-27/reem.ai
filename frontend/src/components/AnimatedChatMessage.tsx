import { motion } from "motion/react";
import { Message } from "../types/Message";
function AnimatedChatMessage({message}:{message:Message}){
    return (
        <motion.div 
        initial={{ opacity: 0, x: message.isBot ? -100 : 100 }} 
        animate={{ opacity: 1, x: 0 }}
        className={`relative flex flex-col gap-4 p-4 whitespace-pre-wrap ${message.isBot ? 'place-self-start bg-primary rounded-r-2xl rounded-bl-2xl' : 'place-self-end bg-zinc-700 rounded-l-2xl rounded-br-2xl'}`}
        >
            <p className="text-base leading-relaxed font-normal">{message.messageText.split("'''")[0]}</p>
            <span className="text-slate-400 text-[0.7rem] font-medium">{
                message.sentAt?.toLocaleDateString() + " " + message.sentAt?.toLocaleTimeString()}</span>
        </motion.div>
    )
}
export default AnimatedChatMessage;
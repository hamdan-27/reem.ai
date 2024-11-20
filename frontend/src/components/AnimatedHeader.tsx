import viewitLogoText from "../assets/viewit-logo.png";
import {motion} from "motion/react";
const AnimatedHeader = () => {
    return (
        <motion.header 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full flex gap-3 justify-center lg:justify-start items-center bg-zinc-900 sticky top-0 p-8 lg:p-6 text-white">
          <a href="/" className='text-2xl lg:text-3xl'><span className="font-medium">Reem.AI</span> by </a>
          <a href="https://viewitdubai.com" target="_blank" className="block h-full w-36">
            <img
              src={viewitLogoText}
              alt=""
              className="h-full w-full object-contain"
            />
          </a>
        </motion.header>
    )
}

export default AnimatedHeader
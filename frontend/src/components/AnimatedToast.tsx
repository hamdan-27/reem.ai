import { useEffect, useState } from "react";
import { CheckCircle, WarningCircle, Warning, Info, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

const ICON_SIZE = 24;
const ICON_WEIGHT = "fill";

export type ToastProps = {
  type?: "success" | "fail" | "info" | "warning";
  message?: string;
  position?: string;
};

export const AnimatedToast = ({ type = "info", message, position }: ToastProps) => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHide(true);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  let toastClass = "";
  let toastIcon: JSX.Element = <></>;
  let positionClass = "";

  switch (position) {
    case "center":
      positionClass = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      break;
    case "top-center":
      positionClass = "top-5 left-1/2 -translate-x-1/2";
      break;
    case "top-left":
      positionClass = "top-5 left-5";
      break;
    case "top-right":
      positionClass = "top-5 right-5";
      break;
    case "bottom-center":
      positionClass = "bottom-5 left-1/2 -translate-x-1/2";
      break;
    case "bottom-left":
      positionClass = "bottom-5 left-5";
      break;
    case "bottom-right":
      positionClass = "bottom-5 right-5";
      break;
    default:
      positionClass = "bottom-5 right-5";
      break;
  }

  switch (type) {
    case "success":
      toastClass = "bg-green-500 text-white";
      toastIcon = <CheckCircle size={ICON_SIZE} weight={ICON_WEIGHT} />;
      break;
    case "fail":
      toastClass = "bg-red-500 text-white";
      toastIcon = <WarningCircle size={ICON_SIZE} weight={ICON_WEIGHT} />;
      break;
    case "warning":
      toastClass = "bg-yellow-500 text-white";
      toastIcon = <Warning size={ICON_SIZE} weight={ICON_WEIGHT} />;
      break;
    default:
      toastClass = "bg-gray-400 text-black";
      toastIcon = <Info size={ICON_SIZE} weight={ICON_WEIGHT} />;
      break;
  }

  return (
    <AnimatePresence>
      {!hide && (
        <motion.div
          initial={{ x: "100vw" }}
          animate={{ x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 ,type:"spring"}}
          className={`flex gap-5 items-center fixed w-max min-h-min z-[5000] p-4 rounded-md text-lg ${toastClass} ${positionClass}`}
        >
          {toastIcon}
          <p>{message}</p>
          <button onClick={() => setHide(true)}>
            <X className="text-white" size={ICON_SIZE} weight={"bold"} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedToast;

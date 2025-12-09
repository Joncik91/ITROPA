import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  theme: any;
  maxWidth?: string;
}

export const ModalWrapper = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  theme,
  maxWidth = "max-w-lg",
}: ModalWrapperProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className={`${theme.modalBg} rounded-xl p-6 w-full ${maxWidth} border max-h-[85vh] overflow-y-auto`}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              {icon}
              {title}
            </h3>
            <button onClick={onClose} className={theme.muted}>
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

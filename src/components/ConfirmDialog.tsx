/**
 * ConfirmDialog Component
 * Custom confirmation modal for consistent UI across desktop and mobile
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  darkMode?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  darkMode = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Dialog */}
          <div
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
            onClick={onCancel}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-sm rounded-2xl shadow-2xl border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-100 border-gray-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4">
                <h3
                  className={`text-xl font-semibold ${
                    darkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {title}
                </h3>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <p
                  className={`text-base leading-relaxed ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div
                className={`px-6 py-4 flex items-center justify-end gap-3 border-t ${
                  darkMode ? "border-gray-700/50" : "border-gray-200"
                }`}
              >
                <button
                  onClick={onCancel}
                  style={{
                    backgroundColor: darkMode ? "#374151" : "#e5e7eb",
                    color: darkMode ? "#d1d5db" : "#374151",
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80 shadow-sm"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

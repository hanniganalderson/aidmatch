import React from "react";
import { toast as toastImpl } from '../components/ui/use-toast';

// Simple toast utility that works with the existing code
export const showToast = {
  success: (message: string) => {
    toastImpl({
      title: "Success",
      description: message,
      variant: "default",
    });
  },
  
  error: (message: string) => {
    toastImpl({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  },
  
  info: (message: string) => {
    toastImpl({
      title: "Info",
      description: message,
    });
  },
  
  warning: (message: string) => {
    toastImpl({
      title: "Warning",
      description: message,
    });
  },
  
  custom: (content: React.ReactNode) => {
    toastImpl({
      description: content,
    });
  }
};

function showToastMessage(message: string, type: "success" | "error" | "loading" | "default") {
  // Create a temporary toast element
  const toast = document.createElement("div");
  toast.className = `p-4 mb-3 rounded-lg shadow-lg text-white ${getToastTypeClass(type)} transition-all duration-300 transform translate-x-0`;
  toast.textContent = message;
  
  // Add to container or create one
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed top-4 right-4 z-50";
    document.body.appendChild(container);
  }
  
  container.appendChild(toast);
  
  // Remove after delay
  setTimeout(() => {
    toast.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => {
      if (container?.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3000);
  
  return { id: Date.now().toString() };
}

function getToastTypeClass(type: string): string {
  switch (type) {
    case "success":
      return "bg-green-500";
    case "error":
      return "bg-red-500";
    case "loading":
      return "bg-blue-500";
    default:
      return "bg-gray-700";
  }
} 
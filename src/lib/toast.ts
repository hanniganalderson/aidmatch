import React from "react";

// Simple toast implementation until react-hot-toast is properly installed
export const showToast = {
  success: (message: string) => {
    console.log("Success:", message);
    // Implement a basic toast notification
    showToastMessage(message, "success");
  },
  error: (message: string) => {
    console.error("Error:", message);
    showToastMessage(message, "error");
  },
  loading: (message: string) => {
    console.log("Loading:", message);
    return showToastMessage(message, "loading");
  },
  custom: (message: React.ReactNode) => {
    console.log("Custom toast");
    showToastMessage("Custom notification", "default");
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
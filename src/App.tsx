import { useState, useEffect } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    if (darkMode) {
      localStorage.theme = "light";
      setDarkMode(false);
    } else {
      localStorage.theme = "dark";
      setDarkMode(true);
    }
  };

  return (
    <div className="font-sans antialiased text-text-main bg-background min-h-screen transition-colors duration-200">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar toggleTheme={toggleTheme} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-8">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}

export default App;

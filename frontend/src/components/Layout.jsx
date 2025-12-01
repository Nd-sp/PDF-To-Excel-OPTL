import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Upload,
  List,
  FileText,
  BarChart3,
  Search,
  GitCompare,
  Clock,
  HelpCircle
} from "lucide-react";
import AlertsNotification from "./AlertsNotification";
import ThemeToggle from "./ThemeToggle";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/50 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="ml-3 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                PDF to Excel Converter
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-2">
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Upload
                      className={`h-5 w-5 mr-2 ${
                        isActive
                          ? "text-indigo-700 dark:text-indigo-300"
                          : "text-indigo-600 dark:text-indigo-400"
                      }`}
                    />
                    <span>Upload</span>
                  </>
                )}
              </NavLink>
              <NavLink
                to="/batches"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <List
                      className={`h-5 w-5 mr-2 ${
                        isActive
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-blue-600 dark:text-blue-400"
                      }`}
                    />
                    <span>Batches</span>
                  </>
                )}
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <BarChart3
                      className={`h-5 w-5 mr-2 ${
                        isActive
                          ? "text-green-700 dark:text-green-300"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    />
                    <span>Analytics</span>
                  </>
                )}
              </NavLink>
              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Search
                      className={`h-5 w-5 mr-2 ${
                        isActive
                          ? "text-purple-700 dark:text-purple-300"
                          : "text-purple-600 dark:text-purple-400"
                      }`}
                    />
                    <span>Search</span>
                  </>
                )}
              </NavLink>
              <NavLink
                to="/comparison"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <GitCompare
                      className={`h-5 w-5 mr-2 ${
                        isActive
                          ? "text-orange-700 dark:text-orange-300"
                          : "text-orange-600 dark:text-orange-400"
                      }`}
                    />
                    <span>Compare</span>
                  </>
                )}
              </NavLink>
              <NavLink
                to="/scheduler"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Clock
                      className={`h-5 w-5 mr-2 ${
                        isActive
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    />
                    <span>Scheduler</span>
                  </>
                )}
              </NavLink>
            </nav>

            {/* Theme Toggle, Help & Alerts */}
            <div className="flex items-center gap-3">
              <NavLink
                to="/help"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Help & Guide"
              >
                <HelpCircle className="h-5 w-5" />
              </NavLink>
              <ThemeToggle />
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <AlertsNotification />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden pb-4">
            <nav className="flex flex-wrap gap-2">
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Upload
                      className={`h-4 w-4 mr-1 ${
                        isActive
                          ? "text-indigo-700 dark:text-indigo-300"
                          : "text-indigo-600 dark:text-indigo-400"
                      }`}
                    />
                    <span>Upload</span>
                  </>
                )}
              </NavLink>
              <NavLink
                to="/batches"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <List
                      className={`h-4 w-4 mr-1 ${
                        isActive
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-blue-600 dark:text-blue-400"
                      }`}
                    />
                    <span>Batches</span>
                  </>
                )}
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <BarChart3
                      className={`h-4 w-4 mr-1 ${
                        isActive
                          ? "text-green-700 dark:text-green-300"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    />
                    <span>Analytics</span>
                  </>
                )}
              </NavLink>
              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Search
                      className={`h-4 w-4 mr-1 ${
                        isActive
                          ? "text-purple-700 dark:text-purple-300"
                          : "text-purple-600 dark:text-purple-400"
                      }`}
                    />
                    <span>Search</span>
                  </>
                )}
              </NavLink>
              <NavLink
                to="/comparison"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <GitCompare
                      className={`h-4 w-4 mr-1 ${
                        isActive
                          ? "text-orange-700 dark:text-orange-300"
                          : "text-orange-600 dark:text-orange-400"
                      }`}
                    />
                    <span>Compare</span>
                  </>
                )}
              </NavLink>
              <NavLink
                to="/scheduler"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Clock
                      className={`h-4 w-4 mr-1 ${
                        isActive
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    />
                    <span>Scheduler</span>
                  </>
                )}
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            PDF to Excel Converter - Bulk process 500-1000 PDFs with AI-powered
            extraction
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

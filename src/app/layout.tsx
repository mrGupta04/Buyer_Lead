// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './providers'
import UserInfo from '../components/UserInfo'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Buyer Lead Intake App',
  description: 'Manage and track buyer leads efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
            {/* Modern Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 flex items-center">
                      <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3h18v18H3V3zm4 2v12h10V5H7z" fill="evenodd" />
                        <path d="M9 9h6v2H9V9zm0 4h6v2H9v-2z" fill="currentColor" />
                      </svg>
                      <h1 className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        BuyerLeads
                      </h1>
                    </div>
                    <nav className="hidden md:ml-8 md:flex md:space-x-6">
                      <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                        Dashboard
                      </a>
                      
                    </nav>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    
                    
                    <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span className="absolute top-1 right-1 block h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>
                    
                    {/* User Info Component */}
                    <UserInfo />
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
              {children}
            </main>

            {/* Modern Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center">
                      <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3h18v18H3V3zm4 2v12h10V5H7z" fill="evenodd" />
                        <path d="M9 9h6v2H9V9zm0 4h6v2H9v-2z" fill="currentColor" />
                      </svg>
                      <h2 className="ml-2 text-xl font-bold text-gray-900">BuyerLeads</h2>
                    </div>
                    <p className="mt-4 text-gray-600 max-w-md">
                      Streamline your lead management process with our intuitive platform designed for real estate professionals.
                    </p>
                    <div className="mt-6 flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-blue-600">
                        <span className="sr-only">Facebook</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-blue-600">
                        <span className="sr-only">Twitter</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-blue-600">
                        <span className="sr-only">LinkedIn</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Product</h3>
                    <ul className="mt-4 space-y-2">
                      <li><a href="#" className="text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Features</a></li>
                      <li><a href="#" className="text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Pricing</a></li>
                      <li><a href="#" className="text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Integrations</a></li>
                      <li><a href="#" className="text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Updates</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Support</h3>
                    <ul className="mt-4 space-y-2">
                      <li><a href="#" className="text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Documentation</a></li>
                      <li><a href="#" className="text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Guides</a></li>
                      <li><a href="#" className="text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">API Status</a></li>
                      <li><a href="#" className="text-base text-gray-600 hover:text-blue-600 transition-colors duration-200">Contact Us</a></li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
                  <p className="text-base text-gray-500">
                    &copy; {new Date().getFullYear()} BuyerLeads. All rights reserved.
                  </p>
                  <div className="mt-4 md:mt-0 flex space-x-6">
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm">Privacy Policy</a>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm">Terms of Service</a>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm">Cookie Policy</a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
// src/app/auth/verify-request/page.tsx
'use client'

export default function VerifyRequestPage() {
  const handleOpenGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Animated background elements */}
      <div id="background-container" className="absolute inset-0 overflow-hidden"></div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="text-center">
            {/* Animated envelope icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-6 relative">
              <div className="envelope animate-envelope">
                <div className="envelope-front bg-white/20"></div>
                <div className="envelope-back bg-white/10"></div>
                <div className="envelope-letter bg-white">
                  <div className="w-6 h-1 bg-blue-400 mb-1 mx-auto"></div>
                  <div className="w-4 h-1 bg-blue-300 mx-auto"></div>
                </div>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 text-white absolute z-10" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email</h1>
            
            <p className="text-gray-600 mb-6">
              We've sent a magic link to your email address. Click the link to sign in to your account.
            </p>
            
            {/* Gmail Quick Access Button */}
            <div className="mb-6">
              <button
                onClick={handleOpenGmail}
                className="flex items-center justify-center w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                  <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/>
                  <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/>
                  <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/>
                </svg>
                Open Gmail
              </button>
            </div>
            
            {/* Animated dots */}
            <div className="flex justify-center space-x-2 mb-8">
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Demo Tip:</strong> For testing purposes, you can use any email address. No actual email will be sent.
              </p>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => window.location.href = '/auth/signin'}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to sign in
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure authentication powered by NextAuth
          </p>
        </div>
      </div>

     
    </div>
  )
}
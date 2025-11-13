import React from "react";
import { XCircle, Home } from "lucide-react";

const PortalClosed = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
      <div className="relative max-w-lg w-full">
        
        {/* Decorative Elements */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-indigo-200 rounded-full opacity-20 blur-xl"></div>
        
        {/* Main Card */}
        <div className="relative bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-10 text-center hover:shadow-2xl transition-all duration-300">
          
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300">
                <XCircle className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-red-400 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Portal  Closed
          </h1>
          
          {/* Divider */}
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-8"></div>

          {/* Subtext */}
          <p className="text-gray-600 text-lg mb-10 leading-relaxed">
            We&apos;re sorry, portal is currently closed. <br />
            Please check back for upcoming opportunities.
          </p>

          {/* CTA Button */}
          <a
            href="https://bdcoe.co.in"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Home className="h-5 w-5" />
            <span>Back to Home</span>
            <div className="w-0 group-hover:w-2 h-2 bg-white rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
          </a>
          
          {/* Subtle bottom accent */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default PortalClosed;
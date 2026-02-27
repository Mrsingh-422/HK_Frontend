import React from "react";

function FromHealth() {
  return (
    <section className="bg-slate-50 py-12 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* The Slanted Banner Container */}
        <div className="relative">
          
          {/* Background Slant (White Box) */}
          <div className="absolute inset-0 bg-white shadow-sm md:skew-x-[-10deg] transform origin-center transition-all duration-500"></div>

          {/* Content Wrapper (Un-skewed on Desktop) */}
          <div className="relative z-10 md:skew-x-[10deg] flex flex-col lg:flex-row items-center justify-between px-6 py-8 md:px-16 md:py-10 gap-8 lg:gap-4">
            
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-2">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black italic text-emerald-600 leading-tight">
                Ready to deliver your Lab <br className="hidden xl:block" />
                services? Join Our Team
              </h2>
              <p className="text-emerald-500 text-sm md:text-base font-medium max-w-md">
                We'll be happy to have you as a part of our excellent team to work along with our clients.
              </p>
            </div>

            {/* Middle Logo Section */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center">
                {/* Replace with your actual Kangaroo Logo */}
                <img 
                  src="logo.png" 
                  alt="Health Kangaroo Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 text-center lg:text-left space-y-2 lg:pl-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black italic text-emerald-600 leading-tight">
                From Health <br />
                Kangaroo
              </h2>
              <p className="text-emerald-500 text-sm md:text-base font-medium">
                Ready to deliver..?
              </p>
            </div>

            {/* Far Right Button */}
            <div className="flex-shrink-0">
              <button className="border-2 border-emerald-400 text-emerald-600 font-bold italic px-8 py-3 rounded-xl hover:bg-emerald-500 hover:text-white transition-all duration-300 active:scale-95 shadow-sm">
                Let's Begin
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default FromHealth;
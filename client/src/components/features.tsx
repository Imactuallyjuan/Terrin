import { Edit, Bot, Handshake } from "lucide-react";

export default function Features() {
  return (
    <section className="py-16 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            How Terrin Works
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Three simple steps to get your construction project done right
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-600 rounded-full">
              <Edit className="h-8 w-8 text-white" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-900">1. Describe Your Project</h3>
            <p className="mt-4 text-slate-600">
              Tell us about your construction project with our simple form. Include photos, measurements, and specific requirements.
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-orange-600 rounded-full">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-900">2. Get AI-Powered Estimates</h3>
            <p className="mt-4 text-slate-600">
              Our advanced AI analyzes your project details and provides accurate cost estimates based on current market rates.
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-600 rounded-full">
              <Handshake className="h-8 w-8 text-white" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-900">3. Match with Experts</h3>
            <p className="mt-4 text-slate-600">
              Connect with verified, licensed professionals who specialize in your type of project and are available in your area.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

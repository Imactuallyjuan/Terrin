import { Button } from "@/components/ui/button";
import { Plus, Calculator } from "lucide-react";

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-800/90"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
        }}
      ></div>
      
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Connect with Trusted{" "}
            <span className="text-orange-400">Construction Professionals</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
            Get accurate cost estimates powered by AI and find vetted professionals for your construction projects. From small repairs to major renovations.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center justify-center text-lg font-semibold px-8 py-4"
              onClick={() => scrollToSection('post-project')}
            >
              <Plus className="mr-2 h-5 w-5" />
              Post Your Project
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-blue-600 hover:bg-gray-50 transition-colors flex items-center justify-center text-lg font-semibold px-8 py-4 border-2 border-white"
              onClick={() => scrollToSection('cost-estimator')}
            >
              <Calculator className="mr-2 h-5 w-5" />
              Get Cost Estimate
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

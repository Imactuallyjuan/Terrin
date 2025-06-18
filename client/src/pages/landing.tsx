import Header from "@/components/header";
import Hero from "@/components/hero";
import Features from "@/components/features";
import PostProjectFirebase from "@/components/PostProjectFirebase";
import EstimateForm from "@/components/EstimateForm";
import MatchTradesFirebase from "@/components/MatchTradesFirebase";
import Stats from "@/components/stats";
import Footer from "@/components/footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Hero />
      <Features />
      <PostProjectFirebase />
      <section id="cost-estimator" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Get Your AI-Powered Cost Estimate
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Get accurate construction cost estimates in seconds using advanced AI technology
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <EstimateForm onEstimateComplete={(estimate) => {
              console.log('Estimate completed:', estimate);
            }} />
          </div>
        </div>
      </section>
      <MatchTradesFirebase />
      <Stats />
      <Footer />
    </div>
  );
}

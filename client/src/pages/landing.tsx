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
      <EstimateForm onEstimateComplete={(estimate) => {
        console.log('Estimate completed:', estimate);
      }} />
      <MatchTradesFirebase />
      <Stats />
      <Footer />
    </div>
  );
}

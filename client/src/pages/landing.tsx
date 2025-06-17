import Header from "@/components/header";
import Hero from "@/components/hero";
import Features from "@/components/features";
import PostProjectFirebase from "@/components/PostProjectFirebase";
import CostEstimator from "@/components/cost-estimator";
import MatchTrades from "@/components/match-trades";
import Stats from "@/components/stats";
import Footer from "@/components/footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Hero />
      <Features />
      <PostProjectFirebase />
      <CostEstimator />
      <MatchTrades />
      <Stats />
      <Footer />
    </div>
  );
}


import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingSection from "@/components/landing/PricingSection";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import WhatToAsk from "@/components/landing/WhatToAsk";  
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/actions/users";
export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await currentUser();
  //sync user then navigate to dashboard page
  if (user) {
    await syncUser(); // pass user
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <HowItWorks />
      <WhatToAsk />
      <PricingSection />
      <CTA /> 
      <Footer /> 
    </div>
  );
}

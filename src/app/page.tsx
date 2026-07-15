
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingSection from "@/components/landing/PricingSection";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import WhatToAsk from "@/components/landing/WhatToAsk";  
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
export default async function asyncHome() {
  const user = await currentUser();
  if (user) redirect("/dashboard");
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

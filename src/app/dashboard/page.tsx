import NavBar  from "@/components/NavBar";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import MainActions from "@/components/dashboard/MainActions";
function DashboardPage() {
  return (
    <>
      <NavBar />
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <WelcomeSection />
        <MainActions />
        {/* <ActivityOverview /> */}
      </div>
    </>
  )
}

export default DashboardPage
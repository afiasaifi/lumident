import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import AdminDashboardClient from "./AdminDashBoardClient"

async function AdminPage() {
    const user = await currentUser()
    //if user is not logged in, redirect to home page
    if (!user) redirect("/")
        const adminEmail = process.env.ADMIN_EMAIL
        const userEmail = user.emailAddresses[0].emailAddress
        //if user email is not the same as admin email, redirect to user dashboard
        if (!adminEmail || userEmail !== adminEmail) {
            redirect("/dashboard")
        }
    return <AdminDashboardClient />
  
}

export default AdminPage
"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

// this function is called when the user logs in or registers, 
// it checks if the user exists in the database and creates a new user if they don't exist
export async function syncUser () {
    try {
        const user = await currentUser();
        if(!user) return;

        const existingUser = await prisma.user.findUnique({where:{clerkId: user.id}});
        if(existingUser) return existingUser;
        const dbUser = await prisma.user.create({
            data:{
                clerkId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.emailAddresses[0]?.emailAddress,
                phone: user.phoneNumbers[0]?.phoneNumber
            }
        })
        return dbUser;
    }catch (error) {
        console.error("Error syncing user:", error);
    }
}
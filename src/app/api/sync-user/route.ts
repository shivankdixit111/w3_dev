import { db } from "@/db/db";
import { User } from "@/db/schema"; 
import { auth, clerkClient } from "@clerk/nextjs/server"; 
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = 'nodejs' //this fixes builtins errors

export async function POST() {
    try { 

       const { userId } = await auth();
       if(!userId) {
         return NextResponse.json({message: "Unauthorized"}, {status: 400})
       }
       console.log('user id ', userId)

       
       const existingUser = await db.query.User.findFirst({
          where: eq(User.id, userId)
       }) 
       if(existingUser) {
         return NextResponse.json(existingUser, {status: 200})
       }

       const clerk = await clerkClient();  
       const clerkUser = await clerk.users.getUser(userId);
       const email = clerkUser.emailAddresses[0].emailAddress;
       const username = clerkUser.fullName;
      
       console.log('username and email is ', username, email)
       const newUser = await db.insert(User).values({id:userId, username, email}) .returning()
       console.log('new user is ', newUser)
       return NextResponse.json(newUser, {status: 200})
    } catch(error) {
        console.log(error)
        return NextResponse.json({message: "Server error"}, {status: 400})
    }
}
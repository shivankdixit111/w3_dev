import { db } from "@/db/db";
import { User } from "@/db/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
    try {
       const {userId} = await auth();
       if(!userId) {
          return NextResponse.json({message: "Unauthorized"}, {status: 500})
       }
       const client = await clerkClient(); 
       const clerkUser = await client.users.getUser(userId)
       const email = clerkUser.emailAddresses[0].emailAddress;
       const fullName = clerkUser.fullName;

       const userExist = await db.query.User.findFirst({
        where: eq(User.email, email)
       })
       if(userExist) {
          return NextResponse.json(userExist, {status: 200})
       }

       const user = await db.insert(User).values({
          id: userId,
          email,
          username: fullName
       })
       return NextResponse.json(user, {status: 200})
    } catch(error) {
        console.log(error)
        return NextResponse.json({message: "Server error"}, {status: 500})
    }
}
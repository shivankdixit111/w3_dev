import { db } from "@/db/db";
import { Task, Topic } from "@/db/schema";
import { generateTasks } from "@/services/gemini"; 
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server"; 

export async function POST(req: NextRequest) {
    try{
        const {userId} = await auth();
        if(!userId) {
           return NextResponse.json({message: "Unauthorized"}, {status: 401})
        }
        const {title} = await req.json();
        const topicExists = await db.query.Topic.findFirst({
          where: eq(Topic.title, title)
        })

        if(topicExists) {
           return NextResponse.json({message: "Topic already exists"}, {status: 400})
        }
        const res = await db.insert(Topic).values({title, user_id: userId}).returning()
        const newTopic = res[0];

        console.log(newTopic)
        
        const tasks = await generateTasks(title); 
        for(const t of tasks) {
            await db.insert(Task).values({topic_id: newTopic.id, title: t})
        } 

        return NextResponse.json(newTopic, {status: 200})
    } catch(error) {
        console.log(error)
        return NextResponse.json({message: "Server error"}, {status: 500})
    }
}

export async function GET() {
    try{
        const {userId} = await auth();
        if(!userId) {
           return NextResponse.json({message: "Unauthorized"}, {status: 401})
        } 

        const topicWithTask = await db.query.Topic.findMany({ 
            where: and(eq(Topic.user_id, userId)),
            with: {
                tasks: true
            }
        })

        console.log('topic with task is ' , JSON.stringify(topicWithTask, null, 2))

        return NextResponse.json(topicWithTask, {status: 200})
    } catch(error) {
        console.log(error)
        return NextResponse.json({message: "Server error"}, {status: 500})
    }
}
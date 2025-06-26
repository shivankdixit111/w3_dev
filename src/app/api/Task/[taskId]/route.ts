import { db } from "@/db/db";
import { Task, Topic } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server"

export async function PUT(req: NextRequest) {
    try {
        const {userId} = await auth();
        if(!userId) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401})
        } 
        const { topicId, taskId, completedStatus, taskContent, type} = await req.json();
        if(!topicId || !taskId) {
            return NextResponse.json({message: "Missing topicId or taskId"}, {status: 400})
        } 

        const topic = await db.query.Topic.findFirst({
            where: and(eq(Topic.user_id, userId), eq(Topic.id, topicId))
        })
        if(!topic) {
            return NextResponse.json({message: "Topic does not exist"}, {status: 404})
        }
 
        //--------------- Edit ------------ //
        
        if(type==="taskContentEdit") { 
            await db.update(Task).set({title: taskContent}).
                where(and(eq(Task.id, taskId), eq(Task.topic_id, topicId))
            ) 

        } else if(type === "completedStatusEdit") { 
            await db.update(Task).set({completed: completedStatus}).
                where(and(eq(Task.id, taskId), eq(Task.topic_id, topicId))
            )
        } else {
            return NextResponse.json({message: "Invalid Edit Type"}, {status: 400})
        }

        return NextResponse.json({message: "Data updated successfully"}, {status: 200})
    } catch(error) {
        console.log("Update errors are : ", error)
        return NextResponse.json({message: "Server error"}, {status: 500})
    }
}

export async function DELETE(req: NextRequest) {
    try { 
        const {userId} = await auth();
        if(!userId) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401})
        } 
        const {topicId, taskId} = await req.json(); 
        if(!topicId || !taskId) {
            return NextResponse.json({message: "Missing topicId or taskId"}, {status: 400})
        }
        await db.delete(Task).where(and(eq(Task.id, taskId), eq(Task.topic_id, topicId)))

        return NextResponse.json({message: "Data deleted successfully"}, {status: 200}) 
    } catch(error) {
        console.log("Delete errors are : ", error)
        return NextResponse.json({message: "Server error"}, {status: 500})
    }
}
import { db } from '@/db/db';
import { User } from '@/db/schema';
import { WebhookEvent } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse} from 'next/server'
import { Webhook } from 'svix'

export async function POST(req: NextRequest) {
    try {
      const secret = process.env.WEBHOOK_SECRET!
      const headerPayload = req.headers;
      const svix_id = headerPayload.get("svix-id");
      const svix_timestamp = headerPayload.get("svix-timestamp");
      const svix_signature = headerPayload.get("svix-signature");
      
      if(!svix_id  ||  !svix_signature  ||  !svix_timestamp) {
        return NextResponse.json({message: "Missing svix headers"}, {status: 400})
      }
      
      const payload = await req.text();
      const header = {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature
      }
   
      const wh = new Webhook(secret)
      const evt = wh.verify(payload, header) as WebhookEvent

      const eventType = evt.type;
      if(eventType === "user.created" ||  eventType === "user.updated") {
        const { email_addresses, first_name, last_name, id } = evt.data;
        const email = email_addresses[0].email_address;
        const fullname = first_name + " " + last_name;
        const existingUser = await db.query.User.findFirst({where: eq(User.id, id)})
        let user;
        if(existingUser) {
            //update
            user = await db.update(User).set({ 
                username: fullname,
                email
            }).where(eq(User.id, id))
        } else {
            user = await db.insert(User).values({
                id,
                username: fullname,
                email
            })
        }
        return NextResponse.json(user, {status: 200})
      }
      return NextResponse.json({message: "Event Type ignored"}, {status: 200})
    } catch(error) {
        console.log(error)
        return NextResponse.json({message: error}, {status: 500})
    }
}
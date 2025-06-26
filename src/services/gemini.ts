import { GoogleGenerativeAI } from '@google/generative-ai'
import 'dotenv/config'

export async function generateTasks(topic: string) { 
    //model -> prompt -> content
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({model: "gemini-2.0-flash"})
    const prompt = `Generate a list of 5 concise, actionable tasks to learn about ${topic}. Return only the tasks, no numbering or formatting.`;
    const result = await model.generateContent(prompt)
    const tasks = result.response.text().split('\n').filter((task: string)=> task.trim()!="")
 
    return tasks; 
}
 
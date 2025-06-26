import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import cuid from "cuid";
import { relations } from "drizzle-orm";

export const User = pgTable("users", {
    id: varchar({ length: 255 }).primaryKey(),
    username: varchar({ length: 255 }),
    email: varchar({ length: 255 }).unique(),
});

export const Topic = pgTable("topics", {
    id: varchar({ length: 255 }).primaryKey().$default(() => cuid()),
    title: varchar({ length: 255 }),
    user_id: varchar({ length: 255 }).references(() => User.id), // Foreign key
    created_at: timestamp().defaultNow(),
});

export const Task = pgTable("tasks", {
    id: varchar({ length: 255 }).primaryKey().$defaultFn(() => cuid()),
    title: varchar({ length: 255 }),
    topic_id: varchar({ length: 255 }).references(() => Topic.id), // Foreign key
    created_at: timestamp().defaultNow(),
    completed: boolean().default(false),
});

export const userRelations = relations(User, ({ many })=> ({
    topics: many(Topic, {
        relationName: "user_topics"
    })
}))

export const topicRelations = relations(Topic, ({ many, one })=> ({
    tasks: many(Task, {
        relationName: "topic_tasks",  // Crucial: unique relation name
    }),
    user: one(User, {
        fields: [Topic.user_id],
        references: [User.id],
        relationName: "user_topics"
    })
}))

export const taskRelations = relations(Task, ({ one })=> ({
    user: one(Topic, {
        fields: [Task.topic_id],
        references: [Topic.id],
        relationName: "topic_tasks",  // Must match above
    })
}))

export const schema = {
    User,
    Topic,
    Task,
    userRelations,
    topicRelations,
    taskRelations
}
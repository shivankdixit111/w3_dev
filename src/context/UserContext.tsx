'use client'

import { Task } from '@/db/schema'
import { useAuth, useClerk } from '@clerk/nextjs'
import { InferSelectModel } from 'drizzle-orm'
import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react' 


type taskType = InferSelectModel<typeof Task>
type topicType = {
   id: string,
   title: string,
   user_id: string,
   created_at: string,
   tasks: taskType[],
}
export type userDataContextType = {
      setRefresh: Dispatch<SetStateAction<boolean>>
      topics: topicType[],
      authorizationToken: string,
      setAuthorizationToken: (val: string)=> void,
      loading: boolean,
      setLoading: (val: boolean)=> void,
}


export const userDataContext = createContext<userDataContextType | undefined>(undefined)

const UserContext = ({children}: {children: ReactNode}) => {
  const [refresh, setRefresh] = useState<boolean>(false)
  const [topics, setTopics] = useState<Array<topicType>>([])
  const [authorizationToken, setAuthorizationToken] = useState<string>("") 
  const [loading, setLoading] = useState<boolean>(false) 
  const { user } = useClerk();
  const { getToken } = useAuth();

  useEffect(()=> {
   if(!user) return;
   async function setToken() {
      const token = await getToken();
      setAuthorizationToken(token!);
      setRefresh(prev=> !prev);
   }
   setToken(); 
  },[user])

  useEffect(()=> {
      async function getData() {
         try {  
            const response = await fetch("/api/Topic", {
               method: "GET", 
               headers: {
                  'Authorization': "Bearer " + authorizationToken,
               }
            })

            const data = await response.json();
            console.log('data is ', data)
            if(response.ok) {
               setTopics(data)
            }
         } catch(error) {
            console.log(error)
         } finally {
            setLoading(false)
         }
      }
      getData();
  }, [refresh])

  return (
      <userDataContext.Provider value={{ setRefresh, topics, loading, setLoading, setAuthorizationToken, authorizationToken }}>
         {children}
      </userDataContext.Provider>
  )
}

export default UserContext

export const useUserData = ()=> { 
      const context = useContext(userDataContext);
      if(context===undefined) {
         throw new Error("Context cannnot be undefined")
      }
      return context; 
}
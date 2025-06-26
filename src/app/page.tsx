'use client'

import Loader from '@/components/Loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserData } from '@/context/UserContext'
import React, { FormEvent, useState } from 'react'

const Page = () => {
  const [topic, setTopic] = useState<string>("")
  const {loading, setLoading, authorizationToken, setRefresh} = useUserData();
  if(loading) {
    return <Loader />
  }

  const handleSubmit = async(e: FormEvent)=> {
      e.preventDefault();
      setLoading(true)
      const res = await fetch('/api/Topic', {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${authorizationToken}`
        },
        body: JSON.stringify({title: topic})
      })
      const data = await res.json();
      console.log(data)
      if(res.ok) {
        alert('tasks generated')
      } else {
        alert(data.message)
      }
      setTopic("")
      if(res.ok) setRefresh(prev=> !prev) 
  }
  return (
    <form onSubmit={handleSubmit} className='w-[50%] h-30 bg-white shadow-md shadow-gray-200 rounded p-3 mt-2 mx-auto flex items-center gap-2'>
        <Input 
          type="text" 
          value = {topic}
          onChange={(e)=> setTopic(e.target.value)}
          placeholder='Write the topic' 
        />
        <div className='cursor-pointer'>
          <Button variant='default'>Generate Tasks</Button>
        </div>
    </form>
  )
}

export default Page
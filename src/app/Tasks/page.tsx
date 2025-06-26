'use client'

import Loader from '@/components/Loader';
import { useUserData } from '@/context/UserContext'
import React, {useState } from 'react'
import { FaChevronRight } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";

const Page = () => {
  const { topics, loading, authorizationToken, setLoading, setRefresh } = useUserData(); 
  const [displayTasks, setDisplayTasks] = useState<boolean>(false)
  const [displayTaskId, setDisplayTaskId] = useState<string>("")
  const [editTaskContent, setEditTaskContent] = useState<string>("")
  const [editTaskId, setEditTaskId] = useState<string>("")

  if(loading) {
    return <Loader />
  } 
  /** ------------------------------------- Content Edit ------------------------------------------------ **/
  const handleEdit = async(topicId: string)=> {
      try {
          setLoading(true)
          const response = await fetch(`/api/Task/${editTaskId}`, {
            method: "PUT",
            headers: {
              'Authorization': `Bearer ${authorizationToken}`
            },
            body: JSON.stringify({type: "taskContentEdit", topicId, taskId:editTaskId, taskContent: editTaskContent})
          })
          const data = await response.json();  
          if(response.ok) {
            setRefresh(prev=> !prev)
          }
          alert(data.message)  
      } catch(error) {
          console.log(error)
      }  

        setEditTaskContent("")
        setEditTaskId("")
  }

  /** ------------------------------------- ToggleDone ------------------------------------------------ **/
  const handleToggle = async(topicId: string, taskId: string, completedStatus: boolean)=>{
    try {
      setLoading(true)
      const response = await fetch(`/api/Task/${taskId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${authorizationToken}`
        },
        body: JSON.stringify({type: "completedStatusEdit",  topicId, taskId, completedStatus})
      })
      const data = await response.json();  
      if(response.ok) {
        // setRefresh(prev=> !prev)
      }
      alert(data.message) 
    } catch(error) {
      console.log(error)
    }
  }
  
    /** ------------------------------------- Delete ------------------------------------------------ **/
  const handleDelete = async(topicId: string, taskId: string)=>{
    try {
      setLoading(true)
      const response = await fetch(`/api/Task/${taskId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${authorizationToken}`
        },
        body: JSON.stringify({method: "delete",  topicId, taskId})
      })
      const data = await response.json();  
      if(response.ok) {
        setRefresh(prev=> !prev)
      }
      alert(data.message) 
    } catch(error) {
      console.log(error)
    } 
  } 

  return (
    <>
    {topics.length ? 
      <div> 
        <h1 className='font-extrabold text-2xl text-center m-4'>Your Topics with Tasks 📝</h1>
        <div className='flex flex-col gap-2 mt-4'>
            {topics.map((topic, idx)=> (
                <div key={idx} className='relative w-[90%] bg-orange-300 rounded mx-auto p-2'>
                    <div className='flex justify-between mb-2 cursor-pointer' onClick={()=> {setDisplayTasks(prev=> !prev); setDisplayTaskId(topic.id)}}>
                        <div className='flex items-center gap-2 ml-2'>
                          <p className='font-bold'> { (displayTasks && displayTaskId===topic.id) ? <IoIosArrowDown /> :  <FaChevronRight />} </p>
                          <h2 className='text-lg first-letter:uppercase'>{topic.title}</h2>  
                        </div>
                        <div className='flex gap-2 items-center mr-2'>
                          <div className='h-2 w-25 bg-white rounded'>
                            <div className='h-2 bg-red-400 rounded' style={{width:`${((topic.tasks.filter((task)=> task.completed===true).length)/topic.tasks.length)*100}%`}}></div>
                          </div>
                          <h2 className='text-sm font-semibold'>{(topic.tasks.filter((task)=> task.completed===true).length)} / {topic.tasks.length}</h2>
                        </div>
                    </div>
                    {
                      (displayTasks && displayTaskId===topic.id) ? 
                      topic.tasks.map((task, idx)=> (
                        <div key={idx} className='flex justify-between p-2 bg-green-300 mb-2 rounded'>
                            {
                              editTaskId==task.id ?
                              <input 
                                  type="text" 
                                  value={editTaskContent}
                                  onChange={(e)=> setEditTaskContent(e.target.value)}
                                  className='w-[70%] ml-2 border-black border-1 focus:border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 pl-2'
                              />
                              : 
                              <span className={`pl-2 ${task.completed ? "line-through text-gray-500": ""}`}>{task.title} </span>
                            }
                            <div className='flex gap-5 mr-2'>
                                {editTaskId==task.id ?
                                  <p className='cursor-pointer' onClick={()=> handleEdit(topic.id)}> 📁 </p> :
                                  <p className='cursor-pointer' onClick={()=> {setEditTaskContent(task.title!); setEditTaskId(task.id)}}> ✍️ </p>
                                } 
                                <p className='cursor-pointer' onClick={()=> handleToggle(topic.id, task.id, !task.completed)}>{task.completed ? "❎" : "✅"}</p>
                                <p className='cursor-pointer' onClick={()=> handleDelete(topic.id, task.id)}>❌</p>
                            </div>
                        </div> 
                      ))
                      : ""
                    }
                </div>
            ))}
        </div>
      </div>
      : 
      <div className='text-5xl font-extrabold absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'>No Topics📝 Found</div>
    }
    </>
  )
}

export default Page
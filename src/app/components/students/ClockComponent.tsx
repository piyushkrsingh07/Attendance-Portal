import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'

const ClockComponentInner = () => {
    const [time,setTime]=useState(new Date())

    useEffect(()=>{
   const intervalId=setInterval(()=>{
          setTime(new Date())
       },1000)

return ()=>clearInterval(intervalId)
    },[])
  return (
         <p className="text-2xl">
                    {format(time, "HH:mm:ss")}
                      </p>
  )
}

const ClockComponent=React.memo(ClockComponentInner)
export default ClockComponent
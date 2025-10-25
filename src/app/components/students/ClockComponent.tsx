import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'

const ClockComponent = React.memo(() => {
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
})

export default ClockComponent
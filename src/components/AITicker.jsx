import { useEffect, useState } from "react";

const messages = [
"AI detected revenue opportunity in Google Ads",
"Forecast confidence recalculated",
"Pipeline probability adjusted",
"New attribution pattern detected",
"Market signals updated",
];

export default function AITicker() {
  const [msg,setMsg]=useState(messages[0]);

  useEffect(()=>{
    const id=setInterval(()=>{
      const m=messages[Math.floor(Math.random()*messages.length)];
      setMsg(m);
    },4000);
    return()=>clearInterval(id);
  },[]);

  return(
    <div style={{
      padding:"8px 14px",
      borderRadius:12,
      fontSize:12,
      background:"rgba(124,92,255,.15)",
      border:"1px solid rgba(124,92,255,.35)"
    }}>
       {msg}
    </div>
  );
}
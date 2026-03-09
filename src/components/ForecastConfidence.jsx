export default function ForecastConfidence({score}){

const pct=Math.min(100,Math.max(0,score));

return(
<div style={{marginTop:14}}>

<div style={{fontSize:12,opacity:.7}}>
Forecast Confidence
</div>

<div style={{
height:10,
borderRadius:999,
background:"rgba(255,255,255,.08)",
overflow:"hidden",
marginTop:6
}}>
<div style={{
height:"100%",
width:`${pct}%`,
background:"linear-gradient(90deg,#22c55e,#38bdf8)"
}}/>
</div>

</div>
)
}
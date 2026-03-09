export default function RevenueHeatmap(){

const regions=[
{region:"North America",rev:72},
{region:"Europe",rev:44},
{region:"Asia",rev:38},
{region:"LATAM",rev:21}
];

return(

<div style={{marginTop:18}}>

<div style={{fontWeight:800,marginBottom:10}}>
Global Revenue Signals
</div>

{regions.map(r=>(
<div key={r.region}
style={{
display:"flex",
justifyContent:"space-between",
marginBottom:8
}}>
<span>{r.region}</span>
<span>{r.rev}%</span>
</div>
))}

</div>

)
}
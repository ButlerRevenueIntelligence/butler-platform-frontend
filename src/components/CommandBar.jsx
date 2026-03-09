export default function CommandBar() {

return(
<div style={{
display:"flex",
gap:12,
marginBottom:20
}}>

<button className="cmd">Generate Board Report</button>
<button className="cmd">Run AI Analysis</button>
<button className="cmd">Simulate Forecast</button>
<button className="cmd">Export Revenue Model</button>

<style>
{`
.cmd{
padding:10px 16px;
border-radius:999px;
border:1px solid rgba(255,255,255,.12);
background:rgba(255,255,255,.05);
cursor:pointer;
font-weight:700;
}
.cmd:hover{
background:rgba(124,92,255,.2);
}
`}
</style>

</div>
);
}
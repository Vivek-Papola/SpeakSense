function ProgressChart({ points = [] , height = 40, width = 300 }){
  if (!points || points.length === 0) return <div style={{color:'var(--muted)'}}>No data</div>
  const max = Math.max(...points)
  const min = Math.min(...points)
  const path = points.map((v,i)=>{
    const x = (i/(points.length-1||1))*width
    const y = height - ((v - min)/(max - min || 1))*height
    return `${i===0?'M':'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ')
  const gradientId = `g_${Math.random().toString(36).slice(2,8)}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill={`url(#${gradientId})`} opacity="0.08" />
      <path d={path} fill="none" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default ProgressChart

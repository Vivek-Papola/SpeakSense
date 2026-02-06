function BarChart({ labels = [], values = [], width = 320, height = 120 }){
  if (!values || values.length === 0) return <div style={{color:'var(--muted)'}}>No data</div>
  const max = Math.max(...values)
  const barWidth = width / values.length
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {values.map((v,i)=>{
        const h = (v / (max || 1)) * (height - 24)
        const x = i * barWidth + 6
        const y = height - h - 16
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth - 12} height={h} rx={6} fill={i % 2 === 0 ? 'var(--accent)' : 'var(--accent-2)'} opacity="0.9" />
            <text x={x + (barWidth-12)/2} y={height - 4} fontSize="10" fill="var(--muted)" textAnchor="middle">{labels[i] || ''}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default BarChart

import { useEffect, useRef, useState } from 'react'
import { getRecording } from '../utils/idb'

function RecordingPlayer({ id }){
  const [url, setUrl] = useState(null)
  const audioRef = useRef(null)

  useEffect(()=>{
    let canceled=false
    const load = async ()=>{
      const rec = await getRecording(id)
      if (rec && rec.blob && !canceled){
        const u = URL.createObjectURL(rec.blob)
        setUrl(u)
      }
    }
    load()
    return ()=>{
      canceled=true
      if (url) URL.revokeObjectURL(url)
    }
  }, [id])

  if (!url) return <div className="muted">loading...</div>
  return <audio ref={audioRef} controls src={url} />
}

export default RecordingPlayer

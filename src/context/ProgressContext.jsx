import React, { createContext, useState, useEffect } from 'react'

const ProgressContext = createContext({ history: [], savePractice: () => {} })

export function ProgressProvider({ children }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const key = `practice_history_${user.email || 'default'}`
      const saved = localStorage.getItem(key)
      if (saved) setHistory(JSON.parse(saved))
    } catch (e) {
      setHistory([])
    }
  }, [])

  const savePractice = (entry) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const key = `practice_history_${user.email || 'default'}`
      const e = { id: Date.now(), date: new Date().toISOString(), ...entry }
      const updated = [e, ...history]
      setHistory(updated)
      localStorage.setItem(key, JSON.stringify(updated))
    } catch (e) {
      // ignore
    }
  }

  return (
    <ProgressContext.Provider value={{ history, savePractice }}>
      {children}
    </ProgressContext.Provider>
  )
}

export default ProgressContext

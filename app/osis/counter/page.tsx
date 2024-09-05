'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const UNDO_LIMIT = 500

interface Paslon {
  name: string;
  description: string;
  imageUrl: string;
}

interface VoteState {
  votes: number[];
  invalidVotes: number;
  isFinalized: boolean;
}

const paslonData: Paslon[] = [
  {
    name: "Karina & Mabel",
    description: "Paslon 1",
    imageUrl: "/Paslon1.jpg"
  },
  {
    name: "Abay & Diva",
    description: "Paslon 2",
    imageUrl: "/Paslon2.jpg"
  },
  {
    name: "Biel & Mayra",
    description: "Paslon 3",
    imageUrl: "/Paslon3.jpg"
  }
]

export default function CounterView() {
  const [voteState, setVoteState] = useState<VoteState>({ votes: [0, 0, 0], invalidVotes: 0, isFinalized: false })
  const [undoHistory, setUndoHistory] = useState<VoteState[]>([])
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  useEffect(() => {
    setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)())
  }, [])

  useEffect(() => {
    localStorage.setItem('voteState', JSON.stringify(voteState))
  }, [voteState])

  const playSound = useCallback(() => {
    if (audioContext) {
      const oscillator = audioContext.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // 440 Hz = A4 note
      oscillator.connect(audioContext.destination)
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1) // Stop after 0.1 seconds
    }
  }, [audioContext])

  const updateVoteState = useCallback((updater: (prevState: VoteState) => VoteState) => {
    setVoteState(prevState => {
      const newState = updater(prevState)
      setUndoHistory(prev => [prevState, ...prev].slice(0, UNDO_LIMIT))
      return newState
    })
  }, [playSound])

  const addVote = useCallback((index: number) => {
    updateVoteState(prevState => ({
      ...prevState,
      votes: prevState.votes.map((count, i) => i === index ? count + 1 : count)
    }))
  }, [updateVoteState])

  const addInvalidVote = useCallback(() => {
    updateVoteState(prevState => ({
      ...prevState,
      invalidVotes: prevState.invalidVotes + 1
    }))
  }, [updateVoteState])

  const undo = useCallback(() => {
    if (undoHistory.length > 0) {
      const [lastState, ...rest] = undoHistory
      setVoteState(lastState)
      setUndoHistory(rest)
      playSound()
    }
  }, [undoHistory, playSound])
  const finalizeResults = useCallback(() => {
    setVoteState(prevState => ({
      ...prevState,
      isFinalized: true
    }))
    playSound()
  }, [playSound])
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase()
    if (['1', '2', '3'].includes(key)) {
      addVote(parseInt(key) - 1)
    } else if (key === 'z') {
      undo()
    } else if (key === '0') {
      addInvalidVote()
    } else if (key === 'f') {
      finalizeResults()
    }
  }, [addVote, undo, addInvalidVote, finalizeResults])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const totalVotes = voteState.votes.reduce((sum, count) => sum + count, 0) + voteState.invalidVotes

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Vote Counter</h1>
        <Card className="bg-white mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-center">{totalVotes}</p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {paslonData.map((paslon, index) => (
            <Card key={index} className="flex flex-col bg-white">
              <CardHeader>
                <div className="w-full aspect-square relative mb-4">
                  <Image
                    src={paslon.imageUrl}
                    alt={`Image of ${paslon.name}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
                <CardTitle className="text-xl mb-2">{paslon.name}</CardTitle>
                <CardDescription>{paslon.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <div className="flex flex-col items-center">
                  <p className="text-4xl font-bold mb-4 ">{voteState.votes[index]}</p>
                  <Button onClick={() => addVote(index)} className="w-full" disabled={voteState.isFinalized}>
                    Vote ({index + 1})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-white mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Invalid Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold mb-4 text-center">{voteState.invalidVotes}</p>
            <Button onClick={addInvalidVote} className="w-full" variant="outline" disabled={voteState.isFinalized}>
              Invalid Vote (0)
            </Button>
          </CardContent>
        </Card>
        <Button onClick={undo} className="mt-6 w-full" disabled={voteState.isFinalized}>
          Undo (Z)
        </Button>
        <Button onClick={finalizeResults} className="mt-4 w-full" disabled={voteState.isFinalized}>
          Finalize Results (F)
        </Button>
        <p className="mt-4 text-center text-gray-600">
          Press 1, 2, or 3 to vote for a Paslon, 0 for an invalid vote, Z to undo, or F to finalize results.
        </p>
        {voteState.isFinalized && (
          <p className="mt-4 text-center text-red-600 font-bold">
            Results have been finalized. No further changes can be made.
          </p>
        )}
      </div>
    </div>
  )
}
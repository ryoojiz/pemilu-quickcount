'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Confetti from 'react-confetti'

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

  export default function PublicView() {
    const [voteState, setVoteState] = useState<VoteState>({ votes: [0, 0, 0], invalidVotes: 0, isFinalized: false })
    const [showConfetti, setShowConfetti] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)
  
    useEffect(() => {
      const updateVotes = () => {
        const storedVoteState = localStorage.getItem('voteState')
        if (storedVoteState) {
          const newVoteState = JSON.parse(storedVoteState)
          setVoteState(prevState => {
            if (!prevState.isFinalized && newVoteState.isFinalized) {
              setShowConfetti(true)
              if (audioRef.current) {
                audioRef.current.play()
              }
              setTimeout(() => setShowConfetti(false), 10000) // Stop confetti after 10 seconds
            }
            return newVoteState
          })
        }
      }
  
      updateVotes()
      const interval = setInterval(updateVotes, 250) // Update every second
  
      return () => clearInterval(interval)
    }, [])
  
    const totalVotes = voteState.votes.reduce((sum, count) => sum + count, 0) + voteState.invalidVotes
  

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Public Vote Display</h1>
        <Card className="bg-white mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalVotes}</p>
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
                  <p className="text-4xl font-bold">{voteState.votes[index]}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Tidak Sah</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{voteState.invalidVotes}</p>
          </CardContent>
        </Card>
      </div>
      {showConfetti && <Confetti />}
      <audio ref={audioRef} src="/applause.mp3"/>
    </div>
  )
}
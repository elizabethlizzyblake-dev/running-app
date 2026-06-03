"use client"

import { useState } from "react"
import { BottomNav, AdminNav } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { runTypes } from "@/lib/mock-data"
import { Footprints, Calendar, Clock, Route, MessageSquare, Sparkles, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LogRunPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    distance: "",
    hours: "",
    minutes: "",
    seconds: "",
    type: "easy",
    notes: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        date: new Date().toISOString().split("T")[0],
        distance: "",
        hours: "",
        minutes: "",
        seconds: "",
        type: "easy",
        notes: ""
      })
    }, 2000)
  }

  const calculatePace = () => {
    const distance = parseFloat(formData.distance)
    const totalMinutes = 
      (parseInt(formData.hours) || 0) * 60 + 
      (parseInt(formData.minutes) || 0) + 
      (parseInt(formData.seconds) || 0) / 60
    
    if (distance > 0 && totalMinutes > 0) {
      const pace = totalMinutes / distance
      const paceMin = Math.floor(pace)
      const paceSec = Math.round((pace - paceMin) * 60)
      return `${paceMin}:${paceSec.toString().padStart(2, "0")} /km`
    }
    return "--:-- /km"
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 bg-card border-border text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Run Logged! 🎉</h2>
          <p className="text-muted-foreground">
            Great job getting out there! Every run counts.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AdminNav />
      
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Footprints className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Log a Run</h1>
            <p className="text-sm text-muted-foreground">Record your achievement</p>
          </div>
        </div>
      </header>

      <main className="px-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <Card className="p-4 bg-card border-border">
            <Label htmlFor="date" className="flex items-center gap-2 text-foreground mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-input border-border text-foreground min-h-[44px]"
              required
            />
          </Card>

          {/* Distance */}
          <Card className="p-4 bg-card border-border">
            <Label htmlFor="distance" className="flex items-center gap-2 text-foreground mb-2">
              <Route className="w-4 h-4 text-muted-foreground" />
              Distance (km)
            </Label>
            <Input
              id="distance"
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 5.0"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              className="bg-input border-border text-foreground min-h-[44px] text-lg"
              required
            />
          </Card>

          {/* Duration */}
          <Card className="p-4 bg-card border-border">
            <Label className="flex items-center gap-2 text-foreground mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Duration
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  placeholder="0"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  className="bg-input border-border text-foreground min-h-[44px] text-center"
                />
                <p className="text-xs text-muted-foreground text-center mt-1">Hours</p>
              </div>
              <div>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={formData.minutes}
                  onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                  className="bg-input border-border text-foreground min-h-[44px] text-center"
                  required
                />
                <p className="text-xs text-muted-foreground text-center mt-1">Minutes</p>
              </div>
              <div>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={formData.seconds}
                  onChange={(e) => setFormData({ ...formData, seconds: e.target.value })}
                  className="bg-input border-border text-foreground min-h-[44px] text-center"
                />
                <p className="text-xs text-muted-foreground text-center mt-1">Seconds</p>
              </div>
            </div>
            
            {/* Calculated Pace */}
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Calculated Pace</span>
              <span className="font-semibold text-primary">{calculatePace()}</span>
            </div>
          </Card>

          {/* Run Type */}
          <Card className="p-4 bg-card border-border">
            <Label className="flex items-center gap-2 text-foreground mb-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              Run Type
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="bg-input border-border text-foreground min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {runTypes.map((type) => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    className="text-popover-foreground"
                  >
                    <div>
                      <span className="font-medium">{type.label}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* Notes */}
          <Card className="p-4 bg-card border-border">
            <Label htmlFor="notes" className="flex items-center gap-2 text-foreground mb-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="How did it feel? Any highlights?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-input border-border text-foreground min-h-[100px] resize-none"
            />
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-[52px] text-lg font-semibold"
          >
            Log Run 🏃
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  )
}

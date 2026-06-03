"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, ArrowLeft, Target, Calendar, Award, TrendingUp, Check } from "lucide-react"

export default function AdminPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    badgeReward: "",
    targetMetric: "distance",
    targetValue: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        badgeReward: "",
        targetMetric: "distance",
        targetValue: ""
      })
    }, 2000)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 bg-card border-border text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Challenge Created! 🎯</h2>
          <p className="text-muted-foreground mb-4">
            Your new challenge is now live for members to join.
          </p>
          <Link href="/challenges">
            <Button variant="outline" className="border-border text-foreground">
              View Challenges
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link 
            href="/" 
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center min-w-[44px] min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Admin</h1>
            <p className="text-sm text-muted-foreground">Challenge Setter</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent" />
          </div>
        </div>
      </header>

      <main className="px-4">
        <Card className="p-4 bg-card border-border mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Create New Challenge</h2>
              <p className="text-xs text-muted-foreground">Motivate your running community</p>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <Card className="p-4 bg-card border-border">
            <Label htmlFor="title" className="text-foreground mb-2 block">
              Challenge Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. Summer Distance Challenge"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-input border-border text-foreground min-h-[44px]"
              required
            />
          </Card>

          {/* Description */}
          <Card className="p-4 bg-card border-border">
            <Label htmlFor="description" className="text-foreground mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the challenge and motivate participants..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-input border-border text-foreground min-h-[100px] resize-none"
              required
            />
          </Card>

          {/* Dates */}
          <Card className="p-4 bg-card border-border">
            <Label className="flex items-center gap-2 text-foreground mb-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Challenge Period
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startDate" className="text-xs text-muted-foreground mb-1 block">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-input border-border text-foreground min-h-[44px]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs text-muted-foreground mb-1 block">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-input border-border text-foreground min-h-[44px]"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Badge Reward */}
          <Card className="p-4 bg-card border-border">
            <Label htmlFor="badge" className="flex items-center gap-2 text-foreground mb-2">
              <Award className="w-4 h-4 text-accent" />
              Badge Reward Name
            </Label>
            <Input
              id="badge"
              placeholder="e.g. Summer Champion"
              value={formData.badgeReward}
              onChange={(e) => setFormData({ ...formData, badgeReward: e.target.value })}
              className="bg-input border-border text-foreground min-h-[44px]"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Members earn this badge upon completion
            </p>
          </Card>

          {/* Target */}
          <Card className="p-4 bg-card border-border">
            <Label className="flex items-center gap-2 text-foreground mb-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Target Goal
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Metric
                </Label>
                <Select 
                  value={formData.targetMetric} 
                  onValueChange={(value) => setFormData({ ...formData, targetMetric: value })}
                >
                  <SelectTrigger className="bg-input border-border text-foreground min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="distance" className="text-popover-foreground">Distance (km)</SelectItem>
                    <SelectItem value="runs" className="text-popover-foreground">Number of Runs</SelectItem>
                    <SelectItem value="streak" className="text-popover-foreground">Streak (days)</SelectItem>
                    <SelectItem value="pace" className="text-popover-foreground">Pace (min/km)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetValue" className="text-xs text-muted-foreground mb-1 block">
                  Target Value
                </Label>
                <Input
                  id="targetValue"
                  type="number"
                  min="1"
                  placeholder="e.g. 100"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  className="bg-input border-border text-foreground min-h-[44px]"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Preview */}
          {formData.title && (
            <Card className="p-4 bg-primary/10 border-primary/30">
              <p className="text-xs text-muted-foreground mb-2">Preview</p>
              <h3 className="font-semibold text-foreground">{formData.title}</h3>
              {formData.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{formData.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {formData.targetValue && (
                  <span>
                    Goal: {formData.targetValue} {formData.targetMetric === "distance" ? "km" : formData.targetMetric === "runs" ? "runs" : formData.targetMetric === "streak" ? "days" : "min/km"}
                  </span>
                )}
                {formData.badgeReward && (
                  <span className="text-accent">🏅 {formData.badgeReward}</span>
                )}
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-[52px] text-lg font-semibold"
          >
            Create Challenge 🎯
          </Button>
        </form>
      </main>
    </div>
  )
}

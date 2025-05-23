"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, X } from "lucide-react"

interface PlayAudioConfigProps {
  config: Record<string, any>
  onChange: (config: Record<string, any>) => void
}

export function PlayAudioConfig({ config, onChange }: PlayAudioConfigProps) {
  const [fileName, setFileName] = useState<string>(config.audioFileName || "")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onChange({
        audioFile: file,
        audioFileName: file.name,
      })
    }
  }

  const handleRemoveFile = () => {
    setFileName("")
    onChange({
      audioFile: null,
      audioFileName: "",
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="audio-file">Audio File</Label>

        {fileName ? (
          <div className="flex items-center justify-between p-2 border rounded-md">
            <span className="text-sm truncate max-w-[200px]">{fileName}</span>
            <Button variant="ghost" size="sm" onClick={handleRemoveFile} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input id="audio-file" type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
            <Button variant="outline" onClick={() => document.getElementById("audio-file")?.click()} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload Audio File
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-1">Supported formats: MP3, WAV, OGG (max 10MB)</p>
      </div>
    </div>
  )
}

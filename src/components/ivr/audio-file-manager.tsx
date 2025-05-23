"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { fileUploadService, type UploadedFile } from "./file-upload-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Upload, Trash2, Play, Pause, FileAudio } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AudioFileManager() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [playingFile, setPlayingFile] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load all files on component mount
    setFiles(fileUploadService.getAllFiles())

    // Create audio element for playback
    const audio = new Audio()
    setAudioElement(audio)

    // Clean up on unmount
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ""
      }
    }
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    const file = fileList[0]

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (mp3, wav, etc.)",
        variant: "destructive",
      })
      return
    }

    try {
      const uploadedFile = await fileUploadService.uploadFile(file)
      setFiles((prev) => [...prev, uploadedFile])

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded and is ready to use`,
      })

      setIsUploadDialogOpen(false)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteFile = (file: UploadedFile) => {
    setFileToDelete(file)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteFile = () => {
    if (!fileToDelete) return

    const success = fileUploadService.deleteFile(fileToDelete.id)

    if (success) {
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id))
      toast({
        title: "File deleted",
        description: `${fileToDelete.originalName} has been deleted`,
      })
    } else {
      toast({
        title: "Delete failed",
        description: "There was an error deleting the file",
        variant: "destructive",
      })
    }

    setIsDeleteDialogOpen(false)
    setFileToDelete(null)
  }

  const togglePlayFile = (fileId: string, fileUrl: string) => {
    if (!audioElement) return

    if (playingFile === fileId) {
      // Currently playing this file, so pause it
      audioElement.pause()
      setPlayingFile(null)
    } else {
      // Play a new file
      if (playingFile) {
        // Pause any currently playing file
        audioElement.pause()
      }

      audioElement.src = fileUrl
      audioElement.play()
      setPlayingFile(fileId)

      // Reset when playback ends
      audioElement.onended = () => {
        setPlayingFile(null)
      }
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Audio File Manager</span>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload Audio
          </Button>
        </CardTitle>
        <CardDescription>Manage audio files for your IVR system</CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileAudio className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No audio files uploaded yet</p>
            <p className="text-sm mt-2">Upload audio files to use in your IVR prompts</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.originalName}</TableCell>
                  <TableCell>{file.type.split("/")[1].toUpperCase()}</TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => togglePlayFile(file.id, file.url)}
                        title={playingFile === file.id ? "Pause" : "Play"}
                      >
                        {playingFile === file.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteFile(file)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Audio File</DialogTitle>
            <DialogDescription>
              Upload an audio file to use in your IVR system. Supported formats: MP3, WAV, OGG.
            </DialogDescription>
          </DialogHeader>
          <div className="grid w-full gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="audio-file">Audio File</Label>
              <Input id="audio-file" type="file" accept="audio/*" onChange={handleFileUpload} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the file "{fileToDelete?.originalName}". If this file is used in any IVR
              nodes, those references will be broken.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFile} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}


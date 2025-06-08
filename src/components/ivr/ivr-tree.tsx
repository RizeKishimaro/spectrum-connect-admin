
"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import Tree from "react-d3-tree"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/toaster"
import { nanoid } from "nanoid"
import {
  Phone,
  Play,
  KeyRound,
  Plus,
  Copy,
  Check,
  Edit,
  ZoomIn,
  ZoomOut,
  Maximize,
  Database,
  PhoneCall,
  PhoneOff,
  Clock,
  Music,
  MessageSquare,
  VolumeX,
  Volume2,
  Mic,
  MailQuestion,
  ArrowRight,
  Settings,
  FileText,
  Hash,
  TagIcon as Label,
  Trash2,
  Upload,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// --- Types ---
type DialplanAppCategory =
  | "Basic"
  | "Call Flow"
  | "Media"
  | "Advanced"
  | "Database"
  | "Voicemail"
  | "Conferencing"
  | "Queuing"

// Define all possible Asterisk Dialplan applications
type DialplanApplication =
  | "Answer"
  | "Hangup"
  | "Dial"
  | "Playback"
  | "Background"
  | "WaitExten"
  | "Goto"
  | "GotoIf"
  | "Set"
  | "NoOp"
  | "Verbose"
  | "SayDigits"
  | "SayNumber"
  | "SayAlpha"
  | "SayPhonetic"
  | "SayDateTime"
  | "Wait"
  | "Record"
  | "Monitor"
  | "MixMonitor"
  | "StopMonitor"
  | "AGI"
  | "EAGI"
  | "DeadAGI"
  | "DBGet"
  | "DBPut"
  | "DBDel"
  | "VoiceMail"
  | "VoiceMailMain"
  | "VMAuthenticate"
  | "MeetMe"
  | "ConfBridge"
  | "Queue"
  | "AddQueueMember"
  | "RemoveQueueMember"
  | "Macro"
  | "MacroExten"
  | "MacroExit"
  | "ExecIf"
  | "TryExec"
  | "Read"
  | "SendDTMF"
  | "ChanSpy"
  | "Ringing"
  | "Progress"
  | "Transfer"
  | "DTMF"

// Define the updated IVRNode type
type IVRNode = {
  id: string
  name: string
  application: DialplanApplication
  parameters: Record<string, any>
  dtmfKey?: string
  insertDatabase?: boolean
  children?: IVRNode[]
}

// Define application metadata
type ApplicationMetadata = {
  category: DialplanAppCategory
  description: string
  parameters: {
    name: string
    type: "string" | "number" | "boolean" | "options" | "audio" | "extension" | "context" | "priority" | "variable"
    description: string
    required?: boolean
    options?: string[]
    default?: any
  }[]
  icon: React.ReactNode
}

// Convert IVRNode to D3 compatible format
const convertToD3Format = (node: IVRNode) => {
  return {
    name: node.name,
    id: node.id,
    application: node.application,
    parameters: node.parameters,
    dtmfKey: node.dtmfKey,
    insertDatabase: node.insertDatabase,
    children: node.children ? node.children.map(convertToD3Format) : [],
  }
}

export default function IVRTreeBuilder() {
  const applicationMetadata: Record<DialplanApplication, ApplicationMetadata> = useMemo(
    () => ({
      Answer: {
        category: "Basic",
        description: "Answer a channel if ringing",
        parameters: [],
        icon: <PhoneCall className="h-4 w-4 text-green-600" />,
      },
      Hangup: {
        category: "Basic",
        description: "Hang up the current channel",
        parameters: [
          {
            name: "cause",
            type: "number",
            description: "Hangup cause code",
            required: false,
          },
        ],
        icon: <PhoneOff className="h-4 w-4 text-red-600" />,
      },
      Dial: {
        category: "Call Flow",
        description: "Place a call and connect to the current channel",
        parameters: [
          {
            name: "technology",
            type: "string",
            description: "Technology to use (SIP, IAX2, etc.)",
            required: true,
          },
          {
            name: "destination",
            type: "string",
            description: "Destination to call",
            required: true,
          },
          {
            name: "timeout",
            type: "number",
            description: "Timeout in seconds",
            required: false,
            default: 30,
          },
          {
            name: "options",
            type: "string",
            description: "Dial options",
            required: false,
          },
        ],
        icon: <Phone className="h-4 w-4 text-blue-600" />,
      },
      Playback: {
        category: "Media",
        description: "Play a sound file",
        parameters: [
          {
            name: "filename",
            type: "audio",
            description: "Sound file to play",
            required: true,
          },
          {
            name: "options",
            type: "string",
            description: "Playback options",
            required: false,
          },
        ],
        icon: <Play className="h-4 w-4 text-green-600" />,
      },
      Background: {
        category: "Media",
        description: "Play a sound file while waiting for DTMF",
        parameters: [
          {
            name: "filename",
            type: "audio",
            description: "Sound file to play",
            required: true,
          },
          {
            name: "options",
            type: "string",
            description: "Background options",
            required: false,
          },
        ],
        icon: <Music className="h-4 w-4 text-purple-600" />,
      },
      WaitExten: {
        category: "Call Flow",
        description: "Wait for an extension to be entered",
        parameters: [
          {
            name: "timeout",
            type: "number",
            description: "Timeout in seconds",
            required: false,
            default: 10,
          },
          {
            name: "options",
            type: "string",
            description: "WaitExten options",
            required: false,
          },
        ],
        icon: <Clock className="h-4 w-4 text-yellow-600" />,
      },
      Goto: {
        category: "Call Flow",
        description: "Jump to a specific priority, extension, or context",
        parameters: [
          {
            name: "context",
            type: "context",
            description: "Context to jump to",
            required: false,
          },
          {
            name: "extension",
            type: "extension",
            description: "Extension to jump to",
            required: false,
          },
          {
            name: "priority",
            type: "priority",
            description: "Priority to jump to",
            required: true,
          },
        ],
        icon: <ArrowRight className="h-4 w-4 text-blue-600" />,
      },
      GotoIf: {
        category: "Call Flow",
        description: "Conditional goto",
        parameters: [
          {
            name: "condition",
            type: "string",
            description: "Condition to evaluate",
            required: true,
          },
          {
            name: "destination_true",
            type: "string",
            description: "Destination if true",
            required: true,
          },
          {
            name: "destination_false",
            type: "string",
            description: "Destination if false",
            required: false,
          },
        ],
        icon: <ArrowRight className="h-4 w-4 text-orange-600" />,
      },
      Set: {
        category: "Advanced",
        description: "Set a channel variable",
        parameters: [
          {
            name: "variable",
            type: "variable",
            description: "Variable name",
            required: true,
          },
          {
            name: "value",
            type: "string",
            description: "Value to set",
            required: true,
          },
        ],
        icon: <Settings className="h-4 w-4 text-gray-600" />,
      },
      NoOp: {
        category: "Advanced",
        description: "No operation, useful for debugging",
        parameters: [
          {
            name: "text",
            type: "string",
            description: "Text to log",
            required: false,
          },
        ],
        icon: <FileText className="h-4 w-4 text-gray-600" />,
      },
      Verbose: {
        category: "Advanced",
        description: "Send text to verbose output",
        parameters: [
          {
            name: "level",
            type: "number",
            description: "Verbose level",
            required: true,
          },
          {
            name: "message",
            type: "string",
            description: "Message to output",
            required: true,
          },
        ],
        icon: <FileText className="h-4 w-4 text-gray-600" />,
      },
      SayDigits: {
        category: "Media",
        description: "Say digits",
        parameters: [
          {
            name: "digits",
            type: "string",
            description: "Digits to say",
            required: true,
          },
        ],
        icon: <Hash className="h-4 w-4 text-blue-600" />,
      },
      SayNumber: {
        category: "Media",
        description: "Say number",
        parameters: [
          {
            name: "number",
            type: "string",
            description: "Number to say",
            required: true,
          },
        ],
        icon: <Hash className="h-4 w-4 text-blue-600" />,
      },
      SayAlpha: {
        category: "Media",
        description: "Say characters",
        parameters: [
          {
            name: "characters",
            type: "string",
            description: "Characters to say",
            required: true,
          },
        ],
        icon: <MessageSquare className="h-4 w-4 text-blue-600" />,
      },
      SayPhonetic: {
        category: "Media",
        description: "Say characters phonetically",
        parameters: [
          {
            name: "characters",
            type: "string",
            description: "Characters to say phonetically",
            required: true,
          },
        ],
        icon: <MessageSquare className="h-4 w-4 text-blue-600" />,
      },
      SayDateTime: {
        category: "Media",
        description: "Say date/time",
        parameters: [
          {
            name: "time",
            type: "string",
            description: "Time to say",
            required: true,
          },
          {
            name: "format",
            type: "string",
            description: "Format string",
            required: false,
          },
        ],
        icon: <Clock className="h-4 w-4 text-blue-600" />,
      },
      Wait: {
        category: "Call Flow",
        description: "Wait for a specified number of seconds",
        parameters: [
          {
            name: "seconds",
            type: "number",
            description: "Seconds to wait",
            required: true,
          },
        ],
        icon: <Clock className="h-4 w-4 text-yellow-600" />,
      },
      Record: {
        category: "Media",
        description: "Record to a file",
        parameters: [
          {
            name: "filename",
            type: "string",
            description: "File to record to",
            required: true,
          },
          {
            name: "format",
            type: "options",
            options: ["wav", "gsm", "wav49", "mp3"],
            description: "Format to record in",
            required: false,
            default: "wav",
          },
          {
            name: "timeout",
            type: "number",
            description: "Maximum record time in seconds",
            required: false,
            default: 60,
          },
          {
            name: "silence",
            type: "number",
            description: "Silence detection in seconds",
            required: false,
          },
        ],
        icon: <Mic className="h-4 w-4 text-red-600" />,
      },
      Monitor: {
        category: "Media",
        description: "Monitor a channel",
        parameters: [
          {
            name: "format",
            type: "options",
            options: ["wav", "gsm", "wav49", "mp3"],
            description: "Format to record in",
            required: false,
            default: "wav",
          },
          {
            name: "filename",
            type: "string",
            description: "File to record to",
            required: true,
          },
          {
            name: "options",
            type: "string",
            description: "Monitor options",
            required: false,
          },
        ],
        icon: <Mic className="h-4 w-4 text-red-600" />,
      },
      MixMonitor: {
        category: "Media",
        description: "Record a call and mix the audio",
        parameters: [
          {
            name: "filename",
            type: "string",
            description: "File to record to",
            required: true,
          },
          {
            name: "options",
            type: "string",
            description: "MixMonitor options",
            required: false,
          },
        ],
        icon: <Mic className="h-4 w-4 text-red-600" />,
      },
      StopMonitor: {
        category: "Media",
        description: "Stop monitoring a channel",
        parameters: [],
        icon: <VolumeX className="h-4 w-4 text-red-600" />,
      },
      AGI: {
        category: "Advanced",
        description: "Execute an AGI script",
        parameters: [
          {
            name: "script",
            type: "string",
            description: "Script to execute",
            required: true,
          },
          {
            name: "args",
            type: "string",
            description: "Arguments to pass",
            required: false,
          },
        ],
        icon: <Settings className="h-4 w-4 text-purple-600" />,
      },
      EAGI: {
        category: "Advanced",
        description: "Execute an EAGI script",
        parameters: [
          {
            name: "script",
            type: "string",
            description: "Script to execute",
            required: true,
          },
          {
            name: "args",
            type: "string",
            description: "Arguments to pass",
            required: false,
          },
        ],
        icon: <Settings className="h-4 w-4 text-purple-600" />,
      },
      DeadAGI: {
        category: "Advanced",
        description: "Execute a DeadAGI script",
        parameters: [
          {
            name: "script",
            type: "string",
            description: "Script to execute",
            required: true,
          },
          {
            name: "args",
            type: "string",
            description: "Arguments to pass",
            required: false,
          },
        ],
        icon: <Settings className="h-4 w-4 text-purple-600" />,
      },
      DBGet: {
        category: "Database",
        description: "Retrieve a value from the Asterisk database",
        parameters: [
          {
            name: "family",
            type: "string",
            description: "Database family",
            required: true,
          },
          {
            name: "key",
            type: "string",
            description: "Database key",
            required: true,
          },
          {
            name: "variable",
            type: "variable",
            description: "Variable to store result",
            required: true,
          },
        ],
        icon: <Database className="h-4 w-4 text-blue-600" />,
      },
      DBPut: {
        category: "Database",
        description: "Store a value in the Asterisk database",
        parameters: [
          {
            name: "family",
            type: "string",
            description: "Database family",
            required: true,
          },
          {
            name: "key",
            type: "string",
            description: "Database key",
            required: true,
          },
          {
            name: "value",
            type: "string",
            description: "Value to store",
            required: true,
          },
        ],
        icon: <Database className="h-4 w-4 text-green-600" />,
      },
      DBDel: {
        category: "Database",
        description: "Delete a value from the Asterisk database",
        parameters: [
          {
            name: "family",
            type: "string",
            description: "Database family",
            required: true,
          },
          {
            name: "key",
            type: "string",
            description: "Database key",
            required: true,
          },
        ],
        icon: <Database className="h-4 w-4 text-red-600" />,
      },
      VoiceMail: {
        category: "Voicemail",
        description: "Leave a voicemail message",
        parameters: [
          {
            name: "mailbox",
            type: "string",
            description: "Mailbox to leave message in",
            required: true,
          },
          {
            name: "options",
            type: "string",
            description: "Voicemail options",
            required: false,
          },
        ],
        icon: <MessageSquare className="h-4 w-4 text-blue-600" />,
      },
      VoiceMailMain: {
        category: "Voicemail",
        description: "Enter the voicemail system",
        parameters: [
          {
            name: "mailbox",
            type: "string",
            description: "Mailbox to check",
            required: false,
          },
          {
            name: "options",
            type: "string",
            description: "Voicemail options",
            required: false,
          },
        ],
        icon: <MailQuestion className="h-4 w-4 text-blue-600" />,
      },
      VMAuthenticate: {
        category: "Voicemail",
        description: "Authenticate with voicemail",
        parameters: [
          {
            name: "mailbox",
            type: "string",
            description: "Mailbox to authenticate",
            required: false,
          },
          {
            name: "options",
            type: "string",
            description: "Authentication options",
            required: false,
          },
        ],
        icon: <MailQuestion className="h-4 w-4 text-green-600" />,
      },
      MeetMe: {
        category: "Conferencing",
        description: "MeetMe conference bridge",
        parameters: [
          {
            name: "confno",
            type: "string",
            description: "Conference number",
            required: true,
          },
          {
            name: "options",
            type: "string",
            description: "MeetMe options",
            required: false,
          },
          {
            name: "pin",
            type: "string",
            description: "PIN",
            required: false,
          },
        ],
        icon: <Volume2 className="h-4 w-4 text-purple-600" />,
      },
      ConfBridge: {
        category: "Conferencing",
        description: "Conference bridge",
        parameters: [
          {
            name: "confno",
            type: "string",
            description: "Conference number",
            required: true,
          },
          {
            name: "bridge_profile",
            type: "string",
            description: "Bridge profile",
            required: false,
          },
          {
            name: "user_profile",
            type: "string",
            description: "User profile",
            required: false,
          },
          {
            name: "menu",
            type: "string",
            description: "Menu name",
            required: false,
          },
        ],
        icon: <Volume2 className="h-4 w-4 text-purple-600" />,
      },
      Queue: {
        category: "Queuing",
        description: "Enter a queue",
        parameters: [
          {
            name: "queuename",
            type: "string",
            description: "Queue name",
            required: true,
          },
          {
            name: "options",
            type: "string",
            description: "Queue options",
            required: false,
          },
          {
            name: "url",
            type: "string",
            description: "URL for position announcements",
            required: false,
          },
          {
            name: "announceoverride",
            type: "string",
            description: "Announcement override",
            required: false,
          },
          {
            name: "timeout",
            type: "number",
            description: "Timeout in seconds",
            required: false,
          },
        ],
        icon: <Clock className="h-4 w-4 text-blue-600" />,
      },
      AddQueueMember: {
        category: "Queuing",
        description: "Add a queue member",
        parameters: [
          {
            name: "queuename",
            type: "string",
            description: "Queue name",
            required: true,
          },
          {
            name: "interface",
            type: "string",
            description: "Interface to add",
            required: true,
          },
          {
            name: "penalty",
            type: "number",
            description: "Penalty",
            required: false,
          },
          {
            name: "options",
            type: "string",
            description: "Options",
            required: false,
          },
          {
            name: "membername",
            type: "string",
            description: "Member name",
            required: false,
          },
        ],
        icon: <Plus className="h-4 w-4 text-blue-600" />,
      },
      RemoveQueueMember: {
        category: "Queuing",
        description: "Remove a queue member",
        parameters: [
          {
            name: "queuename",
            type: "string",
            description: "Queue name",
            required: true,
          },
          {
            name: "interface",
            type: "string",
            description: "Interface to remove",
            required: true,
          },
        ],
        icon: <PhoneOff className="h-4 w-4 text-red-600" />,
      },
      Macro: {
        category: "Advanced",
        description: "Execute a macro",
        parameters: [
          {
            name: "macroname",
            type: "string",
            description: "Macro name",
            required: true,
          },
          {
            name: "args",
            type: "string",
            description: "Arguments",
            required: false,
          },
        ],
        icon: <Settings className="h-4 w-4 text-orange-600" />,
      },
      MacroExten: {
        category: "Advanced",
        description: "Extension to jump to after macro",
        parameters: [],
        icon: <Settings className="h-4 w-4 text-orange-600" />,
      },
      MacroExit: {
        category: "Advanced",
        description: "Exit a macro",
        parameters: [],
        icon: <Settings className="h-4 w-4 text-orange-600" />,
      },
      ExecIf: {
        category: "Call Flow",
        description: "Conditionally execute an application",
        parameters: [
          {
            name: "condition",
            type: "string",
            description: "Condition to evaluate",
            required: true,
          },
          {
            name: "application",
            type: "string",
            description: "Application to execute if true",
            required: true,
          },
          {
            name: "else_application",
            type: "string",
            description: "Application to execute if false",
            required: false,
          },
        ],
        icon: <ArrowRight className="h-4 w-4 text-orange-600" />,
      },
      TryExec: {
        category: "Call Flow",
        description: "Try to execute an application",
        parameters: [
          {
            name: "application",
            type: "string",
            description: "Application to execute",
            required: true,
          },
        ],
        icon: <ArrowRight className="h-4 w-4 text-orange-600" />,
      },
      Read: {
        category: "Media",
        description: "Read DTMF digits",
        parameters: [
          {
            name: "variable",
            type: "variable",
            description: "Variable to store digits",
            required: true,
          },
          {
            name: "filename",
            type: "audio",
            description: "Prompt to play",
            required: false,
          },
          {
            name: "maxdigits",
            type: "number",
            description: "Maximum digits to read",
            required: false,
          },
          {
            name: "options",
            type: "string",
            description: "Read options",
            required: false,
          },
          {
            name: "timeout",
            type: "number",
            description: "Timeout in seconds",
            required: false,
          },
        ],
        icon: <KeyRound className="h-4 w-4 text-blue-600" />,
      },
      SendDTMF: {
        category: "Media",
        description: "Send DTMF digits",
        parameters: [
          {
            name: "digits",
            type: "string",
            description: "Digits to send",
            required: true,
          },
          {
            name: "timeout",
            type: "number",
            description: "Timeout between digits in ms",
            required: false,
          },
        ],
        icon: <KeyRound className="h-4 w-4 text-green-600" />,
      },
      ChanSpy: {
        category: "Advanced",
        description: "Listen to a channel",
        parameters: [
          {
            name: "channel",
            type: "string",
            description: "Channel to spy on",
            required: false,
          },
          {
            name: "options",
            type: "string",
            description: "ChanSpy options",
            required: false,
          },
        ],
        icon: <Volume2 className="h-4 w-4 text-red-600" />,
      },
      Ringing: {
        category: "Basic",
        description: "Indicate ringing",
        parameters: [],
        icon: <Phone className="h-4 w-4 text-yellow-600" />,
      },
      Progress: {
        category: "Basic",
        description: "Indicate progress",
        parameters: [],
        icon: <Phone className="h-4 w-4 text-yellow-600" />,
      },
      Transfer: {
        category: "Call Flow",
        description: "Transfer a call",
        parameters: [
          {
            name: "destination",
            type: "string",
            description: "Destination to transfer to",
            required: true,
          },
        ],
        icon: <Phone className="h-4 w-4 text-green-600" />,
      },
      DTMF: {
        category: "Media",
        description: "Handle DTMF input",
        parameters: [
          {
            name: "keys",
            type: "string",
            description: "DTMF keys to handle",
            required: true,
          },
        ],
        icon: <KeyRound className="h-4 w-4 text-blue-600" />,
      },
    }),
    [],
  )

  // Group applications by category
  const applicationsByCategory = useMemo(() => {
    const categories: Record<DialplanAppCategory, DialplanApplication[]> = {
      Basic: [],
      "Call Flow": [],
      Media: [],
      Advanced: [],
      Database: [],
      Voicemail: [],
      Conferencing: [],
      Queuing: [],
    }

    Object.entries(applicationMetadata).forEach(([app, metadata]) => {
      categories[metadata.category].push(app as DialplanApplication)
    })

    return categories
  }, [applicationMetadata])

  const [ivrTree, setIvrTree] = useState<IVRNode>({
    id: nanoid(),
    name: "Main IVR",
    application: "Answer",
    parameters: {},
    children: [
      {
        id: nanoid(),
        name: "Welcome Message",
        application: "Playback",
        parameters: {
          filename: "welcome",
        },
        children: [],
      },
    ],
  })

  // Tree navigation state
  const [translate, setTranslate] = useState({ x: 400, y: 80 })
  const [zoom, setZoom] = useState(1)

  // Add node state
  const [selectedNode, setSelectedNode] = useState<IVRNode | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [nodeName, setNodeName] = useState("")
  const [application, setApplication] = useState<DialplanApplication>("Playback")
  const [dtmfKey, setDtmfKey] = useState("")
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [insertDatabase, setInsertDatabase] = useState(false)
  const [activeCategory, setActiveCategory] = useState<DialplanAppCategory>("Basic")

  // Edit node state
  const [editingNode, setEditingNode] = useState<IVRNode | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editNodeName, setEditNodeName] = useState("")
  const [editApplication, setEditApplication] = useState<DialplanApplication>("Playback")
  const [editDtmfKey, setEditDtmfKey] = useState("")
  const [editParameters, setEditParameters] = useState<Record<string, any>>({})
  const [editInsertDatabase, setEditInsertDatabase] = useState(false)
  const [editActiveCategory, setEditActiveCategory] = useState<DialplanAppCategory>("Basic")

  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<IVRNode | null>(null)
  // Add this state to track the node currently being processed for deletion
  const [processingDeletion, setProcessingDeletion] = useState<string | null>(null)

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.2, 0.4))
  }

  const handleResetView = () => {
    setTranslate({ x: 400, y: 80 })
    setZoom(1)
  }

  // Handle parameter changes
  const handleParameterChange = (name: string, value: any) => {
    setParameters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditParameterChange = (name: string, value: any) => {
    setEditParameters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Reset parameters when application changes
  const handleApplicationChange = (newApplication: DialplanApplication) => {
    setApplication(newApplication)
    setParameters({})
  }

  const handleEditApplicationChange = (newApplication: DialplanApplication) => {
    setEditApplication(newApplication)

    // Initialize with default values
    const defaultParams: Record<string, any> = {}
    applicationMetadata[newApplication].parameters.forEach((param) => {
      if (param.default !== undefined) {
        defaultParams[param.name] = param.default
      }
    })

    setEditParameters(defaultParams)
  }

  // Add node functionality
  const handleAddNode = () => {
    if (!selectedNode || !nodeName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name for the node",
        variant: "destructive",
      })
      return
    }

    // Validate required parameters
    const missingParams = applicationMetadata[application].parameters
      .filter((param) => param.required && !parameters[param.name])
      .map((param) => param.name)

    if (missingParams.length > 0) {
      toast({
        title: "Missing parameters",
        description: `Please provide values for: ${missingParams.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    const newNode: IVRNode = {
      id: nanoid(),
      name: nodeName,
      application,
      parameters,
      dtmfKey: dtmfKey || undefined,
      insertDatabase,
      children: [],
    }

    const updatedTree = addNodeToTree(ivrTree, selectedNode.id, newNode)
    setIvrTree(updatedTree)
    setIsAddModalOpen(false)
    setNodeName("")
    setDtmfKey("")
    setParameters({})
    setInsertDatabase(false)

    toast({
      title: "Node added",
      description: `Added "${nodeName}" to "${selectedNode.name}"`,
    })
  }

  const addNodeToTree = (tree: IVRNode, parentId: string, newNode: IVRNode): IVRNode => {
    if (tree.id === parentId) {
      return {
        ...tree,
        children: [...(tree.children || []), newNode],
      }
    }
    return {
      ...tree,
      children: tree.children?.map((child) => addNodeToTree(child, parentId, newNode)) || [],
    }
  }

  // Edit node functionality
  const openEditModal = (node: IVRNode) => {
    setEditingNode(node)
    setEditNodeName(node.name)
    setEditApplication(node.application)
    setEditDtmfKey(node.dtmfKey || "")
    setEditParameters(node.parameters || {})
    setEditInsertDatabase(node.insertDatabase || false)
    setEditActiveCategory(applicationMetadata[node.application].category)
    setIsEditModalOpen(true)
  }

  const handleEditNode = () => {
    if (!editingNode || !editNodeName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name for the node",
        variant: "destructive",
      })
      return
    }

    // Validate required parameters
    const missingParams = applicationMetadata[editApplication].parameters
      .filter((param) => param.required && !editParameters[param.name])
      .map((param) => param.name)

    if (missingParams.length > 0) {
      toast({
        title: "Missing parameters",
        description: `Please provide values for: ${missingParams.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    const updatedTree = updateNodeInTree(ivrTree, editingNode.id, {
      ...editingNode,
      name: editNodeName,
      application: editApplication,
      parameters: editParameters,
      dtmfKey: editDtmfKey || undefined,
      insertDatabase: editInsertDatabase,
    })

    setIvrTree(updatedTree)
    setIsEditModalOpen(false)

    toast({
      title: "Node updated",
      description: `Updated "${editNodeName}" successfully`,
    })
  }

  const updateNodeInTree = (tree: IVRNode, nodeId: string, updatedNode: IVRNode): IVRNode => {
    if (tree.id === nodeId) {
      return {
        ...tree,
        ...updatedNode,
        children: tree.children, // Preserve children
      }
    }

    return {
      ...tree,
      children: tree.children?.map((child) => updateNodeInTree(child, nodeId, updatedNode)) || [],
    }
  }

  // Replace the existing openDeleteDialog function with this improved version
  const openDeleteDialog = (node: IVRNode) => {
    // Check if this node is currently being edited
    if (editingNode && editingNode.id === node.id) {
      toast({
        title: "Cannot delete node",
        description: "This node is currently being edited. Please finish editing before deleting.",
        variant: "destructive",
      })
      return
    }

    // Check if this node is currently selected for adding a child
    if (selectedNode && selectedNode.id === node.id) {
      toast({
        title: "Cannot delete node",
        description: "This node is currently selected for adding a child. Please cancel that operation first.",
        variant: "destructive",
      })
      return
    }

    // Set the node to be deleted and open the confirmation dialog
    setNodeToDelete(node)
    setIsDeleteDialogOpen(true)
  }

  // Replace the existing handleDeleteNode function with this improved version
  const handleDeleteNode = () => {
    if (!nodeToDelete) return

    try {
      // Mark this node as being processed for deletion
      setProcessingDeletion(nodeToDelete.id)

      // Create a copy of the tree to work with
      const updatedTree = deleteNodeFromTree(ivrTree, nodeToDelete.id)

      // If the root was returned as is (couldn't be deleted), don't update
      if (updatedTree) {
        // If the deleted node was the selected node, clear the selection
        if (selectedNode && selectedNode.id === nodeToDelete.id) {
          setSelectedNode(null)
        }

        // Update the tree
        setIvrTree(updatedTree)

        toast({
          title: "Node deleted",
          description: `Deleted "${nodeToDelete.name}" successfully`,
        })
      }
    } catch (error) {
      console.error("Error deleting node:", error)
      toast({
        title: "Deletion failed",
        description: "An error occurred while deleting the node. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Clear the deletion state
      setProcessingDeletion(null)
      setIsDeleteDialogOpen(false)
      setNodeToDelete(null)
    }
  }

  // Replace the existing deleteNodeFromTree function with this improved version
  const deleteNodeFromTree = (tree: IVRNode, nodeId: string): IVRNode => {
    // Don't allow deleting the root node
    if (tree.id === nodeId && !tree.dtmfKey) {
      toast({
        title: "Cannot delete root node",
        description: "The main IVR node cannot be deleted",
        variant: "destructive",
      })
      return tree
    }

    // If this node has the ID we want to delete, return null
    if (tree.id === nodeId) {
      return null
    }

    // Process children
    if (tree.children && tree.children.length > 0) {
      // Filter out any children that match the ID, and recursively process remaining children
      const updatedChildren = tree.children.map((child) => deleteNodeFromTree(child, nodeId)).filter(Boolean) as
        | IVRNode[]
        | undefined

      return {
        ...tree,
        children: updatedChildren,
      }
    }

    // No children to process, return the node as is
    return tree
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Check if it's an audio file
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (mp3, wav, etc.)",
        variant: "destructive",
      })
      return
    }

    // Create a unique filename
    const fileName = `custom-${nanoid(6)}-${file.name.replace(/\s+/g, "-").toLowerCase()}`

    setUploadedFiles((prev) => ({
      ...prev,
      [fileName]: file,
    }))

    toast({
      title: "File uploaded",
      description: `"${file.name}" has been uploaded and is available for use`,
    })
  }

  // Node styling and rendering
  const getNodeIcon = (application: DialplanApplication) => {
    return applicationMetadata[application]?.icon || <Settings className="h-4 w-4" />
  }

  const getNodeColor = (application: DialplanApplication) => {
    const category = applicationMetadata[application]?.category
    switch (category) {
      case "Basic":
        return "border-green-800 bg-green-950/40"
      case "Call Flow":
        return "border-blue-800 bg-blue-950/40"
      case "Media":
        return "border-purple-800 bg-purple-950/40"
      case "Advanced":
        return "border-orange-800 bg-orange-950/40"
      case "Database":
        return "border-cyan-800 bg-cyan-950/40"
      case "Voicemail":
        return "border-indigo-800 bg-indigo-950/40"
      case "Conferencing":
        return "border-pink-800 bg-pink-950/40"
      case "Queuing":
        return "border-yellow-800 bg-yellow-950/40"
      default:
        return "border-gray-700"
    }
  }

  const renderCustomNode = useCallback(
    ({ nodeDatum }: any) => {
      return (
        <foreignObject width={220} height={140} x={-110} y={-70}>
          <div
            className={`p-3 rounded-lg shadow-sm border-2 ${getNodeColor(
              nodeDatum.application,
            )} transition-all hover:shadow-md bg-background/80`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="font-medium text-sm truncate max-w-[140px] dark:text-gray-200" title={nodeDatum.name}>
                {nodeDatum.name}
              </div>
              <Badge variant="outline" className="text-xs flex items-center gap-1 dark:border-gray-700">
                {getNodeIcon(nodeDatum.application)}
                <span className="text-[10px]">{nodeDatum.application}</span>
              </Badge>
            </div>

            {nodeDatum.dtmfKey && (
              <div className="text-xs text-gray-500 mb-1">
                DTMF Key: <span className="font-mono bg-gray-800 px-1 rounded">{nodeDatum.dtmfKey}</span>
              </div>
            )}

            {Object.keys(nodeDatum.parameters || {}).length > 0 && (
              <div className="text-xs text-gray-500 mb-1 truncate">
                Params:{" "}
                <span className="font-mono bg-gray-800 px-1 rounded truncate max-w-[100px] inline-block align-bottom">
                  {Object.entries(nodeDatum.parameters || {})
                    .map(([k, v]) => `${k}=${v}`)
                    .join(", ")}
                </span>
              </div>
            )}

            {nodeDatum.insertDatabase && (
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Database className="h-3 w-3 text-purple-500" />
                <span>Database Insert</span>
              </div>
            )}

            <div className="flex gap-1 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation()
                  openEditModal(nodeDatum)
                }}
              >
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedNode(nodeDatum)
                  setIsAddModalOpen(true)
                }}
              >
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>

              {/* Modify the renderCustomNode function to disable the delete button when a node is being processed
              Find the delete button in the renderCustomNode function and replace it with: */}
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                onClick={(e) => {
                  e.stopPropagation()
                  openDeleteDialog(nodeDatum)
                }}
                disabled={processingDeletion === nodeDatum.id}
              >
                {processingDeletion === nodeDatum.id ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </foreignObject>
      )
    },
    [applicationMetadata, setSelectedNode, setIsAddModalOpen, processingDeletion],
  )

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(ivrTree, null, 2))
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "IVR tree JSON has been copied to your clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  // Audio file options
  const audioFileOptions = useMemo(
    () => [
      { value: "welcome", label: "Welcome Message" },
      { value: "main-menu", label: "Main Menu Options" },
      { value: "invalid-input", label: "Invalid Input Message" },
      { value: "goodbye", label: "Goodbye Message" },
      { value: "hold-music", label: "Hold Music" },
      { value: "transfer-message", label: "Transfer Message" },
      { value: "voicemail", label: "Voicemail Greeting" },
      { value: "hours", label: "Business Hours" },
      { value: "support-menu", label: "Support Menu" },
      { value: "sales-menu", label: "Sales Menu" },
      { value: "billing-menu", label: "Billing Menu" },
      { value: "tech-support", label: "Technical Support" },
      ...Object.keys(uploadedFiles).map((filename) => ({
        value: filename,
        label: `Custom: ${filename.replace(/^custom-[a-zA-Z0-9]+-/, "")}`,
      })),
    ],
    [uploadedFiles],
  )

  // Render parameter input based on type
  const renderParameterInput = (
    param: ApplicationMetadata["parameters"][0],
    value: any,
    onChange: (name: string, value: any) => void,
  ) => {
    switch (param.type) {
      case "string":
      case "extension":
      case "context":
      case "priority":
      case "variable":
        return (
          <Input
            id={param.name}
            placeholder={param.description}
            value={value || ""}
            onChange={(e) => onChange(param.name, e.target.value)}
          />
        )
      case "number":
        return (
          <Input
            id={param.name}
            type="number"
            placeholder={param.description}
            value={value || ""}
            onChange={(e) => onChange(param.name, e.target.valueAsNumber || 0)}
          />
        )
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={param.name}
              checked={value || false}
              onCheckedChange={(checked) => onChange(param.name, checked)}
            />
            <label
              htmlFor={param.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {param.description}
            </label>
          </div>
        )
      case "options":
        return (
          <Select value={value || ""} onValueChange={(val) => onChange(param.name, val)}>
            <SelectTrigger id={param.name}>
              <SelectValue placeholder={param.description} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "audio":
        return (
          <div className="space-y-2">
            <Select value={value || ""} onValueChange={(val) => onChange(param.name, val)}>
              <SelectTrigger id={param.name}>
                <SelectValue placeholder={param.description} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectGroup>
                  <SelectLabel>System Audio</SelectLabel>
                  {audioFileOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 pt-1">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="audio-upload" className="text-xs flex items-center gap-1">
                  <Upload className="h-3 w-3" /> Upload new audio file
                </Label>
                <Input id="audio-upload" type="file" accept="audio/*" className="text-xs" onChange={handleFileUpload} />
              </div>
            </div>
          </div>
        )
      default:
        return (
          <Input
            id={param.name}
            placeholder={param.description}
            value={value || ""}
            onChange={(e) => onChange(param.name, e.target.value)}
          />
        )
    }
  }

  // Convert the IVR tree to D3 format
  const d3Tree = convertToD3Format(ivrTree)

  return (
    <Card className="p-4 shadow-sm border bg-background">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Asterisk Dialplan Builder</h2>
        <Button onClick={copyToClipboard} variant={copied ? "outline" : "default"} className="flex items-center gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Export JSON"}
        </Button>
      </div>

      <div className="bg-slate-900/20 border rounded-lg overflow-hidden relative">
        <div id="treeWrapper" className="w-full h-[40em]">
          <Tree
            data={d3Tree}
            orientation="vertical"
            translate={translate}
            zoom={zoom}
            onUpdate={(state) => {
              setTranslate(state.translate)
              setZoom(state.zoom)
            }}
            renderCustomNodeElement={renderCustomNode}
            pathFunc="elbow"
            separation={{ siblings: 2, nonSiblings: 2.5 }}
            nodeSize={{ x: 240, y: 160 }}
            pathClassFunc={() => "stroke-gray-600 stroke-[1.5px]"}
            draggable={true}
            zoomable={true}
          />
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-background/80 p-2 rounded-lg border shadow-sm">
          <Button size="sm" variant="outline" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleResetView} title="Reset View">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add Node Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Node to "{selectedNode?.name}"</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="nodeName" className="text-sm font-medium">
                Node Name
              </label>
              <Input
                id="nodeName"
                placeholder="Enter node name"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Application Type</label>
              <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as DialplanAppCategory)}>
                <TabsList className="grid grid-cols-4 mb-2">
                  <TabsTrigger value="Basic">Basic</TabsTrigger>
                  <TabsTrigger value="Call Flow">Call Flow</TabsTrigger>
                  <TabsTrigger value="Media">Media</TabsTrigger>
                  <TabsTrigger value="Advanced">Advanced</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="Database">Database</TabsTrigger>
                  <TabsTrigger value="Voicemail">Voicemail</TabsTrigger>
                  <TabsTrigger value="Conferencing">Conference</TabsTrigger>
                  <TabsTrigger value="Queuing">Queue</TabsTrigger>
                </TabsList>

                {Object.entries(applicationsByCategory).map(([category, apps]) => (
                  <TabsContent key={category} value={category} className="mt-2 max-h-[200px] overflow-y-auto">
                    <Select value={application} onValueChange={handleApplicationChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select application" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {apps.map((app) => (
                          <SelectItem key={app} value={app}>
                            <div className="flex items-center gap-2">
                              {getNodeIcon(app)}
                              <span>{app}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">{applicationMetadata[application]?.description || ""}</p>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Application Parameters */}
            {applicationMetadata[application].parameters.length > 0 && (
              <div className="space-y-3 border-t pt-3">
                <h4 className="text-sm font-medium">Parameters</h4>
                {applicationMetadata[application].parameters.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <label htmlFor={param.name} className="text-sm font-medium flex items-center gap-1">
                      {param.name}
                      {param.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderParameterInput(param, parameters[param.name], handleParameterChange)}
                    <p className="text-xs text-gray-500">{param.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* DTMF Key */}
            <div className="space-y-2 border-t pt-3">
              <label htmlFor="dtmfKey" className="text-sm font-medium">
                DTMF Key (Optional)
              </label>
              <Input
                id="dtmfKey"
                placeholder="e.g., 1, 2, #, *"
                value={dtmfKey}
                onChange={(e) => setDtmfKey(e.target.value)}
                maxLength={1}
              />
              <p className="text-xs text-gray-500">
                If this node is triggered by a DTMF key press, specify the key here
              </p>
            </div>

            {/* Database Insert */}
            <div className="flex items-center space-x-2 border-t pt-3">
              <Checkbox
                id="insertDatabase"
                checked={insertDatabase}
                onCheckedChange={(checked) => setInsertDatabase(checked as boolean)}
              />
              <label
                htmlFor="insertDatabase"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
              >
                <Database className="h-4 w-4 text-purple-500" />
                Insert to Database
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNode}>Add Node</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Node Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Node: "{editingNode?.name}"</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="editNodeName" className="text-sm font-medium">
                Node Name
              </label>
              <Input
                id="editNodeName"
                placeholder="Enter node name"
                value={editNodeName}
                onChange={(e) => setEditNodeName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Application Type</label>
              <Tabs
                value={editActiveCategory}
                onValueChange={(value) => setEditActiveCategory(value as DialplanAppCategory)}
              >
                <TabsList className="grid grid-cols-4 mb-2">
                  <TabsTrigger value="Basic">Basic</TabsTrigger>
                  <TabsTrigger value="Call Flow">Call Flow</TabsTrigger>
                  <TabsTrigger value="Media">Media</TabsTrigger>
                  <TabsTrigger value="Advanced">Advanced</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="Database">Database</TabsTrigger>
                  <TabsTrigger value="Voicemail">Voicemail</TabsTrigger>
                  <TabsTrigger value="Conferencing">Conference</TabsTrigger>
                  <TabsTrigger value="Queuing">Queue</TabsTrigger>
                </TabsList>

                {Object.entries(applicationsByCategory).map(([category, apps]) => (
                  <TabsContent key={category} value={category} className="mt-2">
                    <Select value={editApplication} onValueChange={handleEditApplicationChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select application" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {apps.map((app) => (
                          <SelectItem key={app} value={app}>
                            <div className="flex items-center gap-2">
                              {getNodeIcon(app)}
                              <span>{app}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">{applicationMetadata[editApplication].description}</p>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Application Parameters */}
            {applicationMetadata[editApplication].parameters.length > 0 && (
              <div className="space-y-3 border-t pt-3">
                <h4 className="text-sm font-medium">Parameters</h4>
                {applicationMetadata[editApplication].parameters.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <label htmlFor={`edit_${param.name}`} className="text-sm font-medium flex items-center gap-1">
                      {param.name}
                      {param.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderParameterInput(param, editParameters[param.name], handleEditParameterChange)}
                    <p className="text-xs text-gray-500">{param.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* DTMF Key */}
            <div className="space-y-2 border-t pt-3">
              <label htmlFor="editDtmfKey" className="text-sm font-medium">
                DTMF Key (Optional)
              </label>
              <Input
                id="editDtmfKey"
                placeholder="e.g., 1, 2, #, *"
                value={editDtmfKey}
                onChange={(e) => setEditDtmfKey(e.target.value)}
                maxLength={1}
              />
              <p className="text-xs text-gray-500">
                If this node is triggered by a DTMF key press, specify the key here
              </p>
            </div>

            {/* Database Insert */}
            <div className="flex items-center space-x-2 border-t pt-3">
              <Checkbox
                id="editInsertDatabase"
                checked={editInsertDatabase}
                onCheckedChange={(checked) => setEditInsertDatabase(checked as boolean)}
              />
              <label
                htmlFor="editInsertDatabase"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
              >
                <Database className="h-4 w-4 text-purple-500" />
                Insert to Database
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditNode}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Node Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Dialog>
          <DialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the node "{nodeToDelete?.name}" and all its children from the IVR tree.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteNode} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </DialogContent>
        </Dialog>
      </AlertDialog>

      <Toaster />
    </Card>
  )
}


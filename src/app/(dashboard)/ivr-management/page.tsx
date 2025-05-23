import AudioFileManager from "@/components/ivr/audio-file-manager"
import IVRTreeBuilder from "@/components/ivr/ivr-tree"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function IVRManagementPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">IVR System Manager</h1>

      <Tabs defaultValue="builder" className="w-full space-y-4">
        <TabsList className="mb-4">
          <TabsTrigger value="builder">IVR Flow Builder</TabsTrigger>
          <TabsTrigger value="audio">Audio File Manager</TabsTrigger>
        </TabsList>
        <TabsContent value="builder">
          <IVRTreeBuilder />
        </TabsContent>
        <TabsContent value="audio">
          <AudioFileManager />
        </TabsContent>
      </Tabs>
    </main>
  )
}

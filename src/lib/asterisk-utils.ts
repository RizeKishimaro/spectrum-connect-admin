/**
 * Generates Asterisk dialplan configuration from the IVR tree data
 * @param treeData The IVR tree data structure
 * @returns Formatted Asterisk dialplan string
 */
export function generateAsteriskDialplan(treeData: any): string {
  if (!treeData) return ""

  let dialplan = ""
  const contextName = "ivr-main"

  // Start with the context header
  dialplan += `[${contextName}]\n`
  dialplan += `; Auto-generated IVR dialplan for ${treeData.name}\n`
  dialplan += `; Generated on ${new Date().toLocaleString()}\n\n`

  // Add the entry point
  dialplan += `exten => ${treeData.extension || "s"},1,Answer()\n`
  dialplan += `same => n,Wait(1)\n`
  dialplan += `same => n,Playback(${treeData.soundFile})\n`

  // Process main menu options
  if (treeData.children && treeData.children.length > 0) {
    // Create the background for DTMF input
    dialplan += `same => n,Background(silence/1)\n`

    // Add the WaitExten with timeout
    dialplan += `same => n,WaitExten(10)\n`

    // Add timeout and invalid handlers
    dialplan += `exten => t,1,Playback(timeout)\n`
    dialplan += `exten => t,n,Goto(${treeData.extension || "s"},1)\n\n`

    dialplan += `exten => i,1,Playback(invalid)\n`
    dialplan += `exten => i,n,Goto(${treeData.extension || "s"},1)\n\n`

    // Process each child node
    dialplan = processChildren(treeData.children, dialplan, contextName, treeData)
  } else {
    // If no children, just hang up
    dialplan += `same => n,Hangup()\n\n`
  }

  return dialplan
}

/**
 * Recursively processes child nodes to generate dialplan entries
 */
function processChildren(children: any[], dialplan: string, contextName: string, treeData: any): string {
  let result = dialplan

  for (const child of children) {
    if (child.dtmfNumber !== null && child.dtmfNumber !== undefined) {
      // Add the extension for this DTMF option
      result += `exten => ${child.dtmfNumber},1,Playback(${child.soundFile})\n`

      if (child.nodeType === "Endpoint" && child.action) {
        // For endpoints, add the action directly
        result += `exten => ${child.dtmfNumber},n,${child.action}\n`
        result += `exten => ${child.dtmfNumber},n,Hangup()\n\n`
      } else if (child.children && child.children.length > 0) {
        // For sub-menus, create a new context and jump to it
        const subContextName = `${contextName}-${child.extension || child.dtmfNumber}`
        result += `exten => ${child.dtmfNumber},n,Goto(${subContextName},s,1)\n\n`

        // Create the sub-context
        result += `[${subContextName}]\n`
        result += `exten => s,1,Answer()\n`
        result += `exten => s,n,Playback(${child.soundFile})\n`

        // Process sub-menu options
        if (child.children.length > 0) {
          result += `exten => s,n,Background(silence/1)\n`
          result += `exten => s,n,WaitExten(10)\n`

          // Add timeout and invalid handlers for sub-menu
          result += `exten => t,1,Playback(timeout)\n`
          result += `exten => t,n,Goto(s,1)\n\n`

          result += `exten => i,1,Playback(invalid)\n`
          result += `exten => i,n,Goto(s,1)\n\n`

          // Add option to return to main menu
          result += `exten => 0,1,Playback(returning-to-main-menu)\n`
          result += `exten => 0,n,Goto(${contextName},${treeData.extension || "s"},1)\n\n`

          // Process children of this sub-menu
          result = processChildren(child.children, result, subContextName, treeData)
        } else {
          // If no children in sub-menu, return to main menu
          result += `exten => s,n,Goto(${contextName},${treeData.extension || "s"},1)\n\n`
        }
      } else {
        // For empty sub-menus, just return to main menu
        result += `exten => ${child.dtmfNumber},n,Goto(${contextName},${treeData.extension || "s"},1)\n\n`
      }
    }
  }

  return result
}


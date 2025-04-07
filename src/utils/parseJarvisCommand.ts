
/**
 * Parser for Jarvis AI commands from text responses
 */

type JarvisCommandType = 'send-followup' | 'add-tag' | 'move-pipeline' | 'launch-workflow' | 'mark-noshow';

interface JarvisCommand {
  action: JarvisCommandType;
  contactId?: string;
  appointmentId?: string;
  opportunityId?: string;
  stageId?: string;
  tagId?: string;
  workflowId?: string;
  message?: string;
}

/**
 * Parse a response from Jarvis to extract command actions
 * @param text The AI response text to parse
 * @returns A JarvisCommand object if a command is detected, or null if no command is found
 */
export function parseJarvisCommand(text: string): JarvisCommand | null {
  // Look for follow-up commands
  const followUpRegex = /send(?:ing)?\s+(?:a\s+)?follow(?:-|\s)?up\s+(?:to|for)?\s+(?:contact\s+)?([a-zA-Z0-9]+)/i;
  const followUpMatch = text.match(followUpRegex);
  
  if (followUpMatch) {
    return {
      action: 'send-followup',
      contactId: followUpMatch[1],
      message: text
    };
  }
  
  // Look for tag commands
  const tagRegex = /(?:add|apply)\s+(?:the\s+)?tag\s+([a-zA-Z0-9]+)\s+(?:to|for)\s+(?:contact\s+)?([a-zA-Z0-9]+)/i;
  const tagMatch = text.match(tagRegex);
  
  if (tagMatch) {
    return {
      action: 'add-tag',
      tagId: tagMatch[1],
      contactId: tagMatch[2]
    };
  }
  
  // Look for pipeline movement commands
  const pipelineRegex = /move\s+(?:opportunity\s+)?([a-zA-Z0-9]+)\s+(?:to|into)\s+(?:stage|pipeline stage)\s+([a-zA-Z0-9]+)/i;
  const pipelineMatch = text.match(pipelineRegex);
  
  if (pipelineMatch) {
    return {
      action: 'move-pipeline',
      opportunityId: pipelineMatch[1],
      stageId: pipelineMatch[2]
    };
  }
  
  // Look for workflow launch commands
  const workflowRegex = /launch\s+(?:workflow|campaign)\s+([a-zA-Z0-9]+)\s+for\s+(?:contact\s+)?([a-zA-Z0-9]+)/i;
  const workflowMatch = text.match(workflowRegex);
  
  if (workflowMatch) {
    return {
      action: 'launch-workflow',
      workflowId: workflowMatch[1],
      contactId: workflowMatch[2]
    };
  }
  
  // Look for no-show marking commands
  const noshowRegex = /mark\s+(?:appointment\s+)?([a-zA-Z0-9]+)\s+(?:as\s+)?(?:a\s+)?no(?:-|\s)?show/i;
  const noshowMatch = text.match(noshowRegex);
  
  if (noshowMatch) {
    return {
      action: 'mark-noshow',
      appointmentId: noshowMatch[1]
    };
  }
  
  // No command found
  return null;
}

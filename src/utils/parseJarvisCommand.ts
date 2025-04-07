
/**
 * Parser for Jarvis AI commands from text responses
 */

type JarvisCommandType = 'send-followup' | 'add-tag' | 'move-pipeline' | 'launch-workflow' | 'mark-noshow' | 'tag-contact' | 'move-stage';

interface JarvisCommand {
  action: JarvisCommandType;
  contactId?: string;
  appointmentId?: string;
  opportunityId?: string;
  stageId?: string;
  tagId?: string;
  workflowId?: string;
  message?: string;
  tag?: string;
  stage?: string;
}

/**
 * Parse a response from Jarvis to extract command actions
 * @param text The AI response text to parse
 * @returns A JarvisCommand object if a command is detected, or null if no command is found
 */
export function parseJarvisCommand(text: string): JarvisCommand | null {
  // Look for follow-up commands - both formats
  const followUpRegex = /send(?:ing)?\s+(?:a\s+)?follow(?:-|\s)?up\s+(?:message\s+)?(?:to|for)?\s+(?:contact\s+)?([a-zA-Z0-9]+)/i;
  const followUpMatch = text.match(followUpRegex);
  
  if (followUpMatch) {
    return {
      action: 'send-followup',
      contactId: followUpMatch[1],
      message: text
    };
  }
  
  // Look for tag commands - both formats
  const tagRegexOriginal = /(?:add|apply)\s+(?:the\s+)?tag\s+([a-zA-Z0-9]+)\s+(?:to|for)\s+(?:contact\s+)?([a-zA-Z0-9]+)/i;
  const tagMatchOriginal = text.match(tagRegexOriginal);
  
  if (tagMatchOriginal) {
    return {
      action: 'add-tag',
      tagId: tagMatchOriginal[1],
      contactId: tagMatchOriginal[2]
    };
  }
  
  // New tag format: "Tag John123 as hotlead"
  const tagRegexNew = /tag\s+([a-zA-Z0-9]+)\s+as\s+([a-zA-Z0-9]+)/i;
  const tagMatchNew = text.match(tagRegexNew);
  
  if (tagMatchNew) {
    return {
      action: 'tag-contact',
      contactId: tagMatchNew[1],
      tag: tagMatchNew[2]
    };
  }
  
  // Look for pipeline movement commands - both formats
  const pipelineRegex = /move\s+(?:opportunity\s+)?([a-zA-Z0-9]+)\s+(?:to|into)\s+(?:stage|pipeline stage)\s+([a-zA-Z0-9]+)/i;
  const pipelineMatch = text.match(pipelineRegex);
  
  if (pipelineMatch) {
    return {
      action: 'move-pipeline',
      opportunityId: pipelineMatch[1],
      stageId: pipelineMatch[2]
    };
  }
  
  // New stage movement format: "Move John123 to stage Interested"
  const stageRegexNew = /move\s+([a-zA-Z0-9]+)\s+to\s+stage\s+(.+)/i;
  const stageMatchNew = text.match(stageRegexNew);
  
  if (stageMatchNew) {
    return {
      action: 'move-stage',
      contactId: stageMatchNew[1],
      stage: stageMatchNew[2].trim()
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

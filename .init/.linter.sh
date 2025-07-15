#!/bin/bash
cd /tmp/kavia/workspace/code-generation/conversational-ai-assistant-10f83be9/chat_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


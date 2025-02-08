# ChatAlly Backend

## Install bun:

Linux:
`curl -fsSL https://bun.sh/install | bash`

Windows
`powershell -c "irm bun.sh/install.ps1 | iex"`

## Errors 

`Error: Failed to launch the browser process!
/config/workspace/chat-ally/chatally/node_modules/puppeteer-core/.local-chromium/linux-1045629/chrome-linux/chrome: error while loading shared libraries: libnss3.so: cannot open shared object file: No such file or directory`

Install dependencies:

```bash 
apt install libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev libasound2t64
```

## fix fluent-ffmpeg

Go to node_modules/whatsapp-web.js

Then open package.json

Replace `"fluent-ffmpeg": "2.1.2", ` with `"fluent-ffmpeg": "2.1.3",`

And finally, npm install.

Remove package-lock.json or node_modules if necessary.
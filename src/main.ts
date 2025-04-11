import { app, BrowserWindow, globalShortcut, screen, ipcMain } from 'electron';
import { writeFile } from 'fs/promises';
const { exec } = require("child_process");

import OpenAI from 'openai';

import * as Tesseract from 'tesseract.js';
import screenshot from 'screenshot-desktop';
import { infura } from './constants';
import path from 'path';

let win: BrowserWindow | null = null;
let project = "project".slice(0, 4);
let alwaysOnTop = false;
let running = false;
const initial = "sk-level".slice(0, 3);
const quality = infura+ ""
const client = new OpenAI({
    apiKey: "s-", // This is the default and can be omitted
  });
  
let capturedInput = '';
let right = true;
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  win = new BrowserWindow({
    width: 460,
    height: 160,
    x: width - 460,
    y: height - 160,
    transparent: true,
    opacity: 0,
    frame: false,
    alwaysOnTop: false,
    focusable: false,
    hasShadow: false,
    title:"ruddy",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    skipTaskbar: true, 
    movable: false, 
    resizable: false, 
    roundedCorners: false,
  });
  win.setContentProtection(true);
  win.setIgnoreMouseEvents(true, { forward: true });

  win.setSkipTaskbar(true);

  let enforceAlwaysOnTopInterval: NodeJS.Timeout | null = null;
  let base64 = "";
  globalShortcut.register('Control+Shift+V', () => {
    if (win) {
      alwaysOnTop = !alwaysOnTop;
      win.setAlwaysOnTop(alwaysOnTop);
  
      if (!alwaysOnTop) {
        const hiddenY = screen.getPrimaryDisplay().workAreaSize.height + 200;
        win.setBounds({ x: 0, y: hiddenY, width: 460, height: 160 });
        win.setOpacity(0);
        win.setAlwaysOnTop(false);
  
        if (enforceAlwaysOnTopInterval) {
          clearInterval(enforceAlwaysOnTopInterval);
          enforceAlwaysOnTopInterval = null;
        }
      } else {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        win.setBounds({ x: width - 460, y: height - 160, width: 460, height: 160 });
        win.setOpacity(0.2);
        win.setAlwaysOnTop(true, "screen-saver");
  
        if (!enforceAlwaysOnTopInterval) {
          enforceAlwaysOnTopInterval = setInterval(() => {
            if (win && alwaysOnTop) {
              win.setAlwaysOnTop(true, "screen-saver");
            }
          }, 500); 
        }
      }
    }
  });

  globalShortcut.register('Control+Shift+L', () => {
    if (win) {
      if(right) {
        win.setBounds({ x: 0, y: height - 160, width: 460, height: 160 });
        right = false;
      } else {
        win.setBounds({ x: width - 460, y: height - 160, width: 460, height: 160 });
        right = true;
      }
    }
  });

  globalShortcut.register('Control+Shift+S', async () => {
    if (running) {
      console.log('Operation already in progress. Please wait.');
      return;
    }
  
    running = true;
    try {
      const filePath = await captureScreenshot();
      const text = await extractTextFromImage(filePath);
      console.log('Extracted Text:', text);
  
      const apiKey = initial + project + quality + base64;
  
      const response = await client.responses.create({
        model: 'gpt-4o',
        instructions: 'You are very much adept coder and you solve question in c++, You try giving correct better solutions but making sure they work and are correct',
        input: `make sure to understand the question and search if needed, only return the code, nothing else \n Question: ${text}`,
      });
  
      let generatedCode = response.output_text
      if(generatedCode.includes("```c++")) {
        generatedCode = generatedCode.replace("```c++", "").replace("```", "");
      }
      console.log('Generated C++ Code:\n', generatedCode);
  
      if (win) {
        win.webContents.executeJavaScript(`
          document.getElementById('codeDisplay').textContent = \
          ${JSON.stringify(generatedCode)};
        `);
      }
  
    } catch (err) {
      console.error('Error:', err);
    } finally {
      running = false;
    }
  });
  

  globalShortcut.register('Control+Shift+D', () => {
    console.log('Process stopped.');
    running = false;
    
    if (win) {
        win.webContents.executeJavaScript(`
          document.getElementById('codeDisplay').textContent = Your generated code here;
        `);
        capturedInput = '';
        console.log("generatedCode sent to ui")
      }

  });

  globalShortcut.register('Control+Shift+R', () => {
    console.log('Sending captured input to LLM and resetting.');
    sendInputToAPI(capturedInput);
    capturedInput = ''; 
  });
  globalShortcut.register('Control+A', () => {
    capturedInput +="A"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+B', () => {
    capturedInput +="B"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+Enter', () => {
    capturedInput +=" "
    console.log(capturedInput)
  });
  globalShortcut.register('Control+C', () => {
    capturedInput +="C"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+E', () => {
    capturedInput +="E"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+F', () => {
    capturedInput +="F"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+G', () => {
    capturedInput +="G"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+H', () => {
    capturedInput +="H"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+I', () => {
    capturedInput +="I"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+J', () => {
    capturedInput +="J"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+K', () => {
    capturedInput +="K"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+L', () => {
    capturedInput +="L"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+M', () => {
    capturedInput +="M"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+N', () => {
    capturedInput +="N"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+O', () => {
    capturedInput +="O"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+P', () => {
    capturedInput +="P"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+Q', () => {
    capturedInput +="Q"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+R', () => {
    capturedInput +="R"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+S', () => {
    capturedInput +="S"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+D', () => {
    capturedInput +="D"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+V', () => {
    capturedInput +="V"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+Backspace', () => {
    capturedInput = capturedInput.slice(0, -1);
    console.log(capturedInput)
  });
  globalShortcut.register('Control+T', () => {
    capturedInput +="T"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+U', () => {
    capturedInput +="U"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+W', () => {
    capturedInput +="W"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+X', () => {
    capturedInput +="X"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+Y', () => {
    capturedInput +="Y"
    console.log(capturedInput)
  });   
  globalShortcut.register('Control+Z', () => {
    capturedInput +="Z"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+0', () => {
    capturedInput +="0"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+1', () => {
    capturedInput +="1"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+2', () => {
    capturedInput +="2"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+3', () => {
    capturedInput +="3"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+4', () => {
    capturedInput +="4"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+5', () => {
    capturedInput +="5"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+6', () => {
    capturedInput +="6"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+7', () => {
    capturedInput +="7"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+8', () => {
    capturedInput +="8"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+9', () => {
    capturedInput +="9"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+[', () => {
    capturedInput +="["
    console.log(capturedInput)
  });
  globalShortcut.register('Control+]', () => {
    capturedInput +="]"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+;', () => {
    capturedInput +=";"
    console.log(capturedInput)
  });
  globalShortcut.register('Control+\'', () => {
    capturedInput +="'"
    console.log(capturedInput)
  });
  
  globalShortcut.register('Control+Up', () => {
    if (win) {
      win.webContents.executeJavaScript(`
        window.scrollBy(0, -100);
      `);
    }
  });

  globalShortcut.register('Control+Down', () => {
    if (win) {
      win.webContents.executeJavaScript(`
        window.scrollBy(0, 100);
      `);
    }
  });
  
  globalShortcut.register('Control+Shift+Q', () => {
    console.log('Quitting the app.');
    app.quit();
  });
  
  globalShortcut.register('Control+Shift+Up', () => {
    if (win) {
      let currentOpacity = win.getOpacity();
      if (currentOpacity < 1.0) {
        win.setOpacity(Math.min(currentOpacity + 0.1, 1.0));
      }
    }
  });

  globalShortcut.register('Control+Shift+Down', () => {
    if (win) {
      let currentOpacity = win.getOpacity();
      if (currentOpacity > 0.1) {
        win.setOpacity(Math.max(currentOpacity - 0.1, 0.1));
      }
    }
  });
  
  win.loadFile('src/index.html')
    win.webContents.on('did-finish-load', () => {
      if(win) {
      win.setBackgroundColor('#00000000');
      win.webContents.insertCSS('html, body { background-color: transparent !important; }');
      }
    });
}


  

function sendInputToAPI(input: string) {
  console.log(`Sending input to API: ${input}`);


  client.responses.create({
    model: 'gpt-4o',
    instructions: 'You are very much adept coder and you only do two things one is to solve question in c++ and other is to do aptitude questions, You try giving correct better solutions but making sure they work and are correct',
    input: `make sure to understand the question and search if needed, only return the code if asked for code, otherwise only return the answer if its an aptitude question, nothing else \n Input: ${input}`,
  }).then(response => {
    let generatedCode = response.output_text;
    if (generatedCode.includes("```")) {
      generatedCode = generatedCode.replace("```c++", "").replace("```", "");
    }
    console.log('Generated C++ Code:\n', generatedCode);

    if (win) {
      win.webContents.executeJavaScript(`
        document.getElementById('codeDisplay').textContent = \
        ${JSON.stringify(generatedCode)};
      `);
      console.log("generatedCode sent to ui")
    }
  }).catch(err => {
    console.error('Error:', err);
  });
}

async function captureScreenshot(): Promise<string> {
  const filePath = `${app.getPath('desktop')}/screenshot.png`;
  try {
    const img = await screenshot();
    await writeFile(filePath, img);
    console.log(`Screenshot saved at ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw error;
  }
}

function extractTextFromImage(imagePath: string): Promise<string> {
  return Tesseract.recognize(imagePath, 'eng')
    .then(({ data }) => data.text)
    .catch((err) => {
      console.error('Tesseract Error:', err);
      return '';
    });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

function makeWindowInvisible(windowTitle: string) {
  const scriptPath = path.join(__dirname, "SetWindowInvisible.ps1");
  const command = `powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}" -WindowName "${windowTitle}"`;

  exec(command, (error: any, stdout: any, stderr: any) => {
      if (error) {
          console.error(`Error: ${stderr}`);
          return;
      }
      console.log(stdout.trim());
  });
}
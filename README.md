# ChatGPT Overlay

A simple AutoHotkey script that creates a toggleable overlay window for ChatGPT, allowing you to quickly access ChatGPT while working in other applications.

## Features

- Toggle ChatGPT window visibility with a single hotkey
- Window stays on top of other applications
- Automatically opens ChatGPT in Chrome if not already running
- Lightweight and efficient

## Requirements

- [AutoHotkey](https://www.autohotkey.com/) (v1.1 or later)
- Google Chrome installed at the default location (`C:\Program Files\Google\Chrome\Application\chrome.exe`)

## Installation

1. Install AutoHotkey if you haven't already
2. Download or clone this repository
3. Double-click `ChatGPT_Overlay.ahk` to run the script
   - Alternatively, right-click the script and select "Run as Administrator" if you encounter permission issues

## Usage

- Press `Ctrl + Alt + O` to toggle the ChatGPT overlay
- The window will stay on top of other applications when visible
- Press the hotkey again to hide the window

## Customization

You can modify the following variables in the script to customize its behavior:

- `chatGPTURL`: Change the URL if you want to use a different ChatGPT instance
- `chromePath`: Update if Chrome is installed in a different location

## Notes

- The script will automatically find an existing ChatGPT Chrome window if one is open
- If no ChatGPT window is found, it will open a new one
- The window will maintain its "always on top" state until you toggle it off

## Troubleshooting

If the script doesn't work as expected:
1. Make sure AutoHotkey is installed correctly
2. Verify that Chrome is installed at the default location
3. Try running the script as Administrator
4. Check if the hotkey combination (`Ctrl + Alt + O`) conflicts with other applications

## License

This project is open source and available under the MIT License. 
#Persistent
#NoEnv
#SingleInstance Force
SetTitleMatchMode, 2  ; Allows partial title match
DetectHiddenWindows, On

global toggle := false
global chatGPTURL := "https://chat.openai.com"
global chromePath := "C:\Program Files\Google\Chrome\Application\chrome.exe"

^!o:: ; Ctrl + Alt + O to toggle overlay
    toggle := !toggle
    if (toggle) {
        ; Check if a Chrome app window exists
        WinGet, id, List, ahk_exe chrome.exe
        found := false

        Loop, %id%
        {
            this_id := id%A_Index%
            WinGetTitle, title, ahk_id %this_id%
            if InStr(title, "ChatGPT")
            {
                found := true
                targetWindow := "ahk_id " . this_id
                break
            }
        }

        if (!found) {
            Run, "%chromePath%" --app=%chatGPTURL%
            Sleep, 2000  ; Wait for the window to load
            WinWait, ChatGPT
            WinGet, id, ID, ChatGPT
            targetWindow := "ahk_id " . id
        }

        WinActivate, %targetWindow%
        WinSet, AlwaysOnTop, On, %targetWindow%
        WinShow, %targetWindow%
        SetTimer, KeepOnTop, 500
    } else {
        WinSet, AlwaysOnTop, Off, %targetWindow%
        WinHide, %targetWindow%
        SetTimer, KeepOnTop, Off
    }
return

KeepOnTop:
    if toggle {
        WinSet, AlwaysOnTop, On, %targetWindow%
    }
return

#Persistent
#NoEnv
#SingleInstance Force
SetTitleMatchMode, 2
DetectHiddenWindows, On

global toggle := false
global windowWidth := 400
global windowHeight := 480
global targetPID := 53424
global targetHWND := 987028
global opacity := 77

^!o:: ; Ctrl + Alt + O to toggle overlay
    toggle := !toggle
    if (toggle) {
        targetWindow := "ahk_id " . targetHWND

        ; Get screen dimensions
        SysGet, screenWidth, 78
        SysGet, screenHeight, 79

        ; Calculate bottom left position
        x := 0
        y := screenHeight - windowHeight

        WinActivate, %targetWindow% 
        
        WinSet, AlwaysOnTop, On, %targetWindow%
        WinSet, Transparent, %opacity%, %targetWindow%
        WinShow, %targetWindow%
        WinMove, %targetWindow%, , x, y, windowWidth, windowHeight
        SetTimer, KeepOnTop, 500
    } else {
        targetWindow := "ahk_id " . targetHWND
        WinSet, AlwaysOnTop, Off, %targetWindow%
        WinSet, Transparent, OFF, %targetWindow%
        WinHide, %targetWindow%
        SetTimer, KeepOnTop, Off
    }
return

^!Up::    ; Ctrl + Alt + Up Arrow to increase opacity
    opacity := Min(opacity + 15, 255)
    if (toggle)
        WinSet, Transparent, %opacity%, ahk_id %targetHWND%
return

^!Down::  ; Ctrl + Alt + Down Arrow to decrease opacity
    opacity := Max(opacity - 15, 50)
    if (toggle)
        WinSet, Transparent, %opacity%, ahk_id %targetHWND%
return

KeepOnTop:
    if toggle {
        targetWindow := "ahk_id " . targetHWND
        WinSet, AlwaysOnTop, On, %targetWindow%
        WinSet, Transparent, %opacity%, %targetWindow%
        WinGetPos, , , width, height, %targetWindow%
        if (width != windowWidth || height != windowHeight) {
            WinMove, %targetWindow%, , , , windowWidth, windowHeight
        }
    }
return

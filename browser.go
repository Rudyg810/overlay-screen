package main

import (
	"syscall"
	"unsafe"

	"github.com/lxn/win"
)

// WebView2 constants
const (
	WEBVIEW2_CLASS = "WebView2"
	WS_OVERLAPPED  = 0x00000000
	WS_CAPTION     = 0x00C00000
	WS_SYSMENU     = 0x00080000
	WS_VISIBLE     = 0x10000000
	WS_POPUP       = 0x80000000
)

var (
	ole32      = syscall.NewLazyDLL("ole32.dll")
	combaseapi = syscall.NewLazyDLL("combase.dll")

	procCoInitializeEx = ole32.NewProc("CoInitializeEx")
	procCoUninitialize = ole32.NewProc("CoUninitialize")
)

func initUI() error {
	// Initialize COM
	hr, _, _ := procCoInitializeEx.Call(0, 0) // COINIT_APARTMENTTHREADED
	if hr != 0 {
		return syscall.Errno(hr)
	}
	return nil
}

// createBrowserWindow creates a window with WebView2 rendering Google
func createBrowserWindow(x, y, width, height int, url string) (win.HWND, error) {
	// Register window class
	className := syscall.StringToUTF16Ptr("BrowserWindow")

	var wcex win.WNDCLASSEX
	wcex.CbSize = uint32(unsafe.Sizeof(wcex))
	wcex.Style = win.CS_HREDRAW | win.CS_VREDRAW
	wcex.LpfnWndProc = syscall.NewCallback(wndProc)
	wcex.HInstance = win.GetModuleHandle(nil)
	wcex.HCursor = win.LoadCursor(0, syscall.StringToUTF16Ptr("IDC_ARROW"))
	wcex.HbrBackground = win.COLOR_WINDOW + 1
	wcex.LpszClassName = className

	if atom := win.RegisterClassEx(&wcex); atom == 0 {
		return 0, syscall.GetLastError()
	}

	// Create window
	hwnd := win.CreateWindowEx(
		0,
		className,
		syscall.StringToUTF16Ptr("Embedded Browser"),
		WS_POPUP|WS_VISIBLE,
		int32(x),
		int32(y),
		int32(width),
		int32(height),
		0,
		0,
		win.GetModuleHandle(nil),
		nil)

	if hwnd == 0 {
		return 0, syscall.GetLastError()
	}

	// Simulate embedding an iframe - in reality here you would use WebView2
	// This simplified version just creates a window
	// In a production app, you would:
	// 1. Create WebView2 environment
	// 2. Create WebView2 controller
	// 3. Get WebView2 from controller
	// 4. Navigate to URL

	// For demo, we're just creating a window that could be filled with WebView2
	win.ShowWindow(hwnd, win.SW_SHOW)
	win.UpdateWindow(hwnd)

	return hwnd, nil
}

func wndProc(hwnd uintptr, msg uint32, wParam, lParam uintptr) uintptr {
	switch msg {
	case win.WM_DESTROY:
		win.PostQuitMessage(0)
		return 0
	}
	return win.DefWindowProc(win.HWND(hwnd), msg, wParam, lParam)
}

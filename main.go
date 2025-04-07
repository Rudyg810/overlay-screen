package main

import (
	"fmt"
	"image/color"
	"log"
	"os"
	"runtime"
	"syscall"
	"time"
	"unsafe"

	"gioui.org/app"
	"gioui.org/font/gofont"
	"gioui.org/op"
	"gioui.org/op/paint"
	"gioui.org/text"
	"gioui.org/widget/material"
)

func main() {
	go func() {
		w := new(app.Window)
		w.Option(app.Title("rudus"))
		w.Option(app.Size(400, 480))
		w.Option(app.Decorated(false))

		err := run(w)
		if err != nil {
			log.Fatal(err)
		}
		os.Exit(0)
	}()
	app.Main()
}

func run(w *app.Window) error {
	th := material.NewTheme()
	th.Shaper = text.NewShaper(text.WithCollection(gofont.Collection()))
	var ops op.Ops
	once := false

	for {
		e := w.Event()
		switch e := e.(type) {
		case app.FrameEvent:
			if !once {
				go setWindowStyle()
				once = true
			}
			gtx := app.NewContext(&ops, e)
			paint.Fill(gtx.Ops, color.NRGBA{A: 0})

			title := material.H1(th, "rudus")
			title.Color = color.NRGBA{R: 127, G: 0, B: 0, A: 255}
			title.Alignment = text.Middle
			title.Layout(gtx)

			e.Frame(gtx.Ops)

		case app.DestroyEvent:
			return e.Err
		}
	}
}

func setWindowStyle() {
	if runtime.GOOS != "windows" {
		return
	}

	pid := uint32(os.Getpid())
	fmt.Println("pid", pid)
	var hwnd syscall.Handle
	for i := 0; i < 30; i++ {
		hwnd = getWindowHandleByPID(pid)
		if hwnd != 0 {
			break
		}
		time.Sleep(100 * time.Millisecond)
	}

	if hwnd == 0 {
		log.Println("Could not find HWND")
		return
	}
	fmt.Println("hwnd", hwnd)
	user32 := syscall.NewLazyDLL("user32.dll")
	setWindowPos := user32.NewProc("SetWindowPos")
	const (
		HWND_TOPMOST   = uintptr(0xFFFFFFFF)
		SWP_NOSIZE     = 0x0001
		SWP_SHOWWINDOW = 0x0040
	)

	dwmapi := syscall.NewLazyDLL("dwmapi.dll")
	dwmExtendFrame := dwmapi.NewProc("DwmExtendFrameIntoClientArea")
	type MARGINS struct {
		Left, Right, Top, Bottom int32
	}
	margins := MARGINS{-1, -1, -1, -1}
	dwmExtendFrame.Call(uintptr(hwnd), uintptr(unsafe.Pointer(&margins)))

	screenY := int32(1080 - 480)
	x := int32(0)

	setWindowPos.Call(
		uintptr(hwnd),
		HWND_TOPMOST,
		uintptr(x), uintptr(screenY),
		0, 0,
		SWP_NOSIZE|SWP_SHOWWINDOW,
	)
}

func getWindowHandleByPID(pid uint32) syscall.Handle {
	user32 := syscall.NewLazyDLL("user32.dll")
	enumWindows := user32.NewProc("EnumWindows")
	getWindowThreadProcessId := user32.NewProc("GetWindowThreadProcessId")
	getWindowTextW := user32.NewProc("GetWindowTextW")
	isWindowVisible := user32.NewProc("IsWindowVisible")

	var hwnd syscall.Handle

	cb := syscall.NewCallback(func(h syscall.Handle, lparam uintptr) uintptr {
		var windowPID uint32
		getWindowThreadProcessId.Call(uintptr(h), uintptr(unsafe.Pointer(&windowPID)))
		if windowPID == pid {
			buf := make([]uint16, 256)
			getWindowTextW.Call(uintptr(h), uintptr(unsafe.Pointer(&buf[0])), uintptr(len(buf)))
			title := syscall.UTF16ToString(buf)
			isVisible, _, _ := isWindowVisible.Call(uintptr(h))
			if isVisible != 0 && title != "" {
				hwnd = h
				return 0
			}
		}
		return 1
	})

	enumWindows.Call(cb, 0)

	return hwnd
}

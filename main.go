package main

import (
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

		if runtime.GOOS == "windows" {
			go func() {
				time.Sleep(500 * time.Millisecond)
				setWindowAlwaysOnTop("rudus")
			}()
		}

		err := run(w)
		if err != nil {
			log.Fatal(err)
		}
		os.Exit(0)
	}()
	app.Main()
}

func setWindowAlwaysOnTop(title string) {
	if runtime.GOOS != "windows" {
		return
	}

	user32 := syscall.NewLazyDLL("user32.dll")
	findWindow := user32.NewProc("FindWindowW")
	setWindowPos := user32.NewProc("SetWindowPos")
	getDesktopWindow := user32.NewProc("GetDesktopWindow")
	getWindowRect := user32.NewProc("GetWindowRect")

	const (
		HWND_TOPMOST   = uintptr(0xFFFFFFFF)
		SWP_NOSIZE     = 0x0001
		SWP_SHOWWINDOW = 0x0040
	)

	type RECT struct {
		Left   int32
		Top    int32
		Right  int32
		Bottom int32
	}

	desktop, _, _ := getDesktopWindow.Call()
	var rect RECT
	getWindowRect.Call(desktop, uintptr(unsafe.Pointer(&rect)))
	screenHeight := rect.Bottom

	for {
		titlePtr, _ := syscall.UTF16PtrFromString(title)
		hwnd, _, _ := findWindow.Call(0, uintptr(unsafe.Pointer(titlePtr)))

		if hwnd != 0 {
			setWindowPos.Call(
				hwnd,
				HWND_TOPMOST,
				0, uintptr(screenHeight-480),
				0, 0,
				uintptr(SWP_NOSIZE|SWP_SHOWWINDOW),
			)
		}

		time.Sleep(100 * time.Millisecond)
	}
}

func run(w *app.Window) error {
	th := material.NewTheme()
	th.Shaper = text.NewShaper(text.WithCollection(gofont.Collection()))

	var ops op.Ops
	for {
		e := w.Event()
		switch e := e.(type) {
		case app.FrameEvent:
			gtx := app.NewContext(&ops, e)

			bg := color.NRGBA{R: 255, G: 255, B: 255, A: 25}
			paint.Fill(gtx.Ops, bg)

			title := material.H1(th, "rudus")
			maroon := color.NRGBA{R: 127, G: 0, B: 0, A: 255}
			title.Color = maroon
			title.Alignment = text.Middle
			title.Layout(gtx)

			e.Frame(gtx.Ops)
		case app.DestroyEvent:
			return e.Err
		}
	}
}

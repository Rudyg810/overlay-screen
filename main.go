package main

import (
	"github.com/zserge/lorca"
	"time"
)

func main() {
	w := webview.New(true)
	defer w.Destroy()
	w.SetTitle("Google")
	w.SetSize(400, 480, webview.HintNone)
	w.Navigate("https://www.google.com")
	w.Run()
}

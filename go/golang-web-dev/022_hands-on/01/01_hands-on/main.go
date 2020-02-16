package main

import (
	"fmt"
	"io"
	"net/http"
)

func index(w http.ResponseWriter, _ *http.Request) {
	io.WriteString(w, "Hello from a HandleFunc #1!\n")
}

func me(w http.ResponseWriter, req *http.Request) {
	io.WriteString(w, "Lukasz Wysocki\n")
	fmt.Println(req.Header)
}

func main() {

	dog := func(w http.ResponseWriter, _ *http.Request) {
		io.WriteString(w, "Dog\n")
	}

	http.HandleFunc("/", index)
	http.HandleFunc("/me", me)
	http.HandleFunc("/dog", dog)

	http.ListenAndServe(":8080", nil)
}

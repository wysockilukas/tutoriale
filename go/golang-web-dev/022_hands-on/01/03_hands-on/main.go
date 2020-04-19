package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"text/template"
)

func index(w http.ResponseWriter, _ *http.Request) {
	io.WriteString(w, "Hello from a HandleFunc #1!\n")
}

func me(w http.ResponseWriter, req *http.Request) {
	err := tpl.ExecuteTemplate(w, "me.gohtml", "Łukasz Wysocki")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Fatalln(err)
	}
	fmt.Fprintln(w, "<h1>Any code you want in this func</h1>")
	// io.WriteString(w, "Lukasz Wysocki\n")
	// fmt.Println(req.Header)
}

var tpl *template.Template

func init() {
	tpl = template.Must(template.ParseGlob("templates/*"))
}

func main() {

	dog := func(w http.ResponseWriter, _ *http.Request) {
		io.WriteString(w, "Dog\n")
		fmt.Fprintln(w, "<h1>Any code you want in this func</h1>")
	}

	http.HandleFunc("/", index)
	http.HandleFunc("/me", me)
	http.HandleFunc("/dog", dog)

	http.ListenAndServe(":8080", nil)
}
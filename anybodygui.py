import tkinter as tk

window = tk.Tk()
greeting = tk.Label(text="Welcome to Anybody Curator")

label = tk.Label(text="Venue Name")
entry = tk.Entry()

button = tk.Button(
    text="Send",
    width=10,
    height=5,
    bg="red",
    fg="yellow",
)

greeting.pack()
label.pack()
entry.pack()
button.pack()

window.mainloop()

import tkinter as tk
from tkinter import Frame, Toplevel, Widget, ttk
from tkinter import font
from PIL import Image, ImageTk

class App(tk.Tk):
    __TEXTCOLOR = "#494b59"
    __BGCOLOR = "#ffffff"
    __TITLE = "SkyCov Client"
    __FAVICON = r"./img/serverIcon.ico"
    __HEIGHT = 540
    __WIDTH = 960
    __BGCOLOR = "#fcfafa"
    __BUTTONBGCOLOR = "#0b0d1a"
    __BUTTONFGCOLOR = "#cecfd1"
    __BUTTONBGCOLOR_AC = "#5c5e6b"
    __BUTTONFGCOLOR_AC = "#ffffff"
    __BUTTONFONT = "roboto 11 bold"
    __BGENTRY = "#fafafa"
    __FGENTRY = "#f5f5f5"
    __WRAPCOLOR = "#f0f0f0"
    __NAMEPAGECOLOR = "#494b59"
    __BOXCOLORLIST = "#c5c7d7"
    CONNECTING = "Connecting.."
    DISCONNECTED = "Disconnected"
    ERRORCONNECTION = "Error !!!"
    __USR = []
    __PADDING = 8
    __INFOITEM = 40
    __YSIZE = 0

    def __init__(self):
        tk.Tk.__init__(self)
        self.initUI()

    def initUI(self):
        self.geometry(str(self.__WIDTH) + "x" + str(self.__HEIGHT))
        self.title(self.__TITLE)
        self.iconbitmap(self.__FAVICON)
        self.resizable(width = False, height = False)

        # screen layer
        __style = ttk.Style()
        __style.configure('My.TFrame', background=self.__BGCOLOR)
        self.__screen = ttk.Frame(self, style='My.TFrame')
        self.__screen.place(height=self.__HEIGHT, width=self.__WIDTH, x = 0, y = 0)
        self.config()
        self.initFrame()
    
    def initFrame(self):
        # bannder
        __bannerImg = Image.open("./img/serverBanner.png")
        __banner = ImageTk.PhotoImage(__bannerImg)
        self.__labelImg = tk.Label(self.__screen, image=__banner, bg = self.__BGCOLOR)
        self.__labelImg.image = __banner
        self.__labelImg.place(x=self.__WIDTH/2, y=0)

        # wrapper
        self.__wrapper = tk.Frame(self.__screen, bg = self.__WRAPCOLOR)
        self.__wrapper.place(x = 16, y = 16, width=464, height=460)
        
        # name page
        self.__labelName = tk.Label(self.__wrapper, text="Clients", bg = self.__WRAPCOLOR, fg = self.__NAMEPAGECOLOR, font = "roboto 18 bold")
        self.__labelName.place(x=190, y=15)
        
        # close
        self.__closeButton = tk.Button(self.__screen, text = "Close", bg=self.__BUTTONBGCOLOR, fg=self.__BUTTONFGCOLOR, 
        activebackground=self.__BUTTONBGCOLOR_AC, activeforeground=self.__BUTTONFGCOLOR_AC, font=self.__BUTTONFONT)
        self.__closeButton.place(x=416, y=490, width=64, height=36)
        # background on entering widget
        self.__closeButton.bind("<Enter>", func=lambda e: self.__closeButton.config(
        background=self.__BUTTONBGCOLOR_AC, cursor="hand2"))
        # background color on leving widget
        self.__closeButton.bind("<Leave>", func=lambda e: self.__closeButton.config(
        background=self.__BUTTONBGCOLOR, cursor="hand2"))

        # infor wrapper
        self.__inforWrapp = tk.Frame(self.__wrapper, bg = self.__WRAPCOLOR)
        self.__inforWrapp.place(x = 14, y = 45, width=437, height=399)
        # define column
        columns = ('IP_address', 'PORT_number', 'status')
        self.__treeClients = ttk.Treeview(self.__inforWrapp, columns=columns, show='headings')
        # define headings
        self.__treeClients.heading('IP_address', text='IP address')
        self.__treeClients.heading('PORT_number', text='PORT number')
        self.__treeClients.heading('status', text='status')
        self.__treeClients.grid(row=0, column=0, sticky='nsew')
        # define column size
        self.__treeClients.column('IP_address', width=160, anchor=tk.CENTER)
        self.__treeClients.column('PORT_number', width=110, anchor=tk.CENTER)
        self.__treeClients.column('status', width=150, anchor=tk.CENTER)
        # scrollbar
        self.__scrollbar = ttk.Scrollbar(self.__inforWrapp, orient=tk.VERTICAL, command=self.__treeClients.yview)
        self.__treeClients.configure(yscroll=self.__scrollbar.set)
        self.__scrollbar.grid(row=0, column=1, sticky='ns')
        self.__inforWrapp.rowconfigure(0, weight=1)

    def creatItemClient(self, ip, port, status = "Connecting.."):
        if status == self.CONNECTING:
            clientItem = (str(ip), str(port), self.CONNECTING)
            self.__treeClients.insert('', tk.END, values=clientItem)
            self.__USR.append(clientItem)
        else:
            index = 0
            for item in self.__USR:
                if item[0] == ip and int(item[1]) == port:
                    break
                index = index + 1

            clientItem = None
            count = 0
            for clientItem in self.__treeClients.get_children():
                if count == index:
                    self.__treeClients.delete(clientItem)
                    break
                count = count + 1
            self.__USR.pop(index)

            clientItem = (str(ip), str(port), status)
            self.__treeClients.insert('', tk.END, values=clientItem)
            self.__USR.append(clientItem)


def main():
    u = App()
    u.creatItemClient("127.128.203.207", 65041)
    u.creatItemClient("127.128.203.208", 66041)
    u.creatItemClient("127.128.203.209", 64041)
    u.creatItemClient("127.128.203.207", 65045)
    u.creatItemClient("127.128.243.207", 65044)
    u.creatItemClient("127.128.213.207", 65048)
    u.creatItemClient("127.18.233.207", 65049)
    u.creatItemClient("127.18.203.207", 65054)
    u.creatItemClient("127.128.23.24", 65064)
    u.creatItemClient("128.128.23.27", 65024)
    u.creatItemClient("122.128.203.23", 65044)
    u.creatItemClient("233.128.203.23", 65044)
    u.creatItemClient("123.128.203.23", 65044)
    u.creatItemClient("112.128.203.23", 65044)
    u.creatItemClient("124.128.203.23", 65044)
    u.creatItemClient("154.128.203.23", 65044)
    u.creatItemClient("112.128.203.23", 65044)
    u.creatItemClient("134.128.203.23", 65044)
    u.creatItemClient("127.128.203.2", 65014)

    u.mainloop()

if __name__ == "__main__":
    main()
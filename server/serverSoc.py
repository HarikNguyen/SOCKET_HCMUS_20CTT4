import socket
import threading
import UI
import crawl
from userData import *

class serverSoc:
    # socket value
    __HEADER_SIZE = 64
    __FORMAT = 'utf-8'
    __PORT = 54321
    __HOST = "127.0.0.1"
    __ADDRESS = (__HOST, __PORT)

    # store clients
    __CLIENTS = []

    # trigger command
    __LOGIN = "log in"
    __SIGNUP = "sign up"
    __CONNECT = "connect"
    __DISCONNECTED = "quit"
    __TRACKING = "tracking"

    # status
    __CONNECTINGSTATUS = "Connecting.."
    __DISCONNECTEDSTATUS = "Disconnected"
    __ERRORCONNECTIONSTATUS = "Error !!!"

    __STATUSCONNECT = "Close"
    __STATUSDISCONNECT = "Start"

    __INLOGIN = "in Log In"
    __INSIGNUP = "in Sign Up"
    __INTURNUP = "in Turn Up"
    __INCONNECT = "in Connect"


    def __init__(self):
        # crawl data covid from "https://static.pipezero.com/covid/data.json"
        # declare crawl data obj
        self.crData = crawl.crawlDataCov()
        # declare UI obj
        self.ui = UI.App()
        self.ui.showSerIP(self.__HOST)
        # declare user data obj
        self.__userDB = userDB()

        # declare socket
        self.__server = None

    def receive(self, conn):
        try:
            header_msg = conn.recv(self.__HEADER_SIZE).decode(self.__FORMAT)
            if header_msg:
                header_msg_length = int(header_msg)
                msg = conn.recv(header_msg_length).decode(self.__FORMAT)
                print(msg)
                return msg
        except:
            return None
    
    def send(self, conn, msg): 
            message = msg.encode(self.__FORMAT)
            msg_length = len(message)
            send_length = str(msg_length).encode(self.__FORMAT)
            send_length += b' ' * (self.__HEADER_SIZE - len(send_length))
            conn.send(send_length)
            conn.send(message)
            print(message)
    def run(self):
        __isUIExist = True
        while __isUIExist:
            # init server
            if self.ui.ISONLINE:
                self.__server = socket.socket(socket.AF_INET, socket.SOCK_STREAM) 
                self.__server.bind(self.__ADDRESS)
                self.__server.listen()
                __ISRUN = True
            while __ISRUN:
                conn, addr = self.__server.accept() # conn is a pointer point to client if server connecting, addr is client's ip and port
                print(not self.ui.ISONLINE and len(self.__CLIENTS) == 0)
                if not self.ui.ISONLINE and len(self.__CLIENTS) == 0:
                    self.__server.close()
                    __ISRUN = False
                    break
                if conn.fileno() != -1:
                    self.ui.creatItemClient(addr[0], addr[1])
                    self.__CLIENTS.append((conn,addr))
                    thread = threading.Thread(target=self.handle_client, args=(conn, addr))
                    thread.daemon = True
                    thread.start()
            __isUIExist = self.ui.winfo_exists()

    def handle_client(self,conn, addr):
        try:
            __ISRUN = True
            if not self.ui.ISONLINE:
                self.send(conn, "close")
                self.__CLIENTS.remove((conn,addr))
                __ISRUN = False
            else:
                self.send(conn, "open")
                print("da handle")
            while __ISRUN:  
                if not self.ui.ISONLINE: 
                    self.send(conn, "close")
                    self.__CLIENTS.remove((conn,addr))
                    break
                else:
                    self.send(conn, "open")
                __REQUEST = self.receive(conn)

                if __REQUEST == None:
                    print(__REQUEST)
                    self.__CLIENTS.remove((conn,addr))
                    self.ui.creatItemClient(addr[0], addr[1], self.__ERRORCONNECTIONSTATUS)
                    __ISRUN = False
                    break

                if __REQUEST == self.__INLOGIN or __REQUEST == self.__INSIGNUP or __REQUEST == self.__INTURNUP:
                    pass

                # client close connect
                if __REQUEST == self.__DISCONNECTED:
                    self.__CLIENTS.remove((conn,addr))
                    self.ui.creatItemClient(addr[0], addr[1], self.__DISCONNECTEDSTATUS)
                    __ISRUN = False
                    break
                if __REQUEST == self.__SIGNUP:
                    ID = self.receive(conn)
                    if ID == None:
                        self.__CLIENTS.remove((conn,addr))
                        self.ui.creatItemClient(addr[0], addr[1], self.__ERRORCONNECTIONSTATUS)
                        __ISRUN = False
                        break
                    PASSWORD = self.receive(conn)
                    if PASSWORD == None:
                        self.__CLIENTS.remove((conn,addr))
                        self.ui.creatItemClient(addr[0], addr[1], self.__ERRORCONNECTIONSTATUS)
                        __ISRUN = False
                        break
                    try:
                        self.__userDB.showUsername(ID)
                        self.send(conn, "ID existed")                    
                    except:
                        print("chay7")
                        account = user(ID, PASSWORD)
                        self.__userDB.writeToLocal(account)
                        self.send(conn, "sign up success")                       
                    continue
                
                if __REQUEST == self.__LOGIN:
                    try:
                        ID = self.receive(conn)
                        if ID == None:
                            self.ui.creatItemClient(addr[0], addr[1], self.__ERRORCONNECTIONSTATUS)
                            self.__CLIENTS.remove((conn,addr))
                            __ISRUN = False
                            break
                        PASSWORD = self.receive(conn)
                        if PASSWORD == None:
                            self.__CLIENTS.remove((conn,addr))
                            self.ui.creatItemClient(addr[0], addr[1], self.__ERRORCONNECTIONSTATUS)
                            __ISRUN = False
                            break
                        if self.__userDB.check(ID,PASSWORD):
                            self.send(conn, "login successful")
                        else:
                            self.send(conn, "wrong password")
                    except:
                        self.send(conn, "wrong id")

                if __REQUEST == self.__TRACKING:
                    msg = self.receive(conn)
                    if msg == "NULL":
                        self.ui.creatItemClient(addr[0], addr[1], self.__ERRORCONNECTIONSTATUS)
                        self.__CLIENTS.remove((conn,addr))
                        __ISRUN = False
                        break
                    data = str(self.crData.query(msg))
                    self.send(conn, data)
            conn.close()
        except:
            conn.close()
            self.__CLIENTS.remove((conn,addr))
            self.ui.creatItemClient(addr[0], addr[1], self.__ERRORCONNECTIONSTATUS)

def main():
    serv = serverSoc()
    crThread = threading.Thread(target=serv.crData.run)
    socThread = threading.Thread(target=serv.run)
    crThread.daemon = True
    socThread.daemon = True
    crThread.start()
    socThread.start()

    serv.ui.run()

if __name__ == "__main__":
    main()
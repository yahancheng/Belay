

function Header() {
    return (
      <header>
        <p>Belay</p>
      </header>
    )
}

class Login extends React.Component {
    render() {
        if(!this.props.isLoggedIn && !this.props.isSignup) {
            this.props.autoLogin();
            return (
                <div id="login" className="loginBlock">
                    <h2 className="loginTitle">Welcome back!</h2>
                    <div>
                        <div className="inputblock">
                        <label htmlFor="email">Email:</label>
                        <input id="email" value={this.props.email} onChange={this.props.emailHandler} className="loginInput"></input>
                        </div>
                        <div className="inputblock">
                        <label htmlFor="password">Password:</label>
                        <input id="password" type="password" value={this.props.password} onChange={this.props.passwordHandler} className="loginInput"></input>
                        </div>
                        <button value="login" onClick={this.props.loginHandler} className="loginButton">Log In</button>
                        <button onClick={this.props.signupOnChange} className="loginButton2">New user?</button>
                    </div>
                </div>
            )
        } else {
            return (
                <div></div>
            )
        }
    }
}

class Signup extends React.Component {
    render() {
        if (!this.props.isLoggedIn && this.props.isSignup) {
            this.props.autoLogin();
            return (
                <div id="signup" className="loginBlock">
                    <h2 className="loginTitle">Hello, new friend!</h2>
                    <div>
                        <div className="inputblock">
                        <label htmlFor="email">Email:</label>
                        <input id="email" value={this.props.email} onChange={this.props.emailHandler} className="loginInput"></input>
                        </div>
                        <div className="inputblock">
                        <label htmlFor="username">Username:</label>
                        <input id="username" value={this.props.username} onChange={this.props.usernameHandler} className="loginInput"></input>
                        </div>
                        <div className="inputblock">
                        <label htmlFor="password">Password:</label>
                        <input id="password" type="password" value={this.props.password} onChange={this.props.passwordHandler} className="loginInput"></input>
                        </div>
                        <button value="signup" onClick={this.props.signupHandler} className="loginButton">Sign up</button>
                        <button onClick={this.props.signupOnChange} className="loginButton2">Have an account?</button>
                    </div>
                </div>
            )
        } else {
            return (
                <div></div>
            )
        }
    }
}

class Edit extends React.Component {
    render () {
        if (this.props.isLoggedIn && !this.props.isEdit) {
            return (
                <div>
                    <button onClick={this.props.editOnChange} className="updateButton">Edit user info</button>
                    <button onClick={this.props.logoutHandler} className="updateButton">Log out</button>
                </div>
            )
        } else if (this.props.isLoggedIn && this.props.isEdit) {
            return (
                <div>
                    <div className="editblock">
                        <label htmlFor="updateEmail">Update email:</label>
                        <input id="updateEmail" onChange={this.props.emailHandler} className="editInput"></input>
                        <button onClick={this.props.updateEmailHandler} className="updateButton">Update email</button>
                    </div>
                    <div className="editblock">
                        <label htmlFor="updateUsername">Update username:</label>
                        <input id="updateUsername" onChange={this.props.usernameHandler} className="editInput"></input>
                        <button onClick={this.props.updateUsernameHandler} className="updateButton">Update username</button>
                    </div>
                    <div className="editblock">
                        <label htmlFor="updatePasswordOld">Original password:</label>
                        <input id="oldPassword" type="password" onChange={this.props.oldPasswordHandler} className="editInput"></input>
                        <label htmlFor="updatePasswordNew">  New password:</label>
                        <input id="newPassword" type="password" onChange={this.props.newPasswordHandler} className="editInput"></input>
                        <button onClick={this.props.updatePasswordHandler} className="updateButton">Update password</button>
                    </div>
                    <button onClick={this.props.editOnChange} className="updateButton">Close</button>
                </div>
            )
        } else {
            return (
                <div></div>
            )
        }

    }
}

class Panel extends React.Component {
    constructor(props) {
        super(props);
        this.usernameHandler = this.usernameHandler.bind(this);
        this.passwordHandler = this.passwordHandler.bind(this);

        this.emailHandler = this.emailHandler.bind(this);
        this.loginHandler = this.loginHandler.bind(this);
        this.logoutHandler = this.logoutHandler.bind(this);
        this.signupHandler = this.signupHandler.bind(this);

        this.oldPasswordHandler = this.oldPasswordHandler.bind(this);
        this.newPasswordHandler = this.newPasswordHandler.bind(this);

        this.updateEmailHandler = this.updateEmailHandler.bind(this);
        this.updateUsernameHandler = this.updateUsernameHandler.bind(this);
        this.updatePasswordHandler = this.updatePasswordHandler.bind(this);
        this.signupOnChange = this.signupOnChange.bind(this);
        this.editOnChange = this.editOnChange.bind(this);

        this.autoLogin = this.autoLogin.bind(this);
        this.state = {
            username: '',
            email: '',
            user_id: '',
            isLoggedIn: false,
            isSignup: false,
            isEdit: false,
            oldPassword: '',
            newPassword: ''
        }
    }

    usernameHandler(e) {
        this.setState({username: e.target.value});
    }
    passwordHandler(e) {
        this.setState({password: e.target.value});
    }
    emailHandler(e) {
        this.setState({email: e.target.value});
    }
    oldPasswordHandler(e) {
        this.setState({oldPassword: e.target.value});
    }
    newPasswordHandler(e) {
        this.setState({newPassword: e.target.value});
    }

    signupOnChange() {
        this.setState({isSignup: !this.state.isSignup});
    }
    editOnChange() {
        this.setState({isEdit: !this.state.isEdit});
    }

    loginHandler() {
        console.log("im at login handler");
        const email = this.state.email;
        const password = this.state.password;

        fetch("http://127.0.0.1:5000/api/login", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: email, password: password})
        }).then((response) => {
        if(response.status == 200) {
            response.json().then((data) => {
                window.localStorage.setItem("session_token", data["token"]);
                window.localStorage.setItem("user_id", data["user_id"]);
                this.setState({isLoggedIn: true, user_id: data["user_id"]});
            });
        } else {
                alert("Login failed")
                this.logoutHandler();
            }
        }).catch((response) =>{
            this.logoutHandler();
        })
    }

    logoutHandler() {
        window.localStorage.removeItem("session_token");
        window.localStorage.removeItem("user_id");
        this.setState({isLoggedIn: false});
        history.pushState("", "", 'http://127.0.0.1:5000/')
    }

    signupHandler() {
        const username = this.state.username;
        const password = this.state.password;
        const email = this.state.email;

        fetch("http://127.0.0.1:5000/api/signup", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: username, password: password, email: email})
        }).then((response) => {
        if(response.status == 200) {
            response.json().then((data) => {
                window.localStorage.setItem("session_token", data["token"]);
                window.localStorage.setItem("user_id", data["user_id"]);
                this.setState({isLoggedIn: true, user_id: data["user_id"]});
            });
        } else {
                console.log(response.status);
                alert("Sign up failed")
            }
        }).catch((response) =>{
            console.log(response);
        })
    }

    updateEmailHandler() {
        const userId = this.state.user_id;
        const email = this.state.email;
        const token = window.localStorage.getItem("session_token")

        fetch("http://127.0.0.1:5000/api/editEmail", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: userId, email: email, token: token})
        }).then((response) => {
        if(response.status == 200) {
            alert("email changed!");
        } else {
            alert("Fail to change email");
        }})
    }

    autoLogin() {
        const userId = localStorage.getItem('user_id');
        if (userId !== null) {
            this.setState({user_id: userId, isLoggedIn: true})
        }
    }

    updateUsernameHandler() {
        const username = this.state.username;
        const userId = this.state.user_id;
        const token = window.localStorage.getItem("session_token")

        fetch("http://127.0.0.1:5000/api/editUsername", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: userId, username:username, token: token})
        }).then((response) => {
        if(response.status == 200) {
            alert("username changed!");
        } else {
            alert("Fail to change username");
        }})
    }

    updatePasswordHandler() {
        const userId = this.state.user_id;
        const oldPassword = this.state.oldPassword;
        const newPassword = this.state.newPassword;
        const token = window.localStorage.getItem("session_token")

        fetch("http://127.0.0.1:5000/api/editPassword", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: userId, oldPassword: oldPassword, newPassword: newPassword, token: token})
        }).then((response) => {
        if(response.status == 200) {
            alert("Password changed!");
        } else {
            alert("Please check original password");
        }})
    }

    render() {
        return (
            <div>
                <Header />
                <Login 
                    isLoggedIn={this.state.isLoggedIn}
                    isSignup={this.state.isSignup}
                    email={this.state.email}
                    passwordHandler={this.passwordHandler}
                    emailHandler={this.emailHandler}
                    loginHandler={this.loginHandler}
                    signupOnChange={this.signupOnChange}
                    autoLogin={this.autoLogin}
                />
                <Signup
                    isLoggedIn={this.state.isLoggedIn}
                    isSignup={this.state.isSignup}
                    usernameHandler={this.usernameHandler}
                    passwordHandler={this.passwordHandler}
                    emailHandler={this.emailHandler}
                    signupHandler={this.signupHandler}
                    signupOnChange={this.signupOnChange}
                    autoLogin={this.autoLogin}
                />
                <Edit
                    isLoggedIn={this.state.isLoggedIn}
                    isEdit={this.state.isEdit}
                    editOnChange={this.editOnChange}
                    passwordHandler={this.passwordHandler}
                    emailHandler={this.emailHandler}
                    usernameHandler={this.usernameHandler}
                    oldPasswordHandler={this.oldPasswordHandler}
                    newPasswordHandler={this.newPasswordHandler}
                    updateEmailHandler={this.updateEmailHandler}
                    updatePasswordHandler={this.updatePasswordHandler}
                    updateUsernameHandler={this.updateUsernameHandler}
                    logoutHandler={this.logoutHandler}
                    oldPassword={this.state.oldPassword}
                    newPassword={this.state.newPassword}
                />
                <div id="panel" className="panel">
                    <ChannelSection 
                        user_id={this.state.user_id}
                        isLoggedIn={this.state.isLoggedIn}
                        updateEmailHandler={this.updateEmailHandler}
                        updateUsernameHandler={this.updateUsernameHandler}
                    />
                </div>
            </div>
        )
    }
}

class ChannelRow extends React.Component {
    render() {
        var unread = "";
        if (this.props.channelUnread > 0) {
            unread = <div className="numberUnread">{this.props.channelUnread}</div>
        } 
        return (
            <div className="channelRow">
                <a onClick={()=>{this.props.enterChannelHandler(this.props.channelId, this.props.channelUnread)}} className="channelLink">
                    # {this.props.channelName}  {unread}
                </a>
            </div>
        );
    }
}

class ChannelSection extends React.Component {
    constructor(props) {
        super(props);
        this.interval = setInterval(()=>{this.showChannelList()}, 3000);
        this.enterChannelHandler = this.enterChannelHandler.bind(this);
        this.closeMessageHandler = this.closeMessageHandler.bind(this);
        this.state = {
            channels: [],
            ids: [],
            unreads: [],
            channelId: 0,
            channelUnread: 0
        }
    }
    componentDidMount() {
        this.showChannelList();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    showChannelList() {
        fetch("http://127.0.0.1:5000/api/channel", {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'user_id': this.props.user_id}
        }).then((response) => {
        if(response.status == 200) {
            response.json().then((data) => {
                this.setState({channels: data["channelList"], ids: data["idList"], unreads: data["unreadList"]})
            });
        } else {
            console.log("Fail to load channels");
        }})
    }

    enterChannelHandler(chaId, chaUnread) {
        this.setState({channelId: chaId, channelUnread: chaUnread});
        history.pushState("", "", 'http://127.0.0.1:5000/chat/'+chaId.toString())
    }

    closeMessageHandler() {
        this.setState({channelId: 0, channelUnread: 0});
        history.pushState("", "", 'http://127.0.0.1:5000')
    }

    addChannelHandler() {
        const user_id = this.props.user_id;
        const channelName = document.getElementById("newChannel").value;
        const token = window.localStorage.getItem("session_token")

        // check name
        let patt = /^(\w)+$/;
        if (patt.test(channelName)) {
            console.log("channel name pass")
            fetch("http://127.0.0.1:5000/api/channel", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({user_id: user_id, channel: channelName, token: token})
            }).then((response) => {
            if(response.status == 200) {
                document.getElementById("newChannel").value = "";
                alert("Add a new channel!");
            } else {
                alert("Fail to add channel");
            }})
        } else {
            alert("Channel name can only include numbers, letters, and underscore")
        }
    }

    remainInChannel() {
        const url = window.location.href;
        const urlList = url.split("/");
        if (urlList.length == 5) {
            this.setState({channelId: parseInt(urlList[urlList.length -1])});
        }
    }

    render() {
        if (this.props.isLoggedIn && this.state.channelId == 0) {
            this.remainInChannel();
            const renderRows = []
            const rows = this.state.channels;
            var i;
            for (i=0; i<rows.length; i++) {
                renderRows.push(
                    <ChannelRow 
                        key={this.state.ids[i]}
                        channelName={this.state.channels[i]}
                        channelId={this.state.ids[i]}
                        enterChannelHandler={this.enterChannelHandler}
                        channelUnread={this.state.unreads[i]}
                        showMsg={this.state.showMsg}
                    />
                )
            }

            return (
                <div className="channel">
                    <h2 className="sessionTitle">Channel</h2>
                    <div className="inputblock">
                        <input id="newChannel" placeholder="new channel name" className="loginInput"></input>
                        <button onClick={() => this.addChannelHandler()} className="updateButton">Create Channel</button>
                    </div>
                    <div className="channelTable">
                        {renderRows}
                    </div>
                </div>
            );
        } else if(this.props.isLoggedIn) {
            const renderRows = []
            const rows = this.state.channels;
            var i;
            for (i=0; i<rows.length; i++) {
                renderRows.push(
                    <ChannelRow 
                        key={this.state.ids[i]}
                        channelName={this.state.channels[i]}
                        channelId={this.state.ids[i]}
                        enterChannelHandler={this.enterChannelHandler}
                        channelUnread={this.state.unreads[i]}
                    />
                )
            }

            return (
                <div className="channel">
                    <div className="channelParent">
                        <div className="channelChild">
                            <h2 className="sessionTitle">Channel</h2>
                            <div className="inputblock">
                                <input id="newChannel" placeholder="new channel name" className="loginInput"></input>
                                <button onClick={() => this.addChannelHandler()} className="updateButton">Create Channel</button>
                            </div>
                            <div className="channelTable">
                                {renderRows}
                            </div>
                        </div>
                        <div className="message">
                            <div className="messageParent">
                                <MessageSection
                                    channelId={this.state.channelId}
                                    ids={this.state.ids}
                                    unreads={this.state.unreads}
                                    isLoggedIn={this.props.isLoggedIn}
                                    user_id={this.props.user_id}
                                    channels={this.state.channels}
                                    closeMessageHandler={this.closeMessageHandler}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                </div>
            )
        }
    }
}

class MessageRow extends React.Component {
    render () {
        var replies;
        if (this.props.replyNum == 0) {
            replies = "Reply in thread"
        } else {
            replies = this.props.replyNum.toString() + " replies"
        }

        const message = this.props.message;
        var msgLst = message;
        if (message.includes("http")) {
            var i;
            msgLst = message.split(" ");
            for (i = 0; i<msgLst.length; i++) {
                if (new RegExp("[a-zA-Z\d]+://(\w+:\w+@)?([a-zA-Z\d.-]+\.[A-Za-z]{2,4})(:\d+)?(/.*)?").test(msgLst[i])
                    && msgLst[i].match(/\.(jpeg|jpg|png|gif)/g)) {
                    msgLst[i] = <p><img className="msgImg" src={msgLst[i]} /></p>
                } else {
                    msgLst[i] = <nobr>{" " + msgLst[i]} </nobr>
                }
            }
        } 

        return (
            <div className="MessageRow">
                <div className="messageUsername">{this.props.username}:</div>
                <div className="messageBody">
                    {msgLst}
                </div>
                <div>
                    <a onClick={()=>{this.props.handler(this.props.msg_id)}} className="replyInThread">
                        {replies}
                    </a>
                </div>
            </div>
        )
    }
}


class MessageSection extends React.Component {
    constructor(props) {
        super(props);
        this.showThreadHandler = this.showThreadHandler.bind(this);
        this.closeThreadHandler = this.closeThreadHandler.bind(this);
        // this.interval = setInterval(()=>{this.showMessages()}, 5000);
        this.state = {
            messages: [],
            msg_id: [],
            users: [],
            replyNum: [],
            channelId: 0,
            showThread: false,
            curMsg: 0
        }
    }

    componentDidMount() {
        this.showMessages();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.channelId !== this.state.channelId) {
            this.showMessages();
        }
    }

    showThreadHandler(msg_id) {
        this.setState({
            showThread: true, 
            curMsg: msg_id
        })
    }

    showMessages() {
        console.log("show message")
        const channelId = this.props.channelId;
        const userId = this.props.user_id;
        fetch("http://127.0.0.1:5000/api/message", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', 
                'channelId': channelId,
                'userId': userId}
        }).then((response) => {
        if(response.status == 200) {
            response.json().then((data) => {
                this.setState({
                    messages: data['messages'],
                    msg_id: data['msg_id'],
                    users: data['users'],
                    channelId: parseInt(data['channel_id']),
                    replyNum: data['reply_num']
                })
            });
        } else {
            // alert("Fail to load messages");
        }})
    }

    addMessage() {
        const channelId = this.state.channelId;
        const userId = this.props.user_id;
        const body = document.getElementById("newMessage").value;
        const token = window.localStorage.getItem("session_token");

        fetch("http://127.0.0.1:5000/api/message", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: userId, channel_id: channelId, msg: body, token: token})
        }).then((response) => {
        if(response.status == 200) {
            document.getElementById("newMessage").value = "";
            this.showMessages();
        } else {
            alert("Fail to send message, try log in again!");
        }})
    }

    deleteChannelHandler() {
        const userId = this.props.user_id;
        const channelId = this.state.channelId;
        const token = window.localStorage.getItem("session_token");
        
        fetch("http://127.0.0.1:5000/api/deleteChannel", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: userId, channel_id: channelId, token: token})
        }).then((response) => {
        if(response.status == 200) {
            response.json().then((data) => {
                alert(data['message']);
                this.props.channelName = "";
            });
        } else {
            alert("Fail to delete channel, try log in again!");
        }})
    }

    closeThreadHandler() {
        this.setState({showThread: false});
    }


    render() {
        if(this.props.isLoggedIn && this.props.channelId !== 0) {
            const renderRows = [];
            var replies;
            var i;
            for (i = 0; i < this.state.messages.length; i++) {
                if (this.state.replyNum[i] == 0) {
                    replies = "Reply in thread"
                } else {
                    replies = this.state.replyNum[i].toString() + " replies"
                }
                renderRows.push(
                    <MessageRow 
                        key={this.state.msg_id[i]}
                        username={this.state.users[i]}
                        message={this.state.messages[i]}
                        msg_id={this.state.msg_id[i]}
                        handler={this.showThreadHandler}
                        replyNum={this.state.replyNum[i]}
                    />
                )
            }
            if (renderRows.length < 1) {
                renderRows.push(<div>No message</div>);
            }

            const chaId = (element) => element == this.props.channelId;
            const unreadId = this.props.ids.findIndex(chaId);
            var newMessage=<div></div>;
            if (this.props.unreads[unreadId] != 0) {
                newMessage = <button onClick={() => this.showMessages()} className="updateButton">{this.props.unreads[unreadId]} new messages</button>;
            }

            var colStyle = "";

            if (this.state.showThread) {
                colStyle = {gridColumnEnd: 2};
            } else {
                colStyle = {gridColumnEnd: 3};
            }

            return (
                <div className="messageGrid">
                    <div className="messageChild" style={colStyle}>
                        <button onClick={() => this.props.closeMessageHandler()} className="closeMessageButton">X</button>
                        <h2 className="channelTitle">
                            {"#"+this.props.channels[unreadId]} {"  "}
                            <button onClick={() => this.deleteChannelHandler()} className="messageButton">Delete Channel</button>
                        </h2>
                        <div className="messageBlock">{renderRows}</div>
                        <div className="messageBottom">
                            {newMessage}
                            <input id="newMessage" placeholder="new message"></input>
                            <button onClick={() => this.addMessage()} className="messageButton">Send</button>
                        </div>
                    </div>
                    <Thread
                        showThread={this.state.showThread}
                        msgId={this.state.curMsg}
                        user_id={this.props.user_id}
                        channel_id={this.state.channelId}
                        closeThreadHandler={this.closeThreadHandler}
                    />
                </div>
            );
        } else {
            return (<div></div>)
        }
    }
}

class Thread extends React.Component {
    constructor(props) {
        super(props);
        this.interval = setInterval(()=>{this.showThreadMessages()}, 2000);
        this.state = {
            messages: [],
            msg_id: [],
            users: [],
            mainUser: '',
            mainMsg: ''
        }
    }

    componentDidMount() {
        this.showThreadMessages();
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    showThreadMessages() {
        const msg_id = this.props.msgId;
        fetch("http://127.0.0.1:5000/api/thread", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', 
                'msg_id': msg_id}
        }).then((response) => {
        if(response.status == 200) {
            response.json().then((data) => {
                this.setState({
                    messages: data['messages'],
                    users: data['users'],
                    mainUser: data['mainUser'],
                    mainMsg: data['mainMsg']
                })
            });
        } else {
            // alert("Fail to load messages");
        }})
    }

    addThreadMessage() {
        const userId = this.props.user_id;
        const parentId = this.props.msgId;
        const channelId = this.props.channel_id;
        const body = document.getElementById("newThreadMessage").value;
        const token = window.localStorage.getItem("session_token");

        fetch("http://127.0.0.1:5000/api/thread", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: userId, 
                parent_id: parentId,
                channel_id: channelId, 
                msg: body,
                token: token})
        }).then((response) => {
        if(response.status == 200) {
            document.getElementById("newThreadMessage").value = "";
            
        } else {
            alert("Fail to send message, try log in again!");
        }})
    }

    render() {
        if (this.props.showThread) {
            const threadRows = [];
            var i;

            const mainMessage = this.state.mainMsg;
            var mainMsgLst = mainMessage;
            if (mainMessage.includes("http")) {
                var i;
                mainMsgLst = mainMessage.split(" ");
                for (i = 0; i<mainMsgLst.length; i++) {
                    if (new RegExp("[a-zA-Z\d]+://(\w+:\w+@)?([a-zA-Z\d.-]+\.[A-Za-z]{2,4})(:\d+)?(/.*)?").test(mainMsgLst[i])
                        && mainMsgLst[i].match(/\.(jpeg|jpg|png|gif)/g)) {
                        mainMsgLst[i] = <p><img className="msgImg" src={mainMsgLst[i]} /></p>
                    } else {
                        mainMsgLst[i] = <nobr>{" " + mainMsgLst[i]} </nobr>
                    }
                }
            } 



            for (i=0; i<this.state.messages.length; i++) {
                const message = this.state.messages[i];
                var msgLst = message;
                if (message.includes("http")) {
                    var j;
                    msgLst = message.split(" ");
                    for (j = 0; j<msgLst.length; j++) {
                        console.log(msgLst[j]);
                        if (new RegExp("[a-zA-Z\d]+://(\w+:\w+@)?([a-zA-Z\d.-]+\.[A-Za-z]{2,4})(:\d+)?(/.*)?").test(msgLst[j])
                            && msgLst[j].match(/\.(jpeg|jpg|png|gif)/g)) {
                            msgLst[j] = <p><img className="msgImg" src={msgLst[j]} /></p>
                        } else {
                            msgLst[j] = <nobr>{" " + msgLst[j]} </nobr>
                        }
                    }
                } 

                threadRows.push(
                    <div>
                        <div className="replyRow">
                            <div className="replyUsername">{this.state.users[i]}:</div>
                            <div className="replyBody">
                                {msgLst}
                            </div>
                        </div>
                    </div>
                )
            }

            return (
                <div className="thread">
                    <h2 className="sessionTitle">
                        Thread
                    </h2>
                    <button onClick={() => this.props.closeThreadHandler()} className="closeButton">X</button>
                    <div>
                        <div className="replyTo">Reply to:</div>
                        <div className="MessageRow">
                            <div className="messageUsername">{this.state.mainUser}:</div>
                            <div className="messageBody">
                                {mainMsgLst}
                            </div>
                        </div>
                    </div>
                    <hr></hr>
                    <div className="threadBlock">
                        {threadRows}
                    </div>
                    <div>
                        <input id="newThreadMessage" placeholder="new message" className="loginInput"></input>
                        <button onClick={() => this.addThreadMessage()} className="messageButton">Send</button>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                </div>
            )
        }
    }
}


  
  // ========================================
  
  
  ReactDOM.render(
    React.createElement(Panel),
    document.getElementById('root')
  );
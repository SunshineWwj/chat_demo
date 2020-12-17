const express=require('express');
const app=express();

var _ = require('underscore');
const server = require('http').Server(app);

const fs=require('fs');
const path=require('path');
const io = require('socket.io')(server,{ cors: true });  //此处{cors:true}，为了解决跨域问题



const users = [];                    //用来保存所有的用户信息
let usersNum = 0;

server.listen(3000,()=>{
    console.log("server running at 127.0.0.1:3000"); 
})

app.get('/',(req,res)=>{
    res.redirect('/chat.html'); // express的重定向函数。如果浏览器请求了根路由'/',浏览器就给他重定向到 '127.0.0.1:3000/chat.html'路由中
})

/**
 * __dirname表示当前文件所在的绝对路径，所以我们使用path.join将app.js的绝对路径和public加起来就得到了public的绝对路径。
 * 用path.join是为了避免出现 ././public 这种奇怪的路径
 * express.static就帮我们托管了public文件夹中的静态资源。
 * 只要有 127.0.0.1：3000/XXX/AAA 的路径都会去public文件夹下找XXX文件夹下的AAA文件然后发送给浏览器。
*/

app.use('/',express.static(path.join(__dirname,'./public')));

/*socket*/
io.on('connection',(socket)=>{   //监听客户端的连接事件
    /**
     * 所有有关socket事件的逻辑都在这里写
     */
    usersNum++;
    console.log(`当前有${usersNum}个用户连接上服务器`);

    socket.on('login',data=>{
        //讲该用户的信息存入数组中
        users.push({
            username:data.username,
            userId:socket.id,
            message:[]
        })

        //然后触发loginSuccess事件告诉浏览器登陆成功了
        socket.emit('loginSuccess',data);   //将data原封不动的再发给该浏览器

    })
    //监听sendMessage
    socket.on('sendMessage',(data)=>{
        for(let user of users){
            if(user.username===data.username){
                user.message.push(data.message);
                //信息存储之后，触发receiveMessage将信息发送给所有浏览器
                io.emit('receiveMessage',data);
                break;
            }
        }
    })

    socket.on('sendMessageTo',(data)=>{
        for(let user of users){
            if(user.username===data.receiveName){
                socket.to(user.userId).emit('sbReceiveMsg',data);
                break;
            }
        }
    })
    
    //断开连接后做的事情
    socket.on('disconnect',()=>{          //注意，该事件不需要自定义触发器，系统会自动调用
        usersNum --;
        console.log(`当前还剩${usersNum}个用户连接服务器`);
    })

    

});           
    

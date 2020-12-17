
$(function(){
    const url='http://127.0.0.1:3000';

    let socket=io.connect(url)

    let username=null;
    let inputName=$('#name');
    let loginBtn=$('#loginBtn');
    let chatInput=$('#chatInput');
    const sendToName=$('#sendToVal');//消息发送的接收人

    setUserName = () =>{
        username=inputName.val().trim();//获取到输入框中的用户名
        if(username){
            socket.emit('login',{username});//如果用户名存在，即可以登录，我们就触发登录事件，就相当于告诉服务器我们要登录了
        }
    }
    loginBtn.on('click',()=>{
        setUserName();
    })

    inputName.on('keyup',(event)=>{  //监听输入框的回车事件，这样用户回车也能登录。
        if(event.keyCode===13){   //如果用户输入的是回车键，就执行setUsername函数
            setUserName();
        }
    })

    socket.on('loginSuccess',data=>{
        /**
         * 如果服务器返回的用户名和刚刚发送的相同的话，就登录
         * 否则说明有地方出问题了，拒绝登录
         */
        if(data.username===username){
            beginChat(data);
        }else{
            alert('用户名不匹配，请重试')
        }
    })
    beginChat = () =>{
        //1.隐藏登录狂，取消其绑定的事件
        //2.显示聊天界面
        $('#loginBox').hide('slow');
        inputName.off('keyup');
        inputName.off('click');

        //显示聊天界面
        $(`<p>欢迎你${username}</p>`).insertBefore($('#content'));
        $('#chatBox').show('slow');
    }
   //发送消息 
    sendMessage=()=>{
        /**
         * 得到输入框的聊天信息，如果不为空，就触发sendMessage
         * 将信息和用户名发送过去
         */
        const message=chatInput.val();
        const receiveName=sendToName.val().trim();
        
        if(message){
            if(receiveName){//有单独接收人
                socket.emit('sendMessageTo',{username,receiveName,message})
                showMessage({username,message})
            }else{
                socket.emit('sendMessage',{username,message})
            }
        }
    }

    //我们规定在聊天框回车的时候调用sendMessage函数
    chatInput.on('keyup',(event)=>{
        if(event.keyCode===13){
            sendMessage();
            chatInput.val('');
        }
    });

    //监听到广播，客户端监听receiveMessage事件
    socket.on('receiveMessage',data=>{
        showMessage(data);
    })

    showMessage=(data)=>{
        if(data.username===username){
            $('#content').append(`<p style='background:lightskyblue><span>${data.username}:</span> ${data.message}</p>`)
        }else{
            $('#content').append(`<p style='background:lightpink><span>${data.username}:</span> ${data.message}</p>`)
        }
    }

    //接收人接收到消息
    socket.on('sbReceiveMsg',(data)=>{
        console.log(username)
        console.log(data)
        if(data){
            $('#content').append(`<p style='background:lightpink'><span>${data.username}:</span> ${data.message}</p>`)
        }
    })
   
})



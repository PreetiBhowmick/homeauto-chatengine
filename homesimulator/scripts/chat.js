
pubnub_pub_key = 'YOUR_PUBNUB_PUBLISH_KEY';
pubnub_sub_key = 'YOUR_PUBNUB_SUBSCRIBE_KEY' 

// create a new instance of ChatEngine
ChatEngine = ChatEngineCore.create({
    publishKey: pubnub_pub_key,
    subscribeKey: pubnub_sub_key
});


var devices = ["kitchen light", "Living room light", "Portico light", "Bedroom light", "Children Room light"];
var bulbs = ['#kitchenbulb', '#livingroombulb', '#porticobulb', '#bedroombulb', '#childrenroombulb'];


// create a bucket to store our ChatEngine Chat object
let homeChat;

// create a bucket to store 
let me;


// compile handlebars templates and store them for use later
//let peopleTemplate = Handlebars.compile($("#person-template").html());
//let meTemplate = Handlebars.compile($("#message-template").html());
//let userTemplate = Handlebars.compile($("#message-response-template").html());


var user_me = {};
user_me.first = 'My Home';
user_me.last = 'A';
user_me.full = [user_me.first, user_me.last].join(" ");
user_me.uuid = 'HA';
user_me.avatar = 'house.png';
user_me.online = true;
user_me.lastSeen = Math.floor(Math.random() * 60);

// this is our main function that starts our chat app
const initChat = () =>
{

  ChatEngine.connect (user_me.uuid, user_me);


  ChatEngine.on('$.ready', function(data)
  {
    me = data.me;
    console.log(me);
    homeChat = new ChatEngine.Chat('home');
    console.log(homeChat.users);

    // when we recieve messages in this chat, render them
    homeChat.on('message', (message) => {
        //renderMessage(message);
        console.log(message);
        home_control(message);
        // emit the `message` event to everyone in the Chat

    });

    homeChat.on('$.online.*', (data) => {   
        //$('#people-list ul').append(peopleTemplate(data.user));
        console.log('User online  ' + data.uuid);
      });

      // when a user goes offline, remove them from the online list
      homeChat.on('$.offline.*', (data) => {
        //$('#people-list ul').find('#' + data.user.uuid).remove();
        console.log('User offline  ' + data.uuid);
      });

      // wait for our chat to be connected to the internet
      homeChat.on('$.connected', () => {

        console.log ("Connected");
        
      });

     
      // bind our "send" button and return key to send message
      //$('#sendMessage').on('submit', sendMessage)



  }); // end on ready

} // end of init function


// send a message to the Chat
const sendMessage = (message) => {

    // get the message text from the text input
    //let message = $('#message-to-send').val().trim();
    
    //console.log(message);
    //console.log(message);    
    // if the message isn't empty
    if (message) {

      console.log(message);
      
        // emit the `message` event to everyone in the Chat
        homeChat.emit('message', 
            message
        );

        console.log('message sent');
        
        
    }
    
    // stop form submit from bubbling
    return false;
  
};



// render messages in the list
const renderMessage = (message, isHistory = false) => {

    // use the generic user template by default
    let template = userTemplate;

    // if I happened to send the message, use the special template for myself
    if (message.sender.uuid == me.uuid) {
        template = meTemplate;
    }

    let el = template({
        messageOutput: message.text,
        time: getCurrentTime(),
        user: message.sender.state
    });
  
    // render the message
    if(isHistory) {
      $('.chat-history ul').prepend(el); 
    } else {
      $('.chat-history ul').append(el); 
    }
  
    // scroll to the bottom of the chat
    scrollToBottom();

}; 



const home_control = (m) => {
  //console.log (m);
  msg = m.data;
  var status_msg = {type: "FEEDBACK", entity: "", text: ""};
  console.log (devices.length);

  if(msg.type == "COMMAND") {

    console.log ("COMMAND Recd");

    for (i = 0; i < devices.length; i++) {
      console.log ("Checking for device " + i);
      console.log ("Entity is " + msg.entity + " and device checking for " + devices[i]);

      if (msg.entity == devices[i]) {
        status_msg.entity = msg.entity;

        if (msg.intent == "turnON") {
          $(bulbs[i]).css({ fill: "#FFDB55" });
          status_msg.text = "Turned on " + msg.entity;

          sendMessage (status_msg);
        }
        else if (msg.intent == "turnOFF") {
          $(bulbs[i]).css({ fill: "#000000" });
          status_msg.text = "Turned off " + msg.entity;
          sendMessage (status_msg);
        }
      }
    }
  }
  else {
    console.log("No action on message type: " + msg.type);
    
  }
};

// scroll to the bottom of the window
const scrollToBottom = () => {
    $('.chat-history').scrollTop($('.chat-history')[0].scrollHeight);
};

// get the current time in a nice format
const getCurrentTime = () => {
    return new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
};


// boot the app
initChat();








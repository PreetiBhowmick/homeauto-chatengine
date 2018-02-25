// allows environment properties to be set in a file named .env
require('dotenv').load({ silent: true });
bot_data = require('./conv-workspace.json')

var watson = require('watson-developer-cloud');

//console.log(bot_data.homeauto_intents);

Watson_Conv_UserName = process.env.watson_conv_username;
Watson_Conv_Password = process.env.watson_conv_password;

var conversation = new watson.ConversationV1({
  username: Watson_Conv_UserName,
  password: Watson_Conv_Password,
  version_date: '2018-02-16'
});


var workspace_id = "";

/*
conversation.listWorkspaces(function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log ("Found existing workspaces");
    //console.log(JSON.stringify(response, null, 2));
  }
 });
*/

var workspace = {
  name: 'Home automation chatbot',
  description: 'Workspace for home automation conversation bot.',
  intents: bot_data.homeauto_intents,
  entities: bot_data.homeauto_entities,
  dialog_nodes: bot_data.homeauto_dialog_nodes
};


/*
var workspace = {
  name: 'Home automation chatbot',
  description: 'Workspace for home automation conversation bot.'
};
*/

conversation.createWorkspace(workspace, function(err, response) {
  if (err) {
    console.error(err);
  } else {
  	//console.log ("Created workspace: " + response.workspace_id);
  	workspace_id = response.workspace_id;
  	console.log ("Created workspace: " + workspace_id);	//.workspace_id
    //console.log(JSON.stringify(response, null, 2));
  }
 });

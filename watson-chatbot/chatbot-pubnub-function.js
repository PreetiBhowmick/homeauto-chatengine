function process(request) {
    const base64Codec = require('codec/base64');
    const query = require('codec/query_string');
    const console = require('console');
    const xhr = require('xhr');
    const pubnub = require('pubnub');
    //console.log(request.message);
  

    if (request.message.data.type == 'REQUEST')
    {
        console.log ("Request recd");
      /*
        TODO: fill values
      */
        let watsonUsername = 'WATSON_CONVERSATION_USERNAME';
        let watsonPassword = 'WATSON_CONVERSATION_PASSWORD';
        let workspaceId = 'WATSON_CONVERSATION_WORKSPACE_ID';
        let senderName = 'PubNub Bot';
        /*
          TODO: end fill values
        */

        let version = '2018-02-16';

        // bot api url
        let apiUrl = 'https://gateway.watsonplatform.net/conversation/api/v1/workspaces/'
            + workspaceId + '/message';

        let base64Encoded = base64Codec.btoa(watsonUsername + ':' + watsonPassword);

        // bot auth
        let apiAuth = 'Basic ' + base64Encoded;

        let payload = JSON.stringify({
            input: {
                text: request.message.data.text
            }
        });

        let queryParams = {
            version
        };

        let httpOptions = {
            as: 'json',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: apiAuth
            },
            body: payload,
            method: 'post'
        };

        let url = apiUrl + '?' + query.stringify(queryParams);
        //console.log(url);
        //console.log(payload);
        
        
        return xhr.fetch(url, httpOptions)
            .then(response => {
                return response.json()
                  .then(parsedResponse => {
                      //request.message.sender = senderName;
                        //console.log(parsedResponse);
                      if (parsedResponse.output.text.length > 0) {
                          
                          
                          request.message.data.requested_text = request.message.data.text
                          //request.message.data.text = parsedResponse.output.text[0];
                          request.message.data.type = 'COMMAND';
                          request.message.data.intent = parsedResponse.intents[0].intent;
                          request.message.data.entity = parsedResponse.entities[0].value;
                          console.log("Publishing message:  " + request.message.data.type);
                          pubnub.publish({
                              channel: request.message.channel,
                              message: request.message
                              //message: parsedResponse.intents[0].intent + "  " + parsedResponse.entities[0].value
                          });
                          
                          
                          
                      } else {
                          request.message.text =
                              "Sorry I didn't understand that.";
                          pubnub.publish({
                              channel: request.message.channel,
                              message: parsedResponse.output.text
                          });
                      }

                      return request;

                  })
                  .catch(err => {
                      console.error('error during parsing', err);
                  });
            })
            .catch(err => {
                console.error('error during XHR', err);
            });

    }

    else

    {   
       
       return request.ok();

    }
}

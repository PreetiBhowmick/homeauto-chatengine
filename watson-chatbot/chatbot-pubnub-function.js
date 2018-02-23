function process(request) {
    const base64Codec = require('codec/base64');
    const query = require('codec/query_string');
    const console = require('console');
    const xhr = require('xhr');
    const pubnub = require('pubnub');
    //console.log(request.message);
    /*
      TODO: fill values
    */

    if (request.message.data.type == 'REQUEST')
    {
        console.log ("Request recd");

        let watsonUsername = '3e2c5d18-2d9d-49ba-ac6f-79f965f3af65';
        let watsonPassword = 'A0XPOAe7VB8T';
        let workspaceId = '0090b543-11b3-4909-a018-9f31d985a813';
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
                      request.message.sender = senderName;
                        //console.log(parsedResponse);
                      if (parsedResponse.output.text.length > 0) {
                          
                          
                          
                          request.message.data.text = parsedResponse.output.text[0];
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

      //pubnub.publish({
        //channel: request.message.channel,
       // message: "Not my domain"
      //});

       return request.ok();

    }
}

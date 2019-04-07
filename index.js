
var request = require("request");



// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

    // if (event.session.application.applicationId !== "") {
    //     context.fail("Invalid Application ID");
    //  }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName == "tellJoke") {
        tellJoke(intent, session, callback);
    } else if("AMAZON.StopIntent" === intentName){
         endSession(intent, session, callback);
    }else {
         throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {

}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
    var speechOutput = "You don't ask Alexa for Chuck Norris facts. Chuck Norris forces me to give you facts. Do you want to hear one?";

    var reprompt = "Do you want to hear a Chuck Norris fact?";

    var header = "Chuck Norris fact";

    var shouldEndSession = false;

    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
    };

    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));

}

function tellJoke(intent, session, callback) {

    var speechOutput = "Let's hear what Chuck Norris has to say...";
    
    var repromptText = "Do you want to hear another fact?";
    var sessionAttributes = {};
    var shouldEndSession = false;
    
    //dayValue = intent.slots.daysFromNow.value

    getJSON(function(data) {
        if (data != "ERROR") {
            //var index = Number(dayValue)
            var joke = data.value;
            
            speechOutput = joke;
        }
        
        callback(sessionAttributes,
        buildSpeechletResponse("Chuck Norris fact", speechOutput, repromptText, shouldEndSession));
        //callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", true))
    });

}

function url() {
    return "https://api.chucknorris.io/jokes/random";
}

function url2() {
    return {
        url: "https://api.nytimes.com/svc/books/v3/lists.json",
        qs: {
            "api-key" : "8430ae194d0a446a8b1b9b9d607b2acc",
            "list" : "hardcover-fiction"
        }
    };
}

function getJSON(callback) {
    // HTTP - WIKPEDIA
    //var index = Number(dayValue)
    
     request.get(url(), function(error, response, body) {
         var d = JSON.parse(body);
         //var result = d.forecast[index].usd
         var result = d;
         if (result !== "") {
             callback(result);
         } else {
             callback("ERROR");
         }
     });

    // HTTPS with NYT
    //request.get(url2(), function(error, response, body) {
       // var d = JSON.parse(body)
        //var result = d.results
        //if (result.length > 0) {
            //callback(result[0].book_details[0].title)
       // } else {
            //callback("ERROR")
        //}
    //})
}

function endSession(intent, session, callback) {
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "You don't say good bye to Chuck Norris, he turns me off instead!";

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}


// ------- Helper functions to build responses for Alexa -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

function capitalizeFirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
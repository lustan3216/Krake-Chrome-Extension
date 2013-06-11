var isActive = false;
var sessionManager = null;
var sharedKrake = null;

/***************************************************************************/
/*********************  Incoming Request Handler  **************************/
/***************************************************************************/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    switch(request.action){
      case "update_url":
   
      break;

      case "load_script":
        loadScript(request.params.filename);
      break;

      case "get_session":
        sendResponse({ session: sessionManager });
      break;

      case "add_column":
        addColumn(request.params, sendResponse);
      break;

      case "delete_column":
        deleteColumn(request.params, sendResponse);
      break;
    }//eo switch
  });

/***************************************************************************/
/************************  Browser Action Icon  ****************************/
/***************************************************************************/
var handleIconClick = function handleIconClick(tab){
   if(isActive){
     disableKrake();
     updateBrowserActionIcon();
     isActive = false;
     clearCache();

   }else{
     enableKrake();
     updateBrowserActionIcon();
     isActive = true;
     sessionManager = new SessionManager();
     sharedKrake = SharedKrake.getInstance();
   }

};//eo handleIconClick

var updateBrowserActionIcon = function(tab){
  isActive?
    chrome.browserAction.setIcon({path:"images/krake_icon_disabled_24.png"}):
    chrome.browserAction.setIcon({path:"images/krake_icon_24.png"}); 
};//eo updateBrowserActionIcon


chrome.browserAction.onClicked.addListener(handleIconClick);

/***************************************************************************/
/**************************** Action Methods  ******************************/
/***************************************************************************/
var enableKrake = function(){
  chrome.tabs.getSelected(null, function(tab){
    chrome.tabs.sendMessage(tab.id, { action : "enable_krake"}, function(response){} );
  });  
};//eo enableKrake

var disableKrake = function(){
  chrome.tabs.getSelected(null, function(tab){
    chrome.tabs.sendMessage(tab.id, { action : "disable_krake"}, function(response){} );
  });  
};//eo disableKrake

var clearCache = function(){
  var sharedKrake = null;
  var sessionManager = null;
};


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    //re-render panel using columns objects from storage if any. 
});

var loadScript = function(filename){
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.executeScript(tab.id, {file: filename}, function(){
      chrome.tabs.sendMessage(tab.id, { action: "load_script_done", params: { filename: filename } }, function(response){
        
      });
    });
  });
};//eo loadScript

var addColumn = function(params, callback){
  try{
    console.log('-- before "addColumn"');
    console.log( JSON.stringify(sessionManager) );

    sessionManager.currentColumn = ColumnFactory.createColumn(params);
    sessionManager.goToNextState();

    console.log('-- after "addColumn"');
    console.log( JSON.stringify(sessionManager) );
       
    if (callback && typeof(callback) === "function")  callback({status: 'success'});  
  }catch(err){
    concole.log("err");
    if (callback && typeof(callback) === "function")  callback({status: 'error'}); 
  }
};//eo addColumn

var deleteColumn = function(params, callback){
  try{
    console.log('-- before "deleteColumn"');
    console.log( JSON.stringify(sessionManager) );

    if(sessionManager.currentColumn.columnId == params.columnId){
      sessionManager.currentColumn = null;
      sessionManager.goToNextState('idle');
    }else{
      SharedKrakeHelper.removeColumnFromSharedKrake(params.columnId);
    }//eo if-else

    console.log('-- after "deleteColumn"');
    console.log( JSON.stringify(sessionManager) );

    if (callback && typeof(callback) === "function")  callback({status: 'success'}); 
  }catch(err){
    concole.log("err");
    if (callback && typeof(callback) === "function")  callback({status: 'error'}); 
  }
};//eo deleteColumn








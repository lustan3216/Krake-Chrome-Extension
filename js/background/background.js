var isActive = false;

var sharedKrake = 
{
  originUrl : null,
  destinationUrl : null,
  columns : []
};


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
        sendResponse({ action: "get_session_done", params: { session: sessionManager } });
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
     //clearCache();

   }else{
     enableKrake();
     updateBrowserActionIcon();
     isActive = true;
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

var loadScript = function(filename){
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.executeScript(tab.id, {file: filename}, function(){
      chrome.tabs.sendMessage(tab.id, { action: "load_script_done", params: { filename: filename } }, function(response){
        
      });
    });
  });
};//eo loadScript


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    //re-render panel using columns objects from storage if any. 
});



var column = ColumnFactory.createColumn({
  columnId: 1,
  columnType: 'list',
  url: "http://localhost"
});
console.log(JSON.stringify(column) );

for(var key in column){
  console.log("key:= " + key + ", value:= " + column[key]);
}




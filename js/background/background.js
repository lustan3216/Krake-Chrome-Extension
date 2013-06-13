var isActive = false;
var sessionManager = null;
var sharedKrake = null;
var colorGenerator = null;

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

      case 'get_column_by_id':
        getColumnById(request.params, sendResponse);
      break;

      case 'edit_current_column':
        editCurrentColumn(request.params, sendResponse);
      break;

      case 'delete_column':
        deleteColumn(request.params, sendResponse);
      break;

      case 'save_column':
        saveColumn(request.params, sendResponse);
      break;

      case 'match_pattern':
        matchPattern(sendResponse);
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
     colorGenerator = new ColorGenerator();
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
    //console.log('-- before "addColumn"');
    //console.log( JSON.stringify(sessionManager) );

    sessionManager.currentColumn = ColumnFactory.createColumn(params);
    sessionManager.goToNextState();

    //console.log('-- after "addColumn"');
    //console.log( JSON.stringify(sessionManager) );
       
    if (callback && typeof(callback) === "function")  
      callback({status: 'success', session: sessionManager});  
  }catch(err){
    console.log(err);
    if (callback && typeof(callback) === "function")  callback({status: 'error'}); 
  }
};//eo addColumn

var deleteColumn = function(params, callback){
  try{
    //console.log('-- before "deleteColumn"');
    //console.log( JSON.stringify(sessionManager) );
    var deletedColumn;

    if(sessionManager.currentColumn && sessionManager.currentColumn.columnId == params.columnId){
      deletedColumn = sessionManager.currentColumn;
      sessionManager.currentColumn = null;
      sessionManager.goToNextState('idle');
    }else{
      SharedKrakeHelper.removeColumnFromSharedKrake(params.columnId);
    }//eo if-else

    //console.log('-- after "deleteColumn"');
    //console.log( JSON.stringify(sessionManager) );

    if (callback && typeof(callback) === "function")  
      callback({status: 'success', session: sessionManager, deletedColumn: deletedColumn}); 
  }catch(err){
    console.log(err);
    if (callback && typeof(callback) === "function")  callback({status: 'error'}); 
  }
};//eo deleteColumn

/*
 * @Param: params:object { attribute:"xpath_1", values:params } 
 */
var editCurrentColumn = function(params, callback){
  try{    console.log('-- before "editCurrentColumn"');
    //console.log( JSON.stringify(sessionManager) );
   
    switch(params.attribute){
      case 'xpath_1':
        sessionManager.currentColumn.setSelection1(params.values);
        sessionManager.goToNextState().goToNextState(); //current state := 'pre_selection_2'
      break;

      case 'xpath_2':
        sessionManager.currentColumn.setSelection2(params.values);
        sessionManager.goToNextState(); //current state := 'post_selection_2'
      break;
    }//eo switch
    
    //console.log('-- after "editCurrentColumn"');
    //console.log( JSON.stringify(sessionManager) );

    if (callback && typeof(callback) === "function")  
      callback({status: 'success', session: sessionManager}); 
  }catch(err){
    console.log(err);
    if (callback && typeof(callback) === "function")  callback({status: 'error'});
  }
};//eo editCurrentColumn

var saveColumn = function(params, callback){
  try{
    //validate currentColumn
    if(sessionManager.currentColumn.validate()){
      SharedKrakeHelper.saveColumn(sessionManager.currentColumn);
      sessionManager.goToNextState('idle');

      if (callback && typeof(callback) === "function")  
        callback({status: 'success', session: sessionManager, sharedKrake: sharedKrake}); 
    }
  }catch(err){

  }
};//eo saveButton

var matchPattern = function(callback){
  try{
    //result => { status: 'success', genericXpath: array }
    var result = PatternMatcher.findGenericXpath(sessionManager.currentColumn.selection1, sessionManager.currentColumn.selection2);
    sessionManager.currentColumn.genericXpath = result.genericXpath;

    var response = {
      status : 'success',
      column : sessionManager.currentColumn
    }
    //tell content script to highlight all elements covered by generic xpath
    if (callback && typeof(callback) === "function")   callback(response); 
  }catch(err){
    console.log(err);
  }
};//eo matchPattern

var getColumnById = function(params, callback){
  try{
    console.log("getColumnById");
    console.log("sessionManager.currentColumn.id := " + sessionManager.currentColumn.id );
    console.log("params.columnId := " + params.columnId);

    if(sessionManager.currentColumn && sessionManager.currentColumn.id == params.columnId){
      var response = {
        status : 'success',
        column : sessionManager.currentColumn
      };
    
      if (callback && typeof(callback) === "function") callback(response); 
    }else{
      //search in sharedKrake for column
    }

  }catch(err){

  }
};//eo getColumnById






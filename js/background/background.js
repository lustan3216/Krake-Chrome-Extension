var isActive = false;
var sessionManager = null;
var sharedKrake = null;
var colorGenerator = null;
var krakeTabId = null;

/***************************************************************************/
/*********************  Incoming Request Handler  **************************/
/***************************************************************************/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    switch(request.action){
      case "load_script":
        loadScript(request.params.filename, sender);
      break;

      case "get_session":
        sendResponse({ session: sessionManager });
      break;

      case 'edit_session':
        editSession(request.params, sendResponse);
      break;

      case 'get_shared_krake':
        sendResponse({ sharedKrake: SharedKrake });
      break;

      case 'get_breadcrumb':
        getBreadcrumb(request.params, sendResponse);
      break;

      case "add_column":
        newColumn(request.params, sendResponse);
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

      case 'stage_column':
        stageColumn(request.params, sendResponse);
      break;

      case 'match_pattern':
        matchPattern(sendResponse);
      break;

      case 'get_krake_json':
        getKrakeJson(sendResponse);
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
     sharedKrake = SharedKrake;
     colorGenerator = new ColorGenerator();
     clearCache();
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
  SharedKrake.reset();
  var sessionManager = null;
};


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  //re-render panel using columns objects from storage if any. 
  if(isActive){
    //Remove column that is not done editing from sessionManager
    sessionManager.currentState = "idle";
    sessionManager.currentColumn = null;

    chrome.tabs.sendMessage(tabId, { action : "enable_krake"}, function(response){
      isActive = true;
      console.log("isActive: " + isActive);
    });
  }//eo if
});

var loadScript = function(filename, sender){
    chrome.tabs.executeScript(sender.tab.id, {file: filename}, function(){
      chrome.tabs.sendMessage(sender.tab.id, { action: "load_script_done", params: { filename: filename } }, function(response){
        
      });
    });
};//eo loadScript

var getKrakeJson = function(callback){
  var json = SharedKrakeHelper.createScrapeDefinitionJSON();
  if (callback && typeof(callback) === "function")  
      callback({status: 'success', krakeDefinition: json, sharedKrake: SharedKrake });
};//eo getKrakeJson

/*
 * @Param: params:object { attribute:"xpath_1", values:params } 
 */
var editSession = function(params, callback){
  try{    
    console.log('-- before "editSession"');
    console.log('session\n' + JSON.stringify(sessionManager));
    console.log('params\n' + JSON.stringify(params));
   
    switch(params.attribute){
      case 'previous_column':
      //alert("editSession.previous_column");
        if(params.event == 'detail_link_clicked'){
          console.log('if');
          //sessionManager.previousColumn = sessionManager.currentColumn;
          var previousColumn = SharedKrakeHelper.findColumnByKey('columnId', params.columnId);

        }else{
          console.log('else');
          var column = SharedKrakeHelper.findColumnByKey('elementLink', params.values.currentUrl);
          console.log( JSON.stringify(column) );
          if(column)
            sessionManager.previousColumn = SharedKrakeHelper.findColumnByKey('parentColumnId', column.parentColumnId);
        }
      break;

      case 'current_state':
        sessionManager.goToNextState(params.values.state);
      break;
    }//eo switch
    
    console.log('-- after "editSession"');
    console.log( JSON.stringify(sessionManager) );

    if (callback && typeof(callback) === "function")  
      callback({status: 'success', session: sessionManager}); 
  }catch(err){
    console.log(err);
    if (callback && typeof(callback) === "function")  callback({status: 'error'});
  }
};//eo editSession

var newColumn = function(params, callback){
  try{
    console.log('-- before "addColumn"');
    //console.log( JSON.stringify(sessionManager) );

    var previousColumn = SharedKrakeHelper.findColumnByKey('url', params.url); 
    console.log('-- previousColumn\n' + JSON.stringify(previousColumn));

    sessionManager.currentColumn = ColumnFactory.createColumn(params);
    sessionManager.currentColumn.parentColumnId = sessionManager.previousColumn?  
                                                  sessionManager.previousColumn.columnId : null;

    if(previousColumn){
      sessionManager.previousColumn = previousColumn;
      sessionManager.currentColumn.parentColumnId = previousColumn.parentColumnId;
    }

    sessionManager.goToNextState();

    console.log('-- after "addColumn"');
    console.log( JSON.stringify(sessionManager) );
       
    if (callback && typeof(callback) === "function")  
      callback({status: 'success', session: sessionManager});  
  }catch(err){
    console.log(err);
    if (callback && typeof(callback) === "function")  callback({status: 'error'}); 
  }
};//eo addColumn

var deleteColumn = function(params, callback){
  //try{
    console.log('-- before "deleteColumn"');
    //console.log( JSON.stringify(SharedKrake) );
    var deletedColumn;

    if(sessionManager.currentColumn && sessionManager.currentColumn.columnId == params.columnId){
      //console.log('if');
      deletedColumn = sessionManager.currentColumn;
      sessionManager.currentColumn = null;
      sessionManager.goToNextState('idle');
    }else{
      //console.log('else');
      deletedColumn = SharedKrakeHelper.removeColumn(params.columnId);
    }//eo if-else
    sessionManager.currentColumn = null;
    console.log('-- after "deleteColumn"');
    //console.log( JSON.stringify(SharedKrake) );
    //console.log('-- deletedColumn');
    //console.log( JSON.stringify(deletedColumn) );

    if (callback && typeof(callback) === "function")  
      callback({status: 'success', session: sessionManager, deletedColumn: deletedColumn}); 
 // }catch(err){
 //   console.log(err);
 //   if (callback && typeof(callback) === "function")  callback({status: 'error'}); 
 // }
};//eo deleteColumn

/*
 * @Param: params:object { attribute:"xpath_1", values:params } 
 */
var editCurrentColumn = function(params, callback){
  try{    
    console.log('-- before "editCurrentColumn"');
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

      case 'column_name':
       sessionManager.currentColumn.columnName = params.values.columnName;
      break;

      case 'generic_xpath':
        sessionManager.currentColumn.genericXpath = params.values.genericXpath;
      break;

      case 'next_pager':
      alert("editCurrentColumn.next_pager := " + JSON.stringify(params));
        SharedKrakeHelper.setNextPager(params.values.xpath);
        sessionManager.goToNextState(); //current state := 'idle'
      break;
    }//eo switch
    
    //console.log('-- after "editCurrentColumn"');
    //console.log( JSON.stringify(sessionManager) );

    if (callback && typeof(callback) === "function")  
      callback({status: 'success', session: sessionManager, sharedKrake: SharedKrake }); 
  }catch(err){
    console.log(err);
    if (callback && typeof(callback) === "function")  callback({status: 'error'});
  }
};//eo editCurrentColumn

var saveColumn = function(params, callback){
  try{
    //validate currentColumn
    if(sessionManager.currentColumn.validate()){
      sessionManager.previousColumn = sessionManager.currentColumn;
      SharedKrakeHelper.saveColumn(sessionManager.currentColumn);
      sessionManager.currentColumn = null;
      sessionManager.goToNextState('idle');

      console.log('-- after "saveColumn"');
      console.log( JSON.stringify(sessionManager) );
      console.log( JSON.stringify(SharedKrake) );

      if (callback && typeof(callback) === "function")  
        callback({status: 'success', session: sessionManager, sharedKrake: sharedKrake}); 
    }
  }catch(err){

  }
};//eo saveButton

var matchPattern = function(callback){
  try{
    //result => { status: 'success', genericXpath: array }
    var result;
    if(sessionManager.currentColumn.columnType == 'list'){
      result = PatternMatcher.findGenericXpath(sessionManager.currentColumn.selection1, sessionManager.currentColumn.selection2);
      sessionManager.currentColumn.genericXpath = result.genericXpath;
    }else{
      sessionManager.currentColumn.genericXpath = sessionManager.currentColumn.selection1.xpath;
    }
    var response = {
      status : 'success',
      patternMatchingStatus : result.status,
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
    //console.log("getColumnById");
    //console.log(JSON.stringify(params));
    //console.log("-- sessionManager");
    //console.log(JSON.stringify(sessionManager));
    //console.log('-- SharedKrake');
    //console.log(JSON.stringify(SharedKrake));

    if(sessionManager.currentColumn && sessionManager.currentColumn.columnId == params.columnId){
      if (callback && typeof(callback) === "function") 
        callback({ status : 'success', column : sessionManager.currentColumn }); 
    }else{
      //search in sharedKrake for column
      var result = SharedKrakeHelper.findColumnByKey('columnId', params.columnId);
      
      if(result){
        if (callback && typeof(callback) === "function") 
          callback({ status : 'success', column: result }); 
      }else{
        if (callback && typeof(callback) === "function") 
          callback({ status : 'error' }); 
      }    
    }//eo if-else
  }catch(err){
    console.log(err);
  }
};//eo getColumnById

var getBreadcrumb = function(params, callback){
  var result = SharedKrakeHelper.getBreadcrumbArray(params.columnId);
  //console.log('-- getBreadcrumb');
  //console.log( JSON.stringify(result) );
  if(result){
    if (callback && typeof(callback) === "function") 
      callback({ status: 'success', breadcrumbArray: result });
  }else{
    if (callback && typeof(callback) === "function") 
      callback({ status: 'error' });
  } 
};





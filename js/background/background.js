var sessionManager = null;
var sharedKrake = null;
var colorGenerator = null;
var curr_SKH = null;


// Object that holds all the Krakes that were defined in the browser extension
/*
  Example holds an array of Krakes defined for tab id = 1 and tab id = 2
  var records = {
    1 : {
      isActive : boolean,
      shared_krakes : {
        url : {}
      }
    },
    2 : {
      isActive : boolean,
      shared_krakes : {
        url : {}
      }
    }   
  }

*/
var records = {};

/***************************************************************************/
/************************  Browser Action Icon  ****************************/
/***************************************************************************/
var handleIconClick = function(tab){
  
  console.log('Browser icon was clicked');
  
  // Deactivation Krake within this Tab
  if(records[tab.id] && records[tab.id].isActive) {
    disableKrake();
    records[tab.id].isActive = false;
    updateBrowserActionIcon(tab.id);
        
    clearCache();
    MixpanelEvents.event_3();

  // Activating Krake within this Tab     
   } else {
    curr_SKH = new SharedKrakeHelper(tab.id);
    records[tab.id] = records[tab.id] || {}
    enableKrake();
    records[tab.id].isActive = true;
    updateBrowserActionIcon(tab.id);
        
    sessionManager = new SessionManager();
    sharedKrake = SharedKrake;
    colorGenerator = new ColorGenerator();
    clearCache();
    MixpanelEvents.event_2();
    
   }

};//eo handleIconClick



// @Description : When a new tab is clicks
var newTabFocused = function(action_info) {
  updateBrowserActionIcon(action_info.tabId);  
  curr_SKH = new SharedKrakeHelper(action_info.tabId);  
  
}



// @Description : When page was reloaded
var pageReloaded = function(tabId, changeInfo, tab){
  //re-render panel using columns objects from storage if any. 
  records[tab.id] = records[tab.id] || {};
  
  if(records[tab.id].isActive){
    //Remove column that is not done editing from sessionManager
    sessionManager.currentState = "idle";
    sessionManager.currentColumn = null;

    chrome.tabs.sendMessage(tabId, { action : "enable_krake"}, function(response){
      records[tab.id].isActive = true;
    });
  }//eo if
}



// @Description : Changes the icon on display depending on the current state of the browser extension
var updateBrowserActionIcon = function(tab_id) {
  console.log(records[tab_id]);
  if( records[tab_id] && records[tab_id].isActive ) {
    chrome.browserAction.setIcon({path:"images/krake_icon_24.png"});
    
  } else {
    chrome.browserAction.setIcon({path:"images/krake_icon_disabled_24.png"});
    
  }

};//eo updateBrowserActionIcon



/***************************************************************************/
/**************************** Action Methods  ******************************/
/***************************************************************************/



// @Description : Enabling the Krake functions and panel display on the front end
var enableKrake = function(){
  chrome.tabs.getSelected(null, function(tab){
    chrome.tabs.sendMessage(tab.id, { action : "enable_krake"}, function(response){} );
  });  
};//eo enableKrake



// @Description : Disabling the Krake functions and panel display on the front end
var disableKrake = function(){
  chrome.tabs.getSelected(null, function(tab){
    chrome.tabs.sendMessage(tab.id, { action : "disable_krake"}, function(response){} );
  });  
};//eo disableKrake



// @Description : Clearing records associated with the current tab
var clearCache = function(){
  // SharedKrake.reset();
  // var sessionManager = null;
};



// @Description : Loads the indicated javascript file to the front end
var loadScript = function(filename, sender){
    chrome.tabs.executeScript(sender.tab.id, {file: filename}, function(){
      chrome.tabs.sendMessage(sender.tab.id, { action: "load_script_done", params: { filename: filename } }, function(response){
        
      });
    });
};//eo loadScript



// @Description : Loads the indicated CSS file to the front end
var insertCss = function(filename, sender){
    chrome.tabs.insertCSS(sender.tab.id, {file: filename}, function(){
      chrome.tabs.sendMessage(sender.tab.id, { action: "insert_css_done", params: { filename: filename } }, function(response){
        
      });
    });
}



// @Description : Gets the 
var getKrakeJson = function(callback){
  var json = curr_SKH.createScrapeDefinitionJSON();
  if (callback && typeof(callback) === "function")  
      callback({status: 'success', krakeDefinition: json, sharedKrake: SharedKrake });
  
  sendKrakeToApp();
};//eo getKrakeJson




/* 
 *  @Description : returns the Krake definition without additional action
 */
var injectKrakeJson = function(callback){
  var json = curr_SKH.createScrapeDefinitionJSON();
  if (callback && typeof(callback) === "function")  
      callback({status: 'success', krakeDefinition: json, sharedKrake: SharedKrake });
  
};//eo getKrakeJson



/* 
 *  @Description : Creates a new Tab to location https://krake.io/krakes/new
 *    when the Done button is clicked on the front end
 */
var sendKrakeToApp = function() {
  checkKrakeCookies(function(is_logged_in) {
    if(is_logged_in) {
      chrome.tabs.create({'url': 'https://krake.io/krakes/new' }, function(tab) {
        // Tab opened.
        console.log(tab)
      });
    } else {
      chrome.tabs.create({'url': 'https://krake.io/members/sign_in?ext_login=true' }, function(tab) {
        // Tab opened.
        console.log(tab)
      });      
    }
    
  })
}


/*
 *  @Description : Checks if the following two cookies on Krake.IO exist
 *      _mbd_dev_session
 *      remember_member_token
 *  @param callback( cookie_exist:boolean )
 */
var checkKrakeCookies = function(callback) {
  chrome.cookies.get({"url": 'https://krake.io', "name": '_mbd_dev_session'}, function(cookie) {
    if(cookie) {
      callback(true);
    } else {
      chrome.cookies.get({"url": 'https://krake.io', "name": '  remember_member_token'}, function(cookie) {
        if(cookie) {
          callback(true);
        } else {
          callback(false);          
        }        
      });
    }
  });  
}



/*
 * @Param: params:object { attribute:"xpath_1", values:params } 
 */
var loadSession = function(params, callback){
  try{
    console.log('-- before "loadSession"');
    console.log('session\n' + JSON.stringify(sessionManager));
    console.log('params\n' + JSON.stringify(params));
    
    switch(params.attribute) {
      case 'previous_column':
      
        if(params.event == 'detail_link_clicked') {
          var previousColumn = curr_SKH.findColumnByKey('columnId', params.columnId);

        // When in top level page
        } else {
          var column = curr_SKH.findColumnByKey('elementLink', params.values.currentUrl);
          if(column)
            sessionManager.previousColumn = curr_SKH.findColumnByKey('parentColumnId', column.parentColumnId);
        }
      break;

      case 'current_state':
        sessionManager.goToNextState(params.values.state);
      break;
    }//eo switch
    
    console.log('-- after "loadSession"');
    console.log( JSON.stringify(sessionManager) );

    if (callback && typeof(callback) === "function")  
      callback({status: 'success', session: sessionManager}); 
      
  } catch(err) {
    console.log(err);
    if (callback && typeof(callback) === "function")  callback({status: 'error'});
  }
};//eo loadSession



var newColumn = function(params, callback){
  try{
    console.log('-- before "addColumn"');
    //console.log( JSON.stringify(sessionManager) );

    var previousColumn = curr_SKH.findColumnByKey('url', params.url); 
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
      deletedColumn = curr_SKH.removeColumn(params.columnId);
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
      //alert("editCurrentColumn.next_pager := " + JSON.stringify(params));
        curr_SKH.setNextPager(params.values.xpath);
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
      curr_SKH.saveColumn(sessionManager.currentColumn);
      sessionManager.currentColumn = null;
      sessionManager.goToNextState('idle');

      console.log('-- after "saveColumn"');
      console.log( JSON.stringify(sessionManager) );
      console.log( JSON.stringify(SharedKrake) );

      if (callback && typeof(callback) === "function")  
        callback({status: 'success', session: sessionManager, sharedKrake: sharedKrake}); 
    }else{
      if (callback && typeof(callback) === "function")  
        callback({status: 'error', session: sessionManager, sharedKrake: sharedKrake});
    }
  }catch(err){

  }
};//eo saveButton



var matchPattern = function(callback){
  try{
    console.log( JSON.stringify(sessionManager) );
    //result => { status: 'success', genericXpath: array }
    var result ={};
    if(sessionManager.currentColumn.columnType == 'list'){
      result = PatternMatcher.findGenericXpath(sessionManager.currentColumn.selection1, sessionManager.currentColumn.selection2);
      sessionManager.currentColumn.genericXpath = result.genericXpath;
    }else{
      console.log('point 0');
      console.log(sessionManager.currentColumn.selection1.xpath);
      console.log(sessionManager.currentColumn.genericXpath);

      sessionManager.currentColumn.genericXpath = sessionManager.currentColumn.selection1.xpath;
      result.status = 'matched';
      console.log('point 1');
    }
    var response = {
      status : 'success',
      patternMatchingStatus : result.status,
      column : sessionManager.currentColumn
    }
    console.log('point 2');
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
      var result = curr_SKH.findColumnByKey('columnId', params.columnId);
      
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
  var result = curr_SKH.getBreadcrumbArray(params.columnId);
  //console.log('-- getBreadcrumb');
  //console.log( JSON.stringify(result) );
  if(result){
    if (callback && typeof(callback) === "function") 
      callback({ status: 'success', breadcrumbArray: result });
  }else{
    if (callback && typeof(callback) === "function") 
      callback({ status: 'error' });
  } 
};//eo getBreadcrumb



// @Description : MixPanel events
var executeMixpanelEvent = function(eventNumber, callback){
  switch(eventNumber){
    case 'event_4':
      MixpanelEvents.event_4();
    break;

    case 'event_5':
      MixpanelEvents.event_5();
    break;

    case 'event_6':
      MixpanelEvents.event_6();
    break;

    case 'event_7':
      MixpanelEvents.event_7();
    break;

    case 'event_8':
      MixpanelEvents.event_8();
    break;

    case 'event_9':
      MixpanelEvents.event_9();
    break;

    case 'event_10':
      MixpanelEvents.event_10();
    break;

    case 'event_11':
      MixpanelEvents.event_11();
    break;

    default:
      console.log('** invalid mixpanel event type **');
  }//eo switch
};



// @Description : Listens for message calls from the front end
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    switch(request.action){
      case "load_script":
        loadScript(request.params.filename, sender);
      break;

      case "insert_css":
        insertCss(request.params.filename, sender);
      break;

      case "get_session":
        sendResponse({ session: sessionManager });
      break;

      case 'load_session':
        loadSession(request.params, sendResponse);
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
      
      case 'inject_krake':
        injectKrakeJson(sendResponse);      
      break;

      case 'fire_mixpanel_event':
        executeMixpanelEvent(request.params.eventNumber);
      break;
    }//eo switch
  });


// @Description : handles page reload event
chrome.tabs.onUpdated.addListener(pageReloaded);

// @Description : handles extension Icon click event
chrome.browserAction.onClicked.addListener(handleIconClick);

// @Description : handles for tab change event
chrome.tabs.onActivated.addListener(newTabFocused);



(function(){

var panel = null;
var elementUIManager = null;
var behavioral_mode = DEFAULT_MODE;


// @Description : Checks if the domain allows for loading of the Krake Panel in the Page
function isKrakeDomain() {
  if( document.domain == 'krake.io' || document.domain == 'localhost' ) {
    return true;
  } else {
    return false;
  }
}

// @Description : Checks if jQuery library exist in the page
$.fn.isExist = function(){
  return jQuery(this).length > 0;
};

// @Description : Shows the panel within the page by loading all the scripts
var showPanel = function(){
  if(!$('#k-panel-wrapper').isExist()){
    var element = document.createElement('div');
    element.id = "k-panel-wrapper";
    $('body').prepend(element); 
    var panelWrapper = $('#k-panel-wrapper');

    panelWrapper.load(chrome.extension.getURL("html/panel.html"),function(){
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/content/params.js" } }); 
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/content/krake_helper.js" } });   
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/content/ui_element_selector.js" } });          
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/content/ui_column_factory.js" } });   
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/content/panel.js" } });         
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/content/notification_manager.js" } });         
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/content/krake.js" } }); 
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/libs/bootstrap/bootstrap.min.js" } });   
        chrome.extension.sendMessage({ action: "insert_css", params: { filename: "css/bootstrap.min.css" } });     
      }); 
  }//eo if
  
};

// @Description : Hides the panel
var hidePanel = function(){
  if($('#k-panel-wrapper').isExist()){
    $('#k-panel-wrapper').remove();
    //elementUIManager.disableElementSelection();
    //elementUIManager = null;
  }
};

// @Description : In case there was a page reload, populates the panel with previously existing column data.
var populatePreviousColumns = function(){
  chrome.extension.sendMessage({ action: "get_shared_krake" },  function(response){ 
    console.log( '-- sharedKrake: ');
    console.log( JSON.stringify(response.sharedKrake) );

    var wrapper = $("#inner-wrapper");
    populateColumns(wrapper, response.sharedKrake.columns);
  });
};//eo populatePreviousColumns

// @Description : Given an array of columns populates the columns wrapper
var populateColumns = function(wrapper, columns){
  for(var i=0; i<columns.length; i++){
    var params = {};
    params.columnId = columns[i].columnId;
    params.columnType = columns[i].columnType;
    params.columnName = columns[i].columnName==null? Params.DEFAULT_BREADCRUMB_TEXT : columns[i].columnName;
    params.firstSelectionText = columns[i].selection1.elementText; 
    params.secondSelectionText = columns[i].selection2.elementText;
    params.elementLink = columns[i].selection1.elementLink;
    params.breadcrumb = "";

    wrapper.append(UIColumnFactory.recreateUIColumn(params));
    Panel.addBreadCrumbToColumn(columns[i].columnId);

    populateColumns(wrapper, columns[i].options.columns); //add UI columns to panel

    //elementUIManager.evaluateXpath(columns[i]); //highlight columns
  }
};


// @Description : Handles calls from the background script
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse){
  	switch(request.action){
      case "enable_krake":
        if(document.domain != 'krake.io') {      
          showPanel();
          console.log("enable_krake");
        }
      break;

      case "disable_krake":
        hidePanel();
        UIElementSelector.restoreElementDefaultActions();
      break;

      case "load_script_done":
        console.log("load_script_done := " + request.params.filename);
        if(request.params.filename == "js/content/krake.js"){
          Panel.init(behavioral_mode);
          UIElementSelector.init();
          populatePreviousColumns();
          console.log('Line 30 : %s', behavioral_mode);
          NotificationManager.init(behavioral_mode);

        }//eo if

      break;

  	}//eo switch
  });


// @Description : Declaration of the actual URL on this document
var param = {
  currentUrl : document.URL
}

// @Description : Checks the current domain loaded and activates different mode
if( !isKrakeDomain() ) { // Normal mode
  behavioral_mode = DEFAULT_MODE;
  chrome.extension.sendMessage({ action:'load_session', params: { attribute:'previous_column', values:param }}, function(response){
    if(response.status == 'success'){
      console.log('-- load_session');
    }
  });

} else if ( isKrakeDomain() && document.location.pathname == '/tutorial' ) { // A tutorial on how to use browser ext

  behavioral_mode = TUTORIAL_MODE;
  chrome.extension.sendMessage({ action:'load_session', params: { attribute:'previous_column', values:param }}, function(response){
    if(response.status == 'success'){
      console.log('-- load_session');
    }
  });

} else if ( isKrakeDomain() && document.location.pathname == '/krakes/new') { // injects Krake Def

  behavioral_mode = CREATION_MODE;
  chrome.extension.sendMessage({ action:'inject_krake' }, function(response){
    if(response.status == 'success'){
      console.log(response)
      $('#krake_content').html(JSON.stringify(response.krakeDefinition));
    }
  });

} else if ( isKrakeDomain() && document.location.pathname == '/loggedin-via-extension' ) { // redirect 
  document.location = 'https://krake.io/krakes/new'
}

})();//eof
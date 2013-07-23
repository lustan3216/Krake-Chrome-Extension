(function(){


var panel = null;
var elementUIManager = null;
var behavioral_mode = DEFAULT_MODE;

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
          Panel.init();
          UIElementSelector.init();
          populatePreviousColumns();
          NotificationManager.init();

        }//eo if

      break;

  	}//eo switch
  });

var param = {
  currentUrl : document.URL
}

// Checks the current domain loaded and activates different mode
if(document.domain != 'krake.io') {
  behavioral_mode = DEFAULT_MODE;
  chrome.extension.sendMessage({ action:'edit_session', params: { attribute:'previous_column', values:param }}, function(response){
    if(response.status == 'success'){
      console.log('-- edit_session');
    }
  });

} else if (document.domain == 'krake.io' && document.location.pathname == '/tutorial') { // A tutorial on how to use browser ext
  
  behavioral_mode = TUTORIAL_MODE;
  chrome.extension.sendMessage({ action:'edit_session', params: { attribute:'previous_column', values:param }}, function(response){
    if(response.status == 'success'){
      console.log('-- edit_session');
    }
  });

} else if (document.domain == 'krake.io' && document.location.pathname == '/krakes/new') { // injects Krake Def
  
  behavioral_mode = CREATION_MODE;
  chrome.extension.sendMessage({ action:'inject_krake' }, function(response){
    if(response.status == 'success'){
      console.log(response)
      $('#krake_content').html(JSON.stringify(response.krakeDefinition));
    }
  });

} else if (document.domain == 'krake.io' && document.location.pathname == '/loggedin-via-extension') { // redirect
  
  document.location = 'https://krake.io/krakes/new'
  
}


$.fn.isExist = function(){
  return jQuery(this).length > 0;
};


var showPanel = function(){
  if(!$('#k-panel-wrapper').isExist()){
    var element = document.createElement('div');
    element.id = "k-panel-wrapper";
    $('body').prepend(element); 
    var panelWrapper = $('#k-panel-wrapper');

    panelWrapper.load(chrome.extension.getURL("html/panel.html"),function(){
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/content/params.js" } }); 
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/content/krake_helper.js" } });   
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/content/krake.js" } }); 
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/libs/bootstrap/bootstrap.min.js" } });   
        chrome.extension.sendMessage({ action: "insert_css", params: { filename: "css/bootstrap.min.css" } });     
      }); 
  }//eo if
  
};

var hidePanel = function(){
  if($('#k-panel-wrapper').isExist()){
    $('#k-panel-wrapper').remove();
    //elementUIManager.disableElementSelection();
    //elementUIManager = null;
  }
};

var populatePreviousColumns = function(){
  chrome.extension.sendMessage({ action: "get_shared_krake" },  function(response){ 
    console.log( '-- sharedKrake: ');
    console.log( JSON.stringify(response.sharedKrake) );

    var wrapper = $("#inner-wrapper");
    populateColumns(wrapper, response.sharedKrake.columns);
  });
};//eo populatePreviousColumns

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

})();//eof
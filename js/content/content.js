(function(){

var panel = null;
var elementUIManager = null;

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse){
  	switch(request.action){
      case "enable_krake":
        showPanel();
        console.log("enable_krake");

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
        }//eo if
      break;

  	}//eo switch
  });


var actionDispatcher = function(){
  
};//eo actionDispatcher


$.fn.isExist = function(){
  return jQuery(this).length > 0;
};


var showPanel = function(){
  if(!$('#k-panel-wrapper').isExist()){
    var element = document.createElement('div');
    element.id = "k-panel-wrapper";
    $('body').append(element); 
    var panelWrapper = $('#k-panel-wrapper');

    panelWrapper.load(chrome.extension.getURL("html/panel.html"),function(){
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/content/params.js" } }); 
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/content/krake.js" } });   
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/content/krake_helper.js" } });       
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
    populateColumns(wrapper, columns[i].options.columns); //add UI columns to panel

    //elementUIManager.evaluateXpath(columns[i]); //highlight columns
  }
};

/*
var renderPanelFromSharedKrake = function()
{
  chrome.extension.sendMessage( { name: "get_sharedKrake" },  function(response){
      console.log("------ storage:krake -----");
      console.log(JSON.stringify(response.sharedKrake));

      var krake = response.sharedKrake;
      var wrapper = $("#inner-wrapper");

      populateColumns(wrapper, krake.columns);

  });
};

var populateColumns = function(wrapper, columns)
{
  for(var i=0; i<columns.length; i++)
  {
    var params = {};
    params.columnId = columns[i].columnId;
    params.columnType = columns[i].columnType;
    params.columnName = columns[i].columnName==null? "Enter Column Name" : columns[i].columnName;
    params.firstSelectionText = columns[i].selection1.elementText; 
    params.secondSelectionText = columns[i].selection2.elementText;
    params.elementLink = columns[i].selection1.elementLink;
    params.breadcrumb = "";

    wrapper.append(UIColumnFactory.recreateUIColumn(params));
    populateColumns(wrapper, columns[i].options.columns); //add UI columns to panel

    elementUIManager.evaluateXpath(columns[i]); //highlight columns
    
  }

};
*/

})();//eof
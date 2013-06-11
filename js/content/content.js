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
        console.log("disable_krake");
      break;

      case "load_script_done":
        console.log("load_script_done := " + request.params.filename);
        if(request.params.filename == "js/krake.js"){
          panel = new Panel();
          panel.init();
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
        chrome.extension.sendMessage({ action: "load_script", params: { filename: "js/krake.js" } });       
      }); 
  }//eo if
  
};

var hidePanel = function(){
  if($('#k-panel-wrapper').isExist()){
    $('#k-panel-wrapper').remove();
    elementUIManager.disableElementSelection();
    elementUIManager = null;
  }
};

})();//eof
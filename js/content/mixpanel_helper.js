var MixPanelHelper = 
{
  
  triggerMixpanelEvent : function(e, eventNumber){
    var _eventNumber = e? e.data.eventNumber : eventNumber;
    console.log('e := ' + e);
    console.log('event number := ' + eventNumber);
    console.log('_eventNumber := '+ _eventNumber);

    chrome.extension.sendMessage({ action: "fire_mixpanel_event", 
                                   params: { eventNumber : _eventNumber } });
  }//eo mixpanel
  
};//eo XpathHelper


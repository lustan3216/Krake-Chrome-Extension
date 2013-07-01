var KrakeHelper = 
{
  triggerMixpanelEvent : function(e, eventNumber){
    var _eventNumber = e? e.data.eventNumber : eventNumber;
    console.log('e := ' + e);
    console.log('event number := ' + eventNumber);
    console.log('_eventNumber := '+ _eventNumber);

    chrome.extension.sendMessage({ action: "fire_mixpanel_event", 
                                   params: { eventNumber : _eventNumber } });
  },//eo mixpanel
  /*
   * @Return: { text:string, nodeCount:string, nodesToHighlight:array }
   */
  evaluateQuery: function(query)
  {
    var xpathResult = null;
    var str = '';
    var nodeCount = 0;
    var nodesToHighlight = [];

    try {
      xpathResult = document.evaluate(query, document.body, null,
                                      XPathResult.ANY_TYPE, null);
    } catch (e) {
      str = '[INVALID XPATH EXPRESSION]';
      nodeCount = 0;
    }

    if (!xpathResult) {
      return [str, nodeCount];
    }

    if (xpathResult.resultType === XPathResult.BOOLEAN_TYPE) {
      str = xpathResult.booleanValue ? '1' : '0';
      nodeCount = 1;
    } else if (xpathResult.resultType === XPathResult.NUMBER_TYPE) {
      str = xpathResult.numberValue.toString();
      nodeCount = 1;
    } else if (xpathResult.resultType === XPathResult.STRING_TYPE) {
      str = xpathResult.stringValue;
      nodeCount = 1;
    } else if (xpathResult.resultType ===
               XPathResult.UNORDERED_NODE_ITERATOR_TYPE) {
      for (var it = xpathResult.iterateNext(); it;
           it = xpathResult.iterateNext()) {
        nodesToHighlight.push(it);
        if (str) {
          str += '\n';
        }
        str += it.textContent;
        nodeCount++;
      }
      if (nodeCount === 0) {
        str = '[NULL]';
      }
    } else {
      str = '[INTERNAL ERROR]';
      nodeCount = 0;
    }
    
    return { 
             text: str,
             nodeCount: nodeCount,
             nodesToHighlight: nodesToHighlight
           };

  },//eo evaluateQuery

  clearElementHighlights: function()
  {
  	$('.k_highlight').removeClass('k_highlight');
  },//eo clearElementHighlights
   
  addElementHighlights: function(nodeList, colorCode)
  {
    for (var i = 0, l = nodeList.length; i < l; i++)
    {
      nodeList[i].className += colorCode;
    }
  },//eo addElementHighlights

  getElementXPath: function(element){
    try
    {
      var nodename = element.nodeName.toLowerCase();
      var link = nodename=="a"? element.href : nodename=="img"? element.src : null;
      //return [element.nodeName, KrakeHelper.getElementTreeXPath(element), link];
      var xpath = KrakeHelper.getElementTreeXPath(element);
      return {
               nodeName : element.nodeName,
               xpath : xpath,
               link : link
             }
    }
    catch(error)
    {
      alert("Error occured while obtaining Xpath for the selected element.\nReason: " + error);
    }
  },//eo getElementXPath

  getElementTreeXPath: function(element)
  {
    var paths = [];

      for (; element && element.nodeType == 1; element = element.parentNode)
      {
          var index = 0;
          var nodeName = element.nodeName;
          
          for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)
          {
              if (sibling.nodeType != 1) continue;
              
              if (sibling.nodeName == nodeName)
                  ++index;
          }

          var tagName = element.nodeName.toLowerCase();
          //var pathIndex = (index ? "[" + (index+1) + "]" : "");
          var pathIndex = "[" + (index+1) + "]";
          paths.splice(0, 0, tagName + pathIndex);
      }

      return paths.length ? "/" + paths.join("/") : null;
  }

};//eo KrakeHelper


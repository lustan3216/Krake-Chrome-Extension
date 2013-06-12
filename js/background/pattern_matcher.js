var PatternMatcher = {
  findGenericXpath: function(selection1, selection2){
    var xpath1Array = selection1.xpath.split("/");
    var xpath2Array = selection2.xpath.split("/");
    var genericXpathArray = [];

    // the selected element, the leaf of the xpath nnn
    if(selection1.elementType != selection2.elementType)
      return { status : 'unmatched' };

    if(selection1.xpath == selection2.xpath)
      return { status : 'duplicated' };

    for(var i=0; i<xpath1Array.length; i++)
    {
      //also check if the node names are the same
      if((xpath1Array[i].split("["))[0] != (xpath2Array[i].split("["))[0])
        return { status : 'unmatched' };

      var element = xpath1Array[i] == xpath2Array[i]? xpath1Array[i] : (xpath1Array[i].split("["))[0];
      
      //add to array if, and only if the node names are the same
      genericXpathArray.push(element);
    }
    
    var array = genericXpathArray.join("/");
    return { status: 'success', genericXpath: array };
  }//eo findGenericXpath
}//eo brain
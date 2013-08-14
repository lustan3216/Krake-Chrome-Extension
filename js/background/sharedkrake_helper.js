var SharedKrakeHelper = function(tab_id){
  var self = this;
  
};


SharedKrakeHelper.prototype.saveColumn = function(column){
  var self = this;
  console.log("addColumnToSharedKrake");

  if(!SharedKrake.originUrl)  
    SharedKrake.originUrl = column.url;

  if(!column.parentColumnId){
    SharedKrake.columns.push(column);
  }
  else{
    self.addColumnToParentColumn(SharedKrake.columns, column);
  }
}//eo addColumnToSharedKrake



/*
 * @Param: columns, columns of singleton sharedKrake object
 * @Param: column, column to be added to sharedKrake
 */
SharedKrakeHelper.prototype.addColumnToParentColumn = function(columns, column){
  var self = this;  
  for(var i=0; i<columns.length; i++){
    if(columns[i].columnId == column.parentColumnId){
      columns[i].options.columns.push(column);
        return true;
    }else{
      var result = self.addColumnToParentColumn(columns[i].options.columns, column);
      if(result) return result;
    }
  }//eo for
  return false;
};



/*
 * @Return:  deletedColumn:obj
 */
SharedKrakeHelper.prototype.removeColumn = function(columnId){
  var self = this;  
  console.log("removeColumnFromSharedKrake");
  return self.removeColumnFromSharedKrake(SharedKrake.columns, columnId);
},//eo removeColumnFromSharedKrake



SharedKrakeHelper.removeColumnFromSharedKrake = function(columns, columnId){
  var self = this;    
  for(var i=0; i<columns.length; i++){
  	//console.log('column[i].columnId := ' + columns[i].columnId + ', columnId := ' + columnId);
    if(columns[i].columnId==columnId){
    	var deletedColumn = columns[i];

    	columns.splice(i, 1);
      return deletedColumn;
    }else{
      var result = self.removeColumnFromSharedKrake(columns[i].options.columns, columnId);
      if(result) return result;
    }
  }
  return null;
};


  
/*
 * @Return: column:obj
 */
SharedKrakeHelper.prototype.findColumnByKey = function(key, value){
  var self = this;    
  console.log("-- sharedKrake \n" + JSON.stringify(sharedKrake));
  return self.searchColumnByKey(SharedKrake.columns, key, value);
};



SharedKrakeHelper.prototype.searchColumnByKey = function(columns, key, value){
  var self = this;    
  //console.log('key := ' + key);
  for(var i=0; i<columns.length; i++){
    console.log('columns['+ i +'][key] := ' + columns[i][key] + '\nvalue := ' + value);
    console.log('columns['+ i +'].selection1.elementLink := ' + columns[i].selection1.elementLink)
    //dirty hack, address this properly later
    if(key == 'elementLink' && columns[i].selection1.elementLink == value){
      return columns[i];
    }else if(columns[i][key] == value){
      console.log('columns[i].selection1.elementLink := ' + columns[i].selection1.elementLink)
      return columns[i];
    }else{
      var result = self.searchColumn(columns[i].options.columns, key, value);
      if(result) return result;
    }
  }
  return null;
};//eo searchColumn
  

/*
  findColumnByKey : function(key, value){
    return SharedKrakeHelper.searchColumnByKey(SharedKrake.columns, key, value);
  },

  searchColumnByKey : function(columns, key, value){
  	//console.log('key := ' + key);
    for(var i=0; i<columns.length; i++){
    	//console.log('columns[i][key] := ' + columns[i][key] + ', value := ' + value);
      if(columns[i][key] == value){

        return columns[i];
      }else{
        var result = SharedKrakeHelper.searchColumn(columns[i].options.columns, key, value);
        if(result) return result;
      }
    }
    return null;
  },//eo searchColumn
*/
  //search column
SharedKrakeHelper.prototype.findColumnById = function(columnId){
  var self = this;    
  return self.searchColumn(SharedKrake.columns, columnId);
};//eo findColumnById
  
  
  
SharedKrakeHelper.prototype.searchColumn = function(columns, columnId){
  var self = this;    
  for(var i=0; i<columns.length; i++){
    if(columns[i].columnId==columnId){
      return columns[i];
    }else{
      var result = self.searchColumn(columns[i].options.columns, columnId);
      if(result) return result;
    }
  }
  return null;
};//eo searchColumn
  ///////////////////////////////////////////////



  /*
   * @Return: column object array
   */
SharedKrakeHelper.prototype.getBreadcrumbArray = function(columnId){
  var self = this;    
  var breadcrumbArray = [];
  var result;

  if(sessionManager.currentColumn){
    result = self.getBreadcrumbColumnArray(SharedKrake.columns, 
  	                                                  sessionManager.currentColumn.parentColumnId, 
  	                                                  breadcrumbArray, 
  	                                                  SharedKrake.columns);
  }else{
    result = self.getBreadcrumbColumnArray(SharedKrake.columns, 
  	                                                  columnId, 
  	                                                  breadcrumbArray, 
  	                                                  SharedKrake.columns);
  }
  
  if(result && sessionManager.currentColumn) 
    result.unshift(sessionManager.currentColumn);

  return result? result : [sessionManager.currentColumn];
};
  
SharedKrakeHelper.prototype.getBreadcrumbColumnArray = function(columns, columnId, breadcrumbColumnArray, originalColumns){
  var self = this;  
	for(var i=0; i<columns.length; i++){
	  //console.log('column[' + i + '] := ' + columns[i].columnId + ', columnId := ' + columnId);

    if(columns[i].columnId==columnId){
      breadcrumbColumnArray.push(columns[i]);
      
      //console.log("hello getBreadcrumbColumnArray");

      if(columns[i].parentColumnId){
        var parentColumnId = columns[i].parentColumnId;
        columns = originalColumns;
        var parentColumn = self.getBreadcrumbColumnArray(columns, parentColumnId, breadcrumbColumnArray, originalColumns); 
          
        if(!parentColumn)
          return breadcrumbColumnArray;
      }//eo if
        
      return breadcrumbColumnArray;
    }else{
      var result = self.getBreadcrumbColumnArray(columns[i].options.columns, columnId, breadcrumbColumnArray, originalColumns);
      if(result) return result;
    }
  }//eo for
  return null;
};//eo getBreadcrumbColumnArray


SharedKrakeHelper.prototype.setNextPager = function(xpath){ 
  var self = this;    
  console.log('setNextPager.xpath := ' + xpath);
  return self.addNextPagerToColumns(xpath, sharedKrake.columns);
};//eo setNextPager

SharedKrakeHelper.prototype.addNextPagerToColumns = function(xpath, columns, options){
  var self = this;    
  var columnId = sessionManager.previousColumn.columnId;

  for(var i=0; i<columns.length; i++){
    if(columns[i].columnId==columnId){
      if(options == null){
        sharedKrake.nextPager = { xpath: xpath };
        return true;
      }else{
        options.nextPager = { xpath: xpath };
      }
      return columns[i];
    }else{
      var result = self.addNextPagerToColumns(xpath, columns[i].options.columns, columns[i].options);
      if(result) return result;
    }
  }//eo for
  return null;
};//eo addNextPagerToColumns



SharedKrakeHelper.prototype.createScrapeDefinitionJSON = function(){
  var self = this;    
  var krakeJson = {};

  for(var key in sharedKrake){
    var mappedColumnName = self.getMappedColumnName(key);

    switch(key){
      case "originUrl":
        krakeJson[mappedColumnName] = sharedKrake[key];
      break;

      case "columns":
        var result = self.createColumnsJson( sharedKrake.columns);
        if(result)
          krakeJson["columns"] = result;
      break;

      case "nextPager":
        krakeJson[mappedColumnName] = sharedKrake[key];
      break;
    }//eo switch

  }//eo for
  
  return krakeJson;
};//eo createScrapeDefinitionJSON

SharedKrakeHelper.prototype.createColumnsJson = function(columns){   
  var self = this;    
  console.log(columns);
  var columnArrayJson = [];

  for(var i=0; i<columns.length; i++){
    var columnJson = {};

    for(var key in columns[i]){
      var mappedColumnName = self.getMappedColumnName(key);
      console.log('key := ' + key + ', mappedColumnName := ' + mappedColumnName);
      switch(key){
        case "columnName":
        case "genericXpath":
        case "requiredAttribute":
            if((columns[i])[key])
              columnJson[mappedColumnName] = (columns[i])[key];
        break;

        case "options":
          if(columns[i].options.columns.length>0){
            var result = self.createOptionsJson( columns[i].options ); 
            if(result)
              columnJson["options"] = result;
          }
        break;
      }//eo switch

    }//eo for

    columnArrayJson.push( columnJson );
  }//eo for  

  return  columnArrayJson;

};

SharedKrakeHelper.prototype.createOptionsJson = function(options){
  var self = this;    
  if(options.columns.length == 0 || options.columns == null)  return null;
  
  var optionJson = {};
  var columnArrayJson = [];

  if(options.nextPager)
    optionJson.next_page = options.nextPager;

  for(var i=0; i<options.columns.length; i++){
    var columnJson = {};

    for(var key in options.columns[i]){
      var mappedColumnName = self.getMappedColumnName(key);
      
      switch(key){
        case "columnName":
        case "genericXpath":
        case "requiredAttribute":
            if((options.columns[i])[key])
              columnJson[mappedColumnName] = (options.columns[i])[key];
        break;

        case "options":
          if(options.columns[i].options.columns.length>0){
            var result = self.createOptionsJson( options.columns[i].options ); 
            if(result)
              columnJson["options"] = result;
          }
        break;
      }//eo switch

    }//eo for
    
    columnArrayJson.push( columnJson );

  }//eo for

  optionJson["columns"] = columnArrayJson;

  return optionJson;
};


  /*
   * @Param: key:string, attributes of sharedKrake object
   * @Return: Corresponding column name to be appeared in krake definition (JSON), or
   *          false: no column name found
   */
SharedKrakeHelper.prototype.getMappedColumnName = function(key){
  var self = this;  
  for(var columnKey in CommonParams.columnNameMapper){
    if( columnKey == key ){
      return CommonParams.columnNameMapper[columnKey];
    }
  }
  return false;
}//eo getMappedColumnName

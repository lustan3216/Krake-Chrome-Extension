var SharedKrakeHelper = {

  saveColumn : function(column){
    console.log("addColumnToSharedKrake");

    if(!SharedKrake.originUrl)  
      SharedKrake.originUrl = column.url;

    if(!column.parentColumnId){
      SharedKrake.columns.push(column);
    }
    else{
      SharedKrakeHelper.addColumnToParentColumn(SharedKrake.columns, column);
    }
  },//eo addColumnToSharedKrake

  /*
   * @Param: columns, columns of singleton sharedKrake object
   * @Param: column, column to be added to sharedKrake
   */
  addColumnToParentColumn : function(columns, column){
    for(var i=0; i<columns.length; i++){
      if(columns[i].columnId == column.parentColumnId){
        columns[i].options.columns.push(column);
          return true;
      }else{
        var result = SharedKrakeHelper.addColumnToParentColumn(columns[i].options.columns, column);
        if(result) return result;
      }
    }//eo for
    return false;
  },
  
  /*
   * @Return:  deletedColumn:obj
   */
  removeColumn: function(columnId){
    console.log("removeColumnFromSharedKrake");
    return SharedKrakeHelper.removeColumnFromSharedKrake(SharedKrake.columns, columnId);
  },//eo removeColumnFromSharedKrake

  removeColumnFromSharedKrake : function(columns, columnId){
    for(var i=0; i<columns.length; i++){
    	//console.log('column[i].columnId := ' + columns[i].columnId + ', columnId := ' + columnId);
      if(columns[i].columnId==columnId){
      	var deletedColumn = columns[i];

      	columns.splice(i, 1);
        return deletedColumn;
      }else{
        var result = SharedKrakeHelper.removeColumnFromSharedKrake(columns[i].options.columns, columnId);
        if(result) return result;
      }
    }
    return null;
  },
  
  /*
   * @Return: column:obj
   */
  findColumnByKey : function(key, value){
    console.log("-- sharedKrake \n" + JSON.stringify(sharedKrake));
    return SharedKrakeHelper.searchColumnByKey(SharedKrake.columns, key, value);
  },

  searchColumnByKey : function(columns, key, value){
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
        var result = SharedKrakeHelper.searchColumn(columns[i].options.columns, key, value);
        if(result) return result;
      }
    }
    return null;
  },//eo searchColumn
  

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
  findColumnById : function(columnId){
    return SharedKrakeHelper.searchColumn(SharedKrake.columns, columnId);
  },//eo findColumnById
  
  searchColumn : function(columns, columnId){
    for(var i=0; i<columns.length; i++){
      if(columns[i].columnId==columnId){
        return columns[i];
      }else{
        var result = SharedKrakeHelper.searchColumn(columns[i].options.columns, columnId);
        if(result) return result;
      }
    }
    return null;
  },//eo searchColumn
  ///////////////////////////////////////////////

  /*
   * @Return: column object array
   */
  getBreadcrumbArray : function(columnId){
    var breadcrumbArray = [];
    var result;

    if(sessionManager.currentColumn){
      result = SharedKrakeHelper.getBreadcrumbColumnArray(SharedKrake.columns, 
    	                                                  sessionManager.currentColumn.parentColumnId, 
    	                                                  breadcrumbArray, 
    	                                                  SharedKrake.columns);
    }else{
      result = SharedKrakeHelper.getBreadcrumbColumnArray(SharedKrake.columns, 
    	                                                  columnId, 
    	                                                  breadcrumbArray, 
    	                                                  SharedKrake.columns);
    }
    
    if(result && sessionManager.currentColumn) 
      result.unshift(sessionManager.currentColumn);

    return result? result : [sessionManager.currentColumn];
  },
  
  getBreadcrumbColumnArray : function(columns, columnId, breadcrumbColumnArray, originalColumns){

  	for(var i=0; i<columns.length; i++){
  	  //console.log('column[' + i + '] := ' + columns[i].columnId + ', columnId := ' + columnId);

      if(columns[i].columnId==columnId){
        breadcrumbColumnArray.push(columns[i]);
        
        //console.log("hello getBreadcrumbColumnArray");

        if(columns[i].parentColumnId){
          var parentColumnId = columns[i].parentColumnId;
          columns = originalColumns;
          var parentColumn = SharedKrakeHelper.getBreadcrumbColumnArray(columns, parentColumnId, breadcrumbColumnArray, originalColumns); 
            
          if(!parentColumn)
            return breadcrumbColumnArray;
        }//eo if
          
        return breadcrumbColumnArray;
      }else{
        var result = SharedKrakeHelper.getBreadcrumbColumnArray(columns[i].options.columns, columnId, breadcrumbColumnArray, originalColumns);
        if(result) return result;
      }
    }//eo for
    return null;
  },//eo getBreadcrumbColumnArray

  setNextPager : function(xpath){ 
    console.log('setNextPager.xpath := ' + xpath);
    return SharedKrakeHelper.addNextPagerToColumns(xpath, sharedKrake.columns);
  },//ep setNextPager

  addNextPagerToColumns: function(xpath, columns, options){
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
        var result = SharedKrakeHelper.addNextPagerToColumns(xpath, columns[i].options.columns, columns[i].options);
        if(result) return result;
      }
    }//eo for
    return null;
  }

};//eo SharedKrakeHelper

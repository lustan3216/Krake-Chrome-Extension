var SharedKrakeHelper = {
  saveColumn : function(column){
    console.log("addColumnToSharedKrake");
    SharedKrake.getInstance().columns.push(column);
  },//eo addColumnToSharedKrake
  
  /*
   * @Return: { deletedColumn:obj, sharedKrake:obj }
   */
  removeColumn: function(columnId){
    alert("removeColumnFromSharedKrake");
    SharedKrakeHelper.removeColumnFromSharedKrake(SharedKrake.getInstance().columns, columnId);
  },//eo removeColumnFromSharedKrake

  removeColumnFromSharedKrake : function(columns, columnId){
    for(var i=0; i<columns.length; i++){
      if(columns[i].columnId==columnId){
      	columns.splice(i, 1);
        return true;
      }else{
        var result = SharedKrakeHelper.searchColumn(columns[i].options.columns, columnId);
        if(result) return result;
      }
    }
    return null;
  },

  findColumnById : function(columnId){
    return SharedKrakeHelper.searchColumn(SharedKrake.getInstance().columns, columnId);
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
  }//eo searchColumn
  ///////////////////////////////////////////////

};//eo SharedKrakeHelper

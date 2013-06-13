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
  },//eo removeColumnFromSharedKrake

  findColumnById : function(columnId){
    return BackgroundHelper.searchColumn(sharedKrake.columns, columnId);
  },//eo findColumnById
  
  searchColumn : function(columns, columnId){
    for(var i=0; i<columns.length; i++){
      if(columns[i].columnId==columnId){
        return columns[i];
      }else{
        var result = BackgroundHelper.searchColumn(columns[i].options.columns, columnId);
        if(result) return result;
      }
    }
    return null;
  }//eo searchColumn
  ///////////////////////////////////////////////

};//eo SharedKrakeHelper

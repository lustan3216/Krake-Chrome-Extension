/*************************************************************************/
var ColumnFactory = {
  createColumn: function(params){
    var column = new Column(params);
    column.colorCode = colorGenerator.getColor();
    return column;
  }//eo createColumn
};

var Column = function(params){
  this.parentColumnId = null;
  this.columnId = params.columnId;
  this.columnType = params.columnType;
  this.columnName = CommonParams.text.defaultColumnTitleText ; 
  this.colorCode = null;
  
  //the url in which the column is defined
  this.url = params.url; //
  /*
  selection1:obj , selection2:obj 
  { elementType: xxx, 
    xpath: xxx,
    elementText: xxx, 
    elementLink: xxx //href for "a", img for "img"
  }
  */
  this.selection1 = {}; 
  this.selection2 = {}; 
  
  this.options = {};
  this.options.columns = [];
  this.genericXpath = null;
  this.requiredAttribute = null;

};

Column.prototype.setAttribute = function(key, value){
  var self = this;
  self[key] = value;
};

Column.prototype.setSelection1 = function(params){
  var self = this;
  self.selection1.xpath = params.xpath;
  self.selection1.elementType = params.elementType;
  self.selection1.elementText = params.elementText;
  self.selection1.elementLink = params.elementLink;

  var elementType = params.elementType.toLowerCase();

  /* 
    // Disabled for easier demonstration purposes
    // To consider splitting into two different logical columns
    
    if(elementType == "a")
      self.requiredAttribute = "href";
  */
  
  if(elementType == "img")
    self.requiredAttribute = "src";
  
};

/*
 * @Description: validate column before saving into sharedKrake
 * @Return: true => validataion passed, false => validation failed
 */
Column.prototype.setSelection2 = function(params){
  var self = this;
  self.selection2.xpath = params.xpath;
  self.selection2.elementType = params.elementType;
  self.selection2.elementText = params.elementText;
  self.selection2.elementLink = params.elementLink;
}; 

/*
 * @Description: validate column before saving into sharedKrake
 * @Return: true => validataion passed, false => validation failed
 */
Column.prototype.validate = function(){
  var self = this;
  
  var isComplete = function(){
    if(self.columnType == 'list')
      return (self.selection1.xpath == null || self.selection2.xpath == null)? false : true;
    
    if(self.columnType == 'single')
      return (self.selection1.xpath == null)? false : true;
  };
  console.log('-- validation');
  console.log('isComplete: ' + isComplete());

  return isComplete();
};


/*
 * @Description : Rotates through a list of color and returns a new color each time
 *    the getColor() is called
 */
var ColorGenerator = function()
{
  this.colorArray = 
  [ " k_highlight_FFCC00 ", //yellow
    " k_highlight_FF6600 ", //orange
    " k_highlight_3EA99F ", //light green
    " k_highlight_FF99FF ", //light purple
    " k_highlight_82CAFF ", //sky blue
    " k_highlight_99CCFF ",
    " k_highlight_FF00FF ",
    " k_highlight_CC33FF ",
    " k_highlight_FFCCCC ",
    " k_highlight_CCFF00 ",
    " k_highlight_0099CC ",
    " k_highlight_FFCCFF ",
    " k_highlight_33FF33 ",
    " k_highlight_FFFF99 "
  ];

};//eo ColorGenerator

/*
 *  @Description : Returns a color code from the colorArray
 *    Auto rotates the most recent color returned to the end of the array after its been returned for use
 *  @return : color:String
 */

ColorGenerator.prototype.getColor = function()
{
  var self = this;
  var color = self.colorArray.shift();
  self.colorArray.push(color);
  return color; 
}

/*
module.exports = Column;
module.exports = ColumnFactory;

//  The sequence below is called when command is called directly from the terminal
//    node tsp_test.js
if(!module.parent) {
  var column = ColumnFactory.createColumn({
    columnId: 1,
    columnType: 'list',
    url: "http://localhost"
  });

  column.setAttribute('parentColumnId', '1234');
  console.log( JSON.stringify(column));
  
  console.log('outside : ' + column.validate());
};
*/





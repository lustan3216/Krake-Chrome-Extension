/*
  Copyright 2013 Krake Pte Ltd.

  This program is free software: you can redistribute it and/or modify it under
  the terms of the GNU General Public License as published by the Free Software
  Foundation, either version 3 of the License, or (at your option) any later
  version.

  This program is distributed in the hope that it will be useful, but WITHOUT
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  this program. If not, see <http://www.gnu.org/licenses/>.

  Author:
  Joseph Yang <sirjosephyang@krake.io>
*/


/***************************************************************************/
/************************** UI Column Factory  *****************************/
/***************************************************************************/
var UIColumnFactory = {
  /*
   * @Param: params:object
   *         {
               columnId: string
               columnType: string
               columnName: string
               firstSelectionText: string (optional)
               secondSelectionText: string (optional)
               breadcrumb: string
             }
   */

  recreateUIColumn: function(params){
    
    var columnId = params.columnId;
    var type = params.columnType;
    var columnTitle = params.columnName;
    var firstSelectionText = params.firstSelectionText;
    var secondSelectionText = params.secondSelectionText;
    var elementLink = params.elementLink;

    console.log("params: " + JSON.stringify(params));

    var divKrakeColumnId = "krake-column-" + columnId;
    var columnNameId = "krake-column-title-" + columnId;

    var $wrapper = $("<div>", { id: divKrakeColumnId, 
                                class: "krake-column k_panel"});

    var columnControlId =  "krake-column-control-" + columnId;
    var $columnControl = $("<div>", { id: columnControlId,
                                      class: "krake-column-control k_panel" });

    console.log("elementLink:= " + elementLink);
    
    var $detailPageLink = null;

    if(elementLink)
    {
      var detailButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("skin/images/link.png") + 
                               "\");";

      $detailPageLink = $("<a>", {  class: "k_panel krake-control-button krake-control-button-link",
                                    title: "Hyperlink detected\nClick to find more info",
                                    href: elementLink,
                                    style: detailButtonImageUrl});
      $detailPageLink.click(
        function(){
          chrome.extension.sendMessage({ name: "set_parent_column_id", 
                                       params: { parentColumnId: columnId } },
          function(response){
            window.location.href = elementLink; 
          });  
        });


      //create pagination
    }
    var deleteButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("skin/images/bin.png") + 
                               "\");";
    var $deleteButton = $("<button>", { class: "krake-control-button k_panel krake-control-button-delete",
                                        style: deleteButtonImageUrl });

    var breadcrumbId = "k_column-breadcrumb-" + columnId;
    var $breadcrumb = $("<div>", { id: breadcrumbId,
                                   class: "krake-breadcrumb k_panel" });

    ContentHelper.getBreadCrumbArrayForColumnWithId(columnId, 
      function(object){
        UIColumnFactory.createUIBreadcrumb($breadcrumb, object);
      });


    var $columnName = $("<div>", { id: columnNameId, 
                                    class: "krake-column-row krake-column-title k_panel",
                                    text: columnTitle });
    
    var firstSelectionId = "krake-first-selection-" + columnId;
    var $firstSelection = $("<div>", { id: firstSelectionId,
                                       class: "krake-column-row krake-selection-1 k_panel",
                                       text: firstSelectionText });

    if(type=="list")
    {
      var secondSelectionId = "krake-second-selection-" + columnId;
      var $secondSelection = $("<div>", { id: secondSelectionId,
                                          class: "krake-column-row krake-selection-2 k_panel",
                                          text: secondSelectionText });

    }
    else
    {
      var secondSelectionId = "krake-second-selection-" + columnId;
      var $secondSelection = $("<div>", { id: secondSelectionId,
                                          class: "krake-column-row krake-selection-2 k_panel"});
    }

    var thirdSelectionId = "krake-third-selection-" + columnId;
    var $thirdSelection = $("<div>", { id: thirdSelectionId,
                                       class: "krake-column-row krake-selection-3 k_panel" });


    $deleteButton.bind('click', function(){
      var columnIdentifier = "#krake-column-" + columnId; 
      chrome.extension.sendMessage({ action: "delete_column", params: { columnId: columnId } }, function(response){
        if(response.status == 'success'){
          $(columnIdentifier).remove();
        }   
      });
    });

    $columnControl = $columnControl.append($deleteButton);

    $wrapper.append($columnControl.append($detailPageLink).append($deleteButton)).append($breadcrumb).append($columnName).append($firstSelection).append($secondSelection).append($thirdSelection);

    return $wrapper;


  },

  createUIColumn: function(type, columnId)
  {
    var divKrakeColumnId = "krake-column-" + columnId;
    var columnTitleId = "krake-column-title-" + columnId;

    var $wrapper = $("<div>", { id: divKrakeColumnId, 
                                class: "krake-column k_panel"});

    var columnControlId =  "krake-column-control-" + columnId;
    var $columnControl = $("<div>", {  id: columnControlId,
                                       class: "krake-column-control k_panel" });
    
    //delete button
    var deleteButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("images/bin.png") + 
                              "\");";

    var $deleteButton = $("<button>", { class: "k_panel krake-control-button krake-control-button-delete",
                                        style:  deleteButtonImageUrl });

    $deleteButton.bind('click', function(){
      var columnIdentifier = "#krake-column-" + columnId; 
      chrome.extension.sendMessage({ action: "delete_column", params: { columnId: columnId } }, function(response){
        if(response.status == 'success'){
          $(columnIdentifier).remove();
          //remove highlights
          UIElementSelector.unHighLightElements(response.deletedColumn);
        }   
      });
    });

    //save button
    var saveButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("images/save.png") + 
                              "\");";

    var $saveButton = $("<button>", { class: "k_panel krake-control-button krake-control-button-save",
                                        style:  saveButtonImageUrl });

    $saveButton.bind('click', function(){
      var columnIdentifier = "#krake-column-" + columnId; 
      chrome.extension.sendMessage({ action: "save_column" }, function(response){
        console.log( JSON.stringify(response) );
        if(response.status == 'success'){
          //change save button to edit button
        }   
      });
    });

    var breadcrumbId = "k_column-breadcrumb-" + columnId;
    var $breadcrumb = $("<div>", { id: breadcrumbId,
                                   class: "krake-breadcrumb k_panel" });

    var $columnTitle = $("<div>", { id: columnTitleId, 
                                    class: "krake-column-row krake-column-title k_panel",
                                    contenteditable: "true", 
                                    "data-placeholder": "asdf" });
    
    var firstSelectionId = "krake-first-selection-" + columnId;
    var $firstSelection = $("<div>", { id: firstSelectionId,
                                       class: "krake-column-row krake-selection-1 k_panel" });

    var secondSelectionId = "krake-second-selection-" + columnId;
    var $secondSelection = $("<div>", { id: secondSelectionId,
                                          class: "krake-column-row krake-selection-3 k_panel" });
  
    var thirdSelectionId = "krake-third-selection-" + columnId;
    var $thirdSelection = $("<div>", { id: thirdSelectionId,
                                          class: "krake-column-row krake-selection-3 k_panel" });

    

    $columnControl = $columnControl.append($deleteButton);

    $wrapper.append($columnControl.append($deleteButton).append($saveButton)).append($breadcrumb).append($columnTitle).append($firstSelection).append($secondSelection).append($thirdSelection);

    return $wrapper;
  },//eo createColumn
   
 


};//eo UIColumnFactory


/***************************************************************************/
/******************************  Panel UI  *********************************/
/***************************************************************************/
var Panel = {
  uiBtnCreateList : $("#btn-create-list"),
  uiBtnSelectSingle : $("#btn-select-single"),
  uiBtnEditPagination : $("#btn-edit-pagination"),
  uiBtnDone : $("#btn-done"),
  uiPanelWrapper : $("#inner-wrapper"),

  generateColumnId : function(){
   return Math.floor( Math.random() * 10000000000 );
  },

  init : function(){
    Panel.uiBtnCreateList.bind('click', Panel.uiBtnCreateListClick);
    Panel.uiBtnSelectSingle.bind('click', Panel.uiBtnSelectSingleClick);
    Panel.uiBtnEditPagination.bind('click', Panel.uiBtnEditPaginationClick);
    Panel.uiBtnDone.bind('click', Panel.uiBtnDoneClick);
  },
  
  uiBtnCreateListClick : function(){
    chrome.extension.sendMessage({ action: "get_session"}, function(response){
      var sessionManager = response.session;

      if(sessionManager.currentState != 'idle'){
        alert("You must finish editing the previous column");
      }else{
        var newColumnId = Panel.generateColumnId();

        var params = {
          columnId : newColumnId,
          columnType : 'list',
          url : document.URL
        };

        chrome.extension.sendMessage({ action: "add_column", params: params}, function(response){
          //only add UIColumn to panel once a logical column object is created in sessionManager
          if(response.status == 'success'){
            Panel.uiPanelWrapper.append(UIColumnFactory.createUIColumn('list', newColumnId));
            Panel.attachEnterKeyEventToColumnTitle(newColumnId);
          }else{
            //show warning to user
          }//eo if-else
        });
      }//eo if-else 
    });
  },
  
  uiBtnSelectSingleClick : function(){
    chrome.extension.sendMessage({ action: "get_session"}, function(response){
      var sessionManager = response.session;

      if(sessionManager.currentState != 'idle'){
        alert("You must finish editing the previous column");
      }else{
        var newColumnId = Panel.generateColumnId();

        var params = {
          columnId : newColumnId,
          columnType : 'single',
          url : document.URL
        };

        chrome.extension.sendMessage({ action: "add_column", params: params}, function(response){
          //only add UIColumn to panel once a logical column object is created in sessionManager
          if(response.status == 'success'){
            Panel.uiPanelWrapper.append(UIColumnFactory.createUIColumn('single', newColumnId));
            Panel.attachEnterKeyEventToColumnTitle(newColumnId);
          }else{
            //show warning to user
          }//eo if-else
        });
      }//eo if-else 
    });
    
  },

  uiBtnEditPaginationClick : function(){
    console.log("uiBtnEditPaginationClick");
  },

  uiBtnDoneClick : function(){
    console.log("uiBtnDoneClick");
  },

  attachEnterKeyEventToColumnTitle : function(columnId){
    var identifier = "#krake-column-title-" + columnId;
    $(identifier).keydown(function(e) {
      if(e.which == 13) {
        //update breadcrumb segment title
        var newColumnTitle = $(identifier).text();
        //self.updateBreadcrumbSegmentTitle(columnId, $.trim(newColumnTitle));     
        $(this).blur().next().focus();  return false;
      }
    }); 
  },

  showLink : function(column){
    if(column.selection1.elementType.toLowerCase() == 'a'){
      var selector = '#krake-column-control-' + column.columnId;
      console.log(selector);

      var linkButtonImageUrl = "background-image: url(\"" + chrome.extension.getURL("images/link.png") + "\");";

      var $linkButton = $("<button>", { class: "k_panel krake-control-button krake-control-button-link",
                                        style:  linkButtonImageUrl });

      $(selector).append($linkButton);

      $linkButton.bind('click', function(){
        
      });
      /*
      $linkButton.bind('click', function(){
        //show list of elements 
        var results = KrakeHelper.evaluateQuery(column.genericXpath);
        
        var linkList = '<div id="k-link-list-' + column.columnId + '" >';

        for(var i=0; i<results.nodesToHighlight.length; i++){
          linkList = linkList + '<a href="' + results.nodesToHighlight[i].href + '">' + 
                     results.nodesToHighlight[i].innerHTML + '</a>';

        }
        
        linkList = linkList + '</div>';

        //console.log(linkList);
      });//eo bind
      */

    }
  }//eo showLink

};//eo Panel
/*
$saveButton.bind('click', function(){
      var columnIdentifier = "#krake-column-" + columnId; 
      chrome.extension.sendMessage({ action: "save_column" }, function(response){
        console.log( JSON.stringify(response) );
        if(response.status == 'success'){
          //change save button to edit button
        }   
      });
    });

*/
 
//courtesy of https://github.com/sprucemedia/jQuery.divPlaceholder.js
(function ($) {
  $(document).on('change keydown keypress input', '*[data-placeholder]', function() {
    if (this.textContent) {
      this.setAttribute('data-div-placeholder-content', 'true');
    }
    else {
      this.removeAttribute('data-div-placeholder-content');
    }
  });
})(jQuery);
/***************************************************************************/
/************************  UIElementSelector  ******************************/
/***************************************************************************/
var UIElementSelector = {
  init : function(){
    UIElementSelector.attachElementHighlightListeners();
    console.log("UIElementSelector.init");
  },

  mouseOut : function(e){
    this.style.outline = '';
    return false;
  },

  mouseOver : function(e){
    if ($(e.target).is('.k_panel')) return;
    
    if (this.tagName != 'body'){
      this.style.outline = '4px solid #0000A0'; 
    }
    return false; //preventDefault & stopPropogation
  },
  
  attachElementHighlightListeners : function(){   
    $('*').bind('mouseover', UIElementSelector.mouseOver);
    $('*').bind('mouseout', UIElementSelector.mouseOut);
    $('*').bind('click', UIElementSelector.selectElement);
  },

  detachElementHighlightListeners : function(){
    $('*').unbind('mouseover', UIElementSelector.mouseOver);
    $('*').unbind('mouseout', UIElementSelector.mouseOut);
    $('*').unbind('click', UIElementSelector.selectElement);
  },

  restoreElementDefaultActions : function(){
    UIElementSelector.detachElementHighlightListeners();
  },

  selectElement : function(e){
    e.preventDefault();
    e.stopPropagation();

    if ($(e.target).is('.k_panel')) return;

    var elementPathResult = KrakeHelper.getElementXPath(this); 
    var elementText = KrakeHelper.evaluateQuery(elementPathResult.xpath).text;

    var params = {
      xpath : elementPathResult.xpath,
      elementType : elementPathResult.nodeName,
      elementText : elementText,
      elementLink : elementPathResult.link
    };
  
    chrome.extension.sendMessage({ action: "get_session"}, function(response){
      var sessionManager = response.session;
      //console.log("--");
      //console.log(JSON.stringify(sessionManager));

      switch(sessionManager.currentState){
        case 'pre_selection_1':
          chrome.extension.sendMessage({ action:"edit_current_column", params: { attribute:"xpath_1", values:params }}, function(response){
            if(response.status == 'success'){
              var sessionManager = response.session;
              UIElementSelector.updateColumnText(sessionManager.currentColumn.columnId, 1, elementText, elementPathResult.nodeName);
            }
          });
        break;

        case 'pre_selection_2':
          chrome.extension.sendMessage({ action:"edit_current_column", params: { attribute:"xpath_2", values:params }}, function(response){
            if(response.status == 'success'){
              var sessionManager = response.session;
              UIElementSelector.updateColumnText(sessionManager.currentColumn.columnId, 2, elementText, elementPathResult.nodeName);
              chrome.extension.sendMessage({ action:"match_pattern" }, function(response){
                console.log( JSON.stringify(response) );
                if(response.status == 'success'){
                  //highlight all elements depicted by genericXpath
                  UIElementSelector.highlightElements(response.column.url, response.column.genericXpath, response.column.colorCode);
                  //display 'link' icon
                  Panel.showLink(response.column);
                }else{
                  //** notify users that xpaths of 2 selections are not matched **
                }
              });
            }
          });
        break;
      }//eo switch
    });

  },

  highlightElements : function(url, genericXpath, colorCode){
    console.log("-- highlightElements");
    if(document.URL != url) return;
    
    var result = KrakeHelper.evaluateQuery(genericXpath);
    var nodes = result.nodesToHighlight;
    
    for(var i=0; i<nodes.length; i++){
      nodes[i].className += colorCode;
    }
  },

  unHighLightElements : function(column){
    if(document.URL != column.url) return;
       
    var selector = '.' + $.trim(column.colorCode);
    $(selector).removeClass(column.colorCode);
  },

  /*
   * @Description: Update the row content text upon successful element selection
   * @Param: columnId, column id
   * @Param: rowIndex, 1, 2
   */
  updateColumnText : function(columnId, rowIndex, text, elementType){
    var selector = rowIndex == 1? 
                   '#krake-first-selection-' + columnId: 
                   '#krake-second-selection-' + columnId;

    switch(elementType.toLowerCase()){
      case 'img':
        $(selector).html(Params.IMAGE_TEXT); 
      break;

      default:
        $(selector).html(text); 
      break;
    }//eo switch
    
    
  },

         

  selectNextPager : function(e){
    e.preventDefault();
  }
  

  

};//eo UIElementSelector


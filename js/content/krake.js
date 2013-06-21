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

var UIColumnFactory = {
  

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
      var selector = '#krake-column-control-' + columnId;
      var linkButtonImageUrl = "background-image: url(\"" + chrome.extension.getURL("images/link.png") + "\");";
      var $linkButton = $("<button>", { class: "k_panel krake-control-button krake-control-button-link",
                                        style:  linkButtonImageUrl });

      $columnControl.append($linkButton);
     
      $linkButton.bind('click', function(){
        chrome.extension.sendMessage({ action:"get_column_by_id", params: {columnId: columnId} }, function(response){
          console.log( JSON.stringify(response) );
          //if(response.session.currentColumn){
              //notify user to save column first
          //}else{
            if(response.status == 'success'){
              window.location.href = response.column.selection1.elementLink;
            }
            
          //} 
        });
      });//eo click


      //create pagination
    }

    var editButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("images/edit.png") + 
                              "\");";

    var $editButton = $("<button>", { class: "k_panel krake-control-button krake-control-button-edit",
                                      style:  editButtonImageUrl });

    $editButton.bind('click', function(){
      alert("editButtonClicked");
    });

    var deleteButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("images/bin.png") + 
                               "\");";
    var $deleteButton = $("<button>", { class: "krake-control-button k_panel krake-control-button-delete",
                                        style: deleteButtonImageUrl });

    var breadcrumbId = "k_column-breadcrumb-" + columnId;
    var $breadcrumb = $("<div>", { id: breadcrumbId,
                                   class: "krake-breadcrumb k_panel" });




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
          //remove highlights
          UIElementSelector.unHighLightElements(response.deletedColumn);
        }   
      });
    });

    $columnControl = $columnControl.append($deleteButton);

    $wrapper.append($columnControl.append($detailPageLink).append($deleteButton).append($editButton)).append($breadcrumb).append($columnName).append($firstSelection).append($secondSelection).append($thirdSelection);

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
      chrome.extension.sendMessage({ action: "save_column" }, function(response){
        if(response.status == 'success'){
          //change save button to edit button
          var columnIdentifier = "#krake-column-" + columnId; 
          var selector = columnIdentifier + ' .krake-control-button-save';
          $(selector).remove();
          UIColumnFactory.addEditButton(columnId);
        }   
      });
    });

    var breadcrumbId = "k_column-breadcrumb-" + columnId;
    var $breadcrumb = $("<div>", { id: breadcrumbId,
                                   class: "krake-breadcrumb k_panel" });

    var $columnTitle = $("<div>", { id: columnTitleId, 
                                    class: "krake-column-row krake-column-title k_panel",
                                    contenteditable: "true", 
                                    "data-placeholder": Params.DEFAULT_COLUMN_NAME });
    
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
   
  addEditButton : function(columnId){
    //edit button
    var editButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("images/edit.png") + 
                              "\");";

    var $editButton = $("<button>", { class: "k_panel krake-control-button krake-control-button-edit",
                                      style:  editButtonImageUrl });

    $editButton.bind('click', function(){
      chrome.extension.sendMessage({ action: "stage_column", params : { columnId : columnId } }, function(response){
        if(response.status == 'success'){ }
      });
    });

    var selector = "#krake-column-control-" + columnId; 
    $(selector).append($editButton);
  }


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

    NotificationManager.showNotification({
      type : 'info',
      title : Params.NOTIFICATION_TITLE_IDLE,
      message : Params.NOTIFICATION_MESSAGE_IDLE
    });
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
            Panel.addBreadCrumbToColumn(newColumnId);
            
            NotificationManager.showNotification({
              type : 'info',
              title : Params.NOTIFICATION_TITLE_PRE_SELECTION_1,
              message : Params.NOTIFICATION_MESSAGE_PRE_SELECTION_1
            });
     
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
            Panel.addBreadCrumbToColumn(newColumnId);

            NotificationManager.showNotification({
              type : 'info',
              title : Params.NOTIFICATION_TITLE_SINGLE_SELECTION,
              message : Params.NOTIFICATION_MESSAGE_SINGLE_SELECTION
            });
          }else{
            //show warning to user
          }//eo if-else
        });
      }//eo if-else 
    });
    
  },

  uiBtnEditPaginationClick : function(){
    
   
  },

  uiBtnDoneClick : function(){
    console.log("uiBtnDoneClick");
    chrome.extension.sendMessage({ action:'get_krake_json' }, function(response){
      if(response.status == 'success'){
        alert( JSON.stringify(response.krakeDefinition) );
        console.log('-- sharedKrake\n' + JSON.stringify(response.sharedKrake));
      }
    });
  },

  attachEnterKeyEventToColumnTitle : function(columnId){
    var identifier = "#krake-column-title-" + columnId;
    $(identifier).keydown(function(e) {
      if(e.which == 13) {
        //update breadcrumb segment title
        var newColumnTitle = $(identifier).text();
        //self.updateBreadcrumbSegmentTitle(columnId, $.trim(newColumnTitle)); 
        var params = {
          columnName : newColumnTitle
        }
        chrome.extension.sendMessage({ action:"edit_current_column", params: { attribute:"column_name", values:params }}, function(response){
          if(response.status == 'success'){
            //update breadcrumb uri
            var selector = '#k_column-breadcrumb-' + columnId + ' a';
            var uriSelector = '#k_column-breadcrumb-' + columnId + ' a:nth-child(' + $(selector).length + ')' ;

            $(uriSelector).html( newColumnTitle );
            $(this).blur().next().focus();  return false;
          }
            
        });
        
      }
    }); 
  },

  showPaginationOption : function(column){
    var selector = "#krake-third-selection-" + column.columnId;
    var option = confirm("Has multiple pages?");

    if(option){
      var params = {
        attribute : 'current_state',
        values : {
          state : 'pre_next_pager_selection'
        }
      }
      
      chrome.extension.sendMessage({ action: "save_column" }, function(response){
        if(response.status == 'success'){
          NotificationManager.showNotification({
            type : 'info',
            title : Params.NOTIFICATION_TITLE_SELECT_NEXT_PAGER,
            message : Params.NOTIFICATION_MESSAGE_SELECT_NEXT_PAGER
          });
          //remove save column button
          var columnIdentifier = "#krake-column-" + column.columnId; 
          var selector = columnIdentifier + ' .krake-control-button-save';
          $(selector).remove();

          chrome.extension.sendMessage({ action:"edit_session", params: params }, function(response){
            if(response.status == 'success'){
              
            }
          });
        }
      });
    }//eo if
  },

  showLink : function(column){
    if(column.selection1.elementType.toLowerCase() == 'a'){
      var selector = '#krake-column-control-' + column.columnId;

      var linkButtonImageUrl = "background-image: url(\"" + chrome.extension.getURL("images/link.png") + "\");";

      var $linkButton = $("<button>", { class: "k_panel krake-control-button krake-control-button-link",
                                        style:  linkButtonImageUrl });

      $(selector).append($linkButton);

      $linkButton.bind('click', function(){
        var params = {
          attribute : 'previous_column',
          event : 'detail_link_clicked',
          values : {
            currentUrl : document.URL,
            columnId : column.columnId,
            elementLink : column.selection1.elementLink
          }
        }
      
        chrome.extension.sendMessage({ action:"get_session" }, function(response){ 
          console.log('-- get_session\n' + JSON.stringify(response) );
          if(response.session.currentColumn){
              //notify user to save column first
          }else{
          
            chrome.extension.sendMessage({ action:'edit_session', params : params}, function(response){
              if(response.status == 'success'){
                alert('column.genericXpath := ' + column.genericXpath);
                var results = KrakeHelper.evaluateQuery(column.genericXpath);
                //console.log(results.nodesToHighlight[0].href);
                window.location.href = results.nodesToHighlight[0].href;
              } 
            });
          } 
        });//eo sendMessage
      });//eo click
    }//eo if
    
  },//eo showLink

  addBreadCrumbToColumn : function(columnId){
    console.log('addBreadCrumbToColumn');

    chrome.extension.sendMessage({action: "get_breadcrumb", params:{columnId: columnId} }, function(response){
      if(response.status == 'success'){
        var breadcrumbArray = response.breadcrumbArray;
        
        var selector = "#k_column-breadcrumb-" + columnId;

        for(var i=breadcrumbArray.length-1; i>=0; i--){
          console.log("columnId:= " + breadcrumbArray[i].columnId + ", columnName:= " + breadcrumbArray[i].columnName);
          

          $link = $("<a>", { id: i,
                             class: "k_panel k_breadcrumb_link",  
                             href: breadcrumbArray[i].url,
                             text: breadcrumbArray[i].columnName }  );
      
     
          var id = breadcrumbArray[i].columnId;
          var href = breadcrumbArray[i].url;


          $link.unbind('click').bind('click', function(e){
            e.stopPropagation();
          });

          $(selector).append($link);

          if(i != 0)
            $(selector).append(" > ");
        } 
      }//eo if
    }); 
  }//eo addBreadCrumbToColumn
};//eo Panel

 
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
  mode : 'select_element', //'select_element', 'select_next_pager'

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
  
    chrome.extension.sendMessage({ action: 'get_session'}, function(response){
      var sessionManager = response.session;
      //console.log("--");
      //console.log(JSON.stringify(sessionManager));
      
      switch(sessionManager.currentState){
        case 'pre_next_pager_selection':

          chrome.extension.sendMessage({ action:'edit_current_column', params: { attribute:'next_pager', values:params}}, function(response){
            UIElementSelector.mode = 'select_element';
            console.log('-- select next Pager');
            console.log('status := ' + response.status);
            console.log('-- session\n' + JSON.stringify(response.session));
            console.log('-- sharedKrake\n' + JSON.stringify(response.sharedKrake));
          });
        break;

        case 'pre_selection_1':

          chrome.extension.sendMessage({ action:"edit_current_column", params: { attribute:"xpath_1", values:params }}, function(response){
            if(response.status == 'success'){
              var sessionManager = response.session;
              UIElementSelector.updateColumnText(sessionManager.currentColumn.columnId, 1, elementText, elementPathResult.nodeName);
              
              NotificationManager.showNotification({
                type : 'info',
                title : Params.NOTIFICATION_TITLE_PRE_SELECTION_2,
                message : Params.NOTIFICATION_MESSAGE_PRE_SELECTION_2
              });

              if(sessionManager.currentColumn.columnType == 'single'){
                chrome.extension.sendMessage({ action:"match_pattern" }, function(response){
                  console.log( JSON.stringify(response) );
                  if(response.status == 'success'){
                    
                    //highlight all elements depicted by genericXpath
                    UIElementSelector.highlightElements(response.column.url, response.column.genericXpath, response.column.colorCode);
                    //show pagination option
                    Panel.showPaginationOption(response.column);
                    //display 'link' icon
                    Panel.showLink(response.column);
                  }
                });
              }//eo if
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
                  if(response.patternMatchingStatus != 'matched'){
                    NotificationManager.showNotification({
                      type : 'error',
                      title : Params.NOTIFICATION_TITLE_SELECTIONS_NOT_MATCHED,
                      message : Params.NOTIFICATION_MESSAGE_SELECTIONS_NOT_MATCHED
                    });
                  }else{
                    //highlight all elements depicted by genericXpath
                    UIElementSelector.highlightElements(response.column.url, response.column.genericXpath, response.column.colorCode);
                    //show pagination option
                    Panel.showPaginationOption(response.column);
                    //display 'link' icon
                    Panel.showLink(response.column);
                  }//eo if-else
                }//eo if
              });
            }
          });
        break;
      }//eo switch
    });

  },

  highlightElements : function(url, genericXpath, colorCode){
    console.log("-- highlightElements");
    console.log(url + '\n' + genericXpath + '\n' + colorCode);
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

};//eo UIElementSelector

/***************************************************************************/
/**************************  Notifications  ********************************/
/***************************************************************************/

var NotificationManager = {
  myMessages : new Array('warning','error','success', 'info'),

  init : function(){
    // When message is clicked, hide it
    $('.k_message').click(function(){    
      $(this).animate({top: -$(this).outerHeight()}, 500);
    });
  },


  hideAllMessages : function(){
    var messagesHeights = new Array(); // this array will store height for each
   
    for (i=0; i<NotificationManager.myMessages.length; i++){
      messagesHeights[i] = $('.k_' + NotificationManager.myMessages[i]).outerHeight(); // fill array
      $('.k_' + NotificationManager.myMessages[i]).css('top', -messagesHeights[i]); //move element outside viewport   
    }//eo for
  },
  /*
   * @Param: params:obj
   *                type:string message type 'warning','error','success', 'info'
   *                title:string
   *                message:string
   */

  showNotification : function(params){
    NotificationManager.hideAllMessages();

    var notification = "";

    if(params.title)
      notification = notification + "<h3 class=\"k_panel\">" + params.title + "</h3>";

    if(params.message)
      notification = notification + "<p class=\"k_panel\">" + params.message + "</p>";
 
    notification = notification +
                   "<img id=\"k_message_close_button\" class=\"k_panel\" src=\"" + 
                   chrome.extension.getURL("images/close.png") + 
                   "\" alt=\"Smiley face\">";

    $('.k_'+params.type).html(notification);

    $('#k_message_close_button').bind('click', function(e){
      //trigger parent <div> click action
    });

    $('.k_'+params.type).animate({top:"0"}, 500);
  }
  
};//eo NotificationManager


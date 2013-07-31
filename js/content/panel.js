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
  Gary Teh <garyjob@krake.io>  
*/

/*
 *  This class manages the panel at the bottom of the page
 */
 
var Panel = {
  uiBtnCreateList : $("#btn-create-list"),
  uiBtnSelectSingle : $("#btn-select-single"),
  uiBtnEditPagination : $("#btn-edit-pagination"),
  uiBtnDone : $("#btn-done"),
  uiPanelWrapper : $("#inner-wrapper"),



  generateColumnId : function(){
   return Math.floor( Math.random() * 10000000000 );
  },



  init : function(behavioral_mode){
    jQuery('#panel-left button').tooltip();
    
    Panel.behavioral_mode = behavioral_mode;    
    Panel.uiBtnCreateList.bind('click', Panel.uiBtnCreateListClick);
    Panel.uiBtnCreateList.bind('click', {eventNumber: 'event_4'}, KrakeHelper.triggerMixpanelEvent);
    Panel.uiBtnSelectSingle.bind('click', Panel.uiBtnSelectSingleClick);
    Panel.uiBtnSelectSingle.bind('click', {eventNumber: 'event_5'}, KrakeHelper.triggerMixpanelEvent);
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
        //alert("You must finish editing the previous column");
        NotificationManager.showNotification({
          type : 'error',
          title : Params.NOTIFICATION_TITLE_PREVIOUS_COLUMN_NOT_SAVED,
          message : Params.NOTIFICATION_MESSAGE_PREVIOUS_COLUMN_NOT_SAVED
        });
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
        //alert("You must finish editing the previous column");
        NotificationManager.showNotification({
          type : 'error',
          title : Params.NOTIFICATION_TITLE_PREVIOUS_COLUMN_NOT_SAVED,
          message : Params.NOTIFICATION_MESSAGE_PREVIOUS_COLUMN_NOT_SAVED
        });
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



  uiBtnDoneClick : function(){
    //send mixpanel request
    KrakeHelper.triggerMixpanelEvent(null, 'event_11');
    NotificationManager.hideAllMessages();
    $('#json-output').modal('show');

    chrome.extension.sendMessage({ action:'get_krake_json' }, function(response){
      if(response.status == 'success'){

        //$('#json-definition').text(JSON.stringify(response.sharedKrake));        
        console.log('-- sharedKrake\n' + JSON.stringify(response.sharedKrake));
        
        $('#json-definition').text(JSON.stringify(response.krakeDefinition));        
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
    //show prompt
    NotificationManager.showOptionsYesNo({
      title: 'This is page part of a listing?',
      message: 'Pages belonging to a listing usually have hyperlinks that look like  ' +
        '<button disabled="disabled"> >> </button> or <button disabled="disabled">Next</button>',
      yesFunction : function(e){
        NotificationManager.hideAllMessages();
        selectNextPager();
      },
      noFunction : function(e){
        NotificationManager.hideAllMessages();
      }
    });

    var selectNextPager = function(){
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
                //alert('column.genericXpath := ' + column.genericXpath);
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
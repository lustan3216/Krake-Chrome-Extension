/*
 * Copyright 2013 Krake Pte Ltd.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author:
 * Joseph Yang <sirjosephyang@krake.io>
 */

/*
 * 'idle' => no column object attached
 * 'ready_for_selection' => a column object is in stage area for edit
 * 'ready_for_selection' => a column is added and ready for edit
 * 'first_column_selected' => xpath1 is selected
 * 'second_column_selected' => xpath2 is selected
 * 'ready_for_pagination_selection' => before pagination is defined
 */
var SessionManager = function(){
  this.currentState = 'idle';

  this.parentColumnId = null;
  this.previousColumn = null; //used for setting next_pager
  this.currentColumn = null;

  this.states = {
    'idle': {
	    'before': undefined,
	    'after': 'pre_selection_1',
	    'post_transition_event': undefined 
	  },
    'pre_selection_1': {
      'before': 'idle',
      'after': 'post_selection_1',
      'post_transition_event': undefined 
    },
    'post_selection_1': {
      'before': 'pre_selection_1',
      'after': 'pre_selection_2',
      'post_transition_event': undefined 
    },
    'pre_selection_2': {
      'before': 'post_selection_1',
      'after': 'post_selection_2',
      'post_transition_event': undefined 
    },
    'post_selection_2': {
      'before': 'pre_selection_2',
      'after': 'idle',
      'post_transition_event': undefined 
    }
  };//eo states
};

SessionManager.prototype.setInitialState = function(state){
  var self = this;
  self.currentState = state;
};

SessionManager.prototype.setEventForState = function(state, eventHandler){
  var self = this;
  self.states[state]['post_transition_event'] = eventHandler;
  //console.log('eventHandler for "' + state + '" set');
};

SessionManager.prototype.goToNextState = function(state){
  var self = this;

  if(!state){
    var previousState = self.states[self.currentState];
    self.currentState = previousState['after'];

    if(previousState['post_transition_event'] != undefined){
      (previousState['post_transition_event'])();
    }
  }else{
    self.currentState = state;
  }//eo if-else
};


/***************************************************************************/
/************************  SharedKrake Object   ****************************/
/***************************************************************************/

var SharedKrake = (function(){
  var instance = null;

  function init(){
    return {
      originUrl: null,
      destinationUrl: null,
      columns: []
    }; 
  };//eo init

  return{
    getInstance: function(){
      if(!instance){
        instance = init();
      }
      return instance;
    }
  };
})();

/*
module.exports = SharedKrake;

if(!module.parent) {
  var krake1 = SharedKrake.getInstance();
  krake1.originalUrl = "http://save_the_world";
  console.log("krake1.url := " + krake1.originalUrl);
  
  var krake2 = SharedKrake.getInstance();
  console.log("krake2.url := " + krake2.originalUrl);
};
*/

/*
module.exports = SessionManager;

//  The sequence below is called when command is called directly from the terminal
//    node tsp_test.js
if(!module.parent) {
  var sessionManager =  new SessionManager();
  console.log("initial state := " + sessionManager.currentState);
  sessionManager.setInitialState('first_column_selected');
  console.log(sessionManager.currentState);
  sessionManager.setEventForState('first_column_selected', function(){ console.log("hello world!"); });
  sessionManager.goToNextState();

  
  //console.log('initial state := ' + sessionManager.currentState);
  //sessionManager.goToNextState();
  //console.log('current state := ' + sessionManager.currentState);
  //sessionManager.goToNextState();
  //console.log('current state := ' + sessionManager.currentState);
  //sessionManager.goToNextState();
  //console.log('current state := ' + sessionManager.currentState);
  //sessionManager.goToNextState();
  //console.log('current state := ' + sessionManager.currentState);
  
}
*/

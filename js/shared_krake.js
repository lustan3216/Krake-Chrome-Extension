 /*
  * 'idle' => no column object attached
  * 'ready_for_selection' => a column object is in stage area for edit
  * 'ready_for_selection' => a column is added and ready for edit
  * 'first_column_selected' => xpath1 is selected
  * 'second_column_selected' => xpath2 is selected
  * 'ready_for_pagination_selection' => before pagination is defined
  */
var SessionManager = function()
{
  this.currentState = 'idle';

  this.parentColumnId = null;
  this.previousColumn = null; //used for setting next_pager
  this.currentColumn = null;

  this.states = {
    'idle': {
	  'before': undefined,
	  'after': 'ready_for_selection',
	  'post_transition_event': undefined 
	},
	'ready_for_selection': {
	  'before': 'idle',
	  'after': 'first_column_selected',
	  'post_transition_event': undefined 
	},
	'first_column_selected': {
	  'before': 'ready_for_selection',
	  'after': 'second_column_selected',
	  'post_transition_event': undefined 
	},
	'second_column_selected': {
	  'before': 'first_column_selected',
	  'after': 'idle',
	  'post_transition_event': undefined 
	},
	'ready_for_pagination_selection': {
	  'before': 'second_column_selected',
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

SessionManager.prototype.goToNextState = function(){
  var self = this;
  var previousState = self.states[self.currentState];
  self.currentState = previousState['after'];

  if(previousState['post_transition_event'] != undefined){
    (previousState['post_transition_event'])();
  }
// (self.states[self.currentState]['post_transition_event'])();
};



module.exports = SessionManager;

//  The sequence below is called when command is called directly from the terminal
//    node tsp_test.js
if(!module.parent) {
  var sessionManager =  new SessionManager();
  sessionManager.setInitialState('first_column_selected');
  console.log(sessionManager.currentState);
  sessionManager.setEventForState('first_column_selected', function(){ console.log("hello world!"); });
  sessionManager.goToNextState();

  /*
  console.log('initial state := ' + sessionManager.currentState);
  sessionManager.goToNextState();
  console.log('current state := ' + sessionManager.currentState);
  sessionManager.goToNextState();
  console.log('current state := ' + sessionManager.currentState);
  sessionManager.goToNextState();
  console.log('current state := ' + sessionManager.currentState);
  sessionManager.goToNextState();
  console.log('current state := ' + sessionManager.currentState);
  */
}
var Params = {
  IMAGE_TEXT : '{image}',
  DEFAULT_COLUMN_NAME : '*New Column Name*',

  NOTIFICATION_TITLE_PREVIOUS_COLUMN_NOT_SAVED : 'Ooops, there is an error!',
  NOTIFICATION_MESSAGE_PREVIOUS_COLUMN_NOT_SAVED : 'Please complete the column selection and click the save button first',

  NOTIFICATION_TITLE_IDLE : 'Get data from this page.',
  NOTIFICATION_MESSAGE_IDLE : 'Create a new column for your data-set by clicking either one of the two buttons below — ' + 
    '<button disabled="disabled">Select a list of items</button>, ' + 
    '<button disabled="disabled">Select a single item</button>',
  
  NOTIFICATION_TITLE_PRE_SELECTION_1 : 'You choosed to create a column to extract a list of items from this page',
  NOTIFICATION_MESSAGE_PRE_SELECTION_1 : '<ol>' + 
    '<li>Enter a name for this column</li>' +
    '<li>click on the first item on the list you want from this page</li>' +
    '<li>Items selectable on this page are highlighted in blue when you mouse over them</li><ol>',
  
  NOTIFICATION_TITLE_SINGLE_SELECTION : 'You choosed to create a column to extract a single of item from this page',
  NOTIFICATION_MESSAGE_SINGLE_SELECTION : '<ol>' + 
    '<li>Enter a name for this column</li>' + 
    '<li>Click on the item you want from this page.</li> ' +
    '<li>Items selectable on this page are highlighted in blue when you mouse over them</li></ol>',

  NOTIFICATION_TITLE_PRE_SELECTION_2 : 'Select second item the on the list you want in your column',
  NOTIFICATION_MESSAGE_PRE_SELECTION_2 : 'Krake will highlight the rest of the matches once you have done so. Selectable items are highlighted in blue',
  
  NOTIFICATION_TITLE_SELECTIONS_NOT_MATCHED : 'The two selections are not matched due to one of the following reasons:',
  NOTIFICATION_MESSAGE_SELECTIONS_NOT_MATCHED : '[1] Repeating selection of the same DOM element, and/or [2] Two selections are of different element type',
  
  NOTIFICATION_TITLE_SELECT_NEXT_PAGER : 'Select next pager',
  NOTIFICATION_MESSAGE_SELECT_NEXT_PAGER : 'Select a > or next button',

  NOTIFICATION_TITLE_SAVE_COLUMN_FAILED : 'Failed to save column',
  NOTIFICATION_MESSAGE_SAVE_COLUMN_FAILED : 'Please ensure the item selection is completed before saving the column'
};//eo Params
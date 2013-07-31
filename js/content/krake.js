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
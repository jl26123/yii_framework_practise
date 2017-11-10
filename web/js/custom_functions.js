//DOUBLE CLICK GLOBAL
var dc_prevent = false;
 
function double_click_check() {
	if ( dc_prevent === false ) {
		dc_prevent = true;
		return false;
	}
	return true
}

function set_loading_screen(str,nostate0) {		
	if ( nostate0 ) {
		var prompt_states = {
			state0: {
				html: str
			},
			state1: {
				html: "Unused"
			},
			state2: {
				html: 'Save Failed, please try again.'
			}
		}
	} else {
		var prompt_states = {
			state0: {
				html: 'Saving...',
				buttons: ''
			},
			state1: {
				html: str
			},
			state2: {
				html: 'Save Failed, please try again.'
			}
		}
	}

	return prompt_states;
}

//CONVERTS "XXXX-XX-XX" TO "XX-XX-XXXX"
function pretty_date(mysql_date) {
	if ( mysql_date != null ) {
		var str = mysql_date.split("-");
		str = str[1]+"-"+str[2]+"-"+str[0];
		
		if ( str == "00-00-0000" ) { str = ""; }
		return str;
	} else { return ""; }
}

//CONVERTS "XXXX-XX-XX XX:XX:XX" TO "XX-XX-XXXX" OR "XX-XX-XXXX XX:XX AM/PM" OR 05-29-14 11:20 AM
function pretty_datetime(mysql_date,justdate,justshort) {
	if ( mysql_date != null && mysql_date != "") {
		var t 		 	= mysql_date.split(/[- :]/);
		var timething	= "AM";
		t[3] 			= parseInt(t[3]);
		if ( t[3] > 11 ) { timething = "PM"; }
		if ( t[3] > 12 ) { t[3] = t[3] - 12; }
		
		if ( justdate && justshort ) {
			var new_date = t[1]+"-"+t[2]+"-"+t[0].substring(2,4);
		} else if ( justdate ) {
			var new_date = t[1]+"-"+t[2]+"-"+t[0];
		} else if ( justshort ) {
			var new_date = t[1]+"-"+t[2]+"-"+t[0].substring(2,4)+" "+t[3]+":"+t[4]+" "+timething;
		} else {
			var new_date = t[1]+"-"+t[2]+"-"+t[0]+" "+t[3]+":"+t[4]+" "+timething;
		}
		
		return new_date;
	} else { return ""; }
}

function pretty_datetime_long( mysql_date, notime ) {
	if ( mysql_date != null && mysql_date != "") {
		var t = mysql_date.split(/[- :]/);
		var d = new Date(t[0],t[1]-1,t[2],t[3],t[4],t[5])
		var timething	= "AM";
		t[3] 			= parseInt(t[3]);
		if ( t[3] > 11 ) { timething = "PM"; }
		if ( t[3] > 12 ) { t[3] = t[3] - 12; }
		
		var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
		
		if ( !notime ) {
			var new_date = days[d.getDay()]+", "+t[1]+"-"+t[2]+", "+t[3]+":"+t[4]+" "+timething;
		} else {
			var new_date = days[d.getDay()]+", "+t[1]+"-"+t[2];
		}
	
		return new_date;
	} else { return ""; }
	
}

//returns mysql format!
function get_current_date() {
	var d = new Date();
	var year = d.getFullYear();
	
	var month = (d.getMonth()+1);
	var day = d.getDate();
	var hours = d.getHours();
	var mins = d.getMinutes();
	var secs = d.getSeconds();
	if ( month < 10 ) { month = "0"+month; }
	if ( day < 10 ) { day = "0"+day; }
	if ( hours < 10 ) { hours = "0"+hours; }
	if ( mins < 10 ) { mins = "0"+mins; }
	if ( secs < 10 ) { secs = "0"+secs; }
	
	return year+"-"+month+"-"+day+" "+hours+":"+mins+":"+secs;
}

function cust_trim (str) {
	var	str = str.replace(/^\s\s*/, ''),
		ws = /\s/,
		i = str.length;
	while (ws.test(str.charAt(--i)));
	return str.slice(0, i + 1);
}

function test_parameter(bool) {
   if(typeof bool !== 'undefined') {
     return true;
   } else {
     return false;
   }
}





function sortSelect(selElem, sortVal) {

    // Checks for an object or string. Uses string as ID. 
    switch(typeof selElem) {
        case "string":
            selElem = document.getElementById(selElem);
            break;
        case "object":
            if(selElem==null) return false;
            break;
        default:
            return false;
    }

    // Builds the options list.
    var tmpAry = new Array();
    for (var i=0;i<selElem.options.length;i++) {
        tmpAry[i] = new Array();
        tmpAry[i][0] = selElem.options[i].text;
        tmpAry[i][1] = selElem.options[i].value;
    }

    // allows sortVal to be optional, defaults to text.
    switch(sortVal) {
        case "value": // sort by value
            sortVal = 1;
            break;
        default: // sort by text
            sortVal = 0;
    }
    tmpAry.sort(function(a, b) {
        return a[sortVal]*1 == b[sortVal]*1 ? 0 : a[sortVal]*1 > b[sortVal]*1 ? -1 : 1;
    });

    // removes all options from the select.
    while (selElem.options.length > 0) {
        selElem.options[0] = null;
    }

    // recreates all options with the new order.
    for (var i=0;i<tmpAry.length;i++) {
        var op = new Option(tmpAry[i][0], tmpAry[i][1]);
        selElem.options[i] = op;
    }

    return true;
}




function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function number_format(number, decimals, dec_point, thousands_sep) {
  //  discuss at: http://phpjs.org/functions/number_format/

  number = (number + '')
    .replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return s.join(dec);
}

function in_array(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

function isset ()
{
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: FremyCompany
    // +   improved by: Onno Marsman
    // +   improved by: Rafał Kukawski
    // *     example 1: isset( undefined, true);
    // *     returns 1: false
    // *     example 2: isset( 'Kevin van Zonneveld' );
    // *     returns 2: true

  var a = arguments,
    l = a.length,
    i = 0,
    undef;

  if (l === 0)
  {
    throw new Error('Empty isset');
  }

  while (i !== l)
  {
    if (a[i] === undef || a[i] === null)
    {
      return false;
    }
    i++;
  }
  return true;
}

 function sort_comm_descending(a, b) {
     var date1  = $(a).find('time').html();
	 var date2  = $(b).find('time').html();
	 
	 date1 		= date1.split(' ');
	 date1[0]	= date1[0].split('-');
	 date1[1]	= date1[1].split(':');
	 if ( date1[2] == "PM" ) { date1[1][0] = parseInt(date1[1][0])+12; }
     date1 = new Date(20+date1[0][2], parseInt(date1[0][0])-1, date1[0][1], date1[1][0], date1[1][1], 0 );
	
	 date2 		= date2.split(' ');
	 date2[0]	= date2[0].split('-');
	 date2[1]	= date2[1].split(':');
	 if ( date2[2] == "PM" ) { date2[1][0] = parseInt(date2[1][0])+12; }
     date2 = new Date(20+date2[0][2], parseInt(date2[0][0])-1, date2[0][1], date2[1][0], date2[1][1], 0 );
	 
     return date1 < date2 ? 1 : -1;
   };
   
   
function save_check_prompt(close_me,undo_if_false) {
	var prompt = {
		buttons: { "Leave this Page":false,"Stay on this Page":true },
		submit: function (e,v,m,f) {
			if ( v ) {
				$.prompt.close();
				undo_if_false();
			} else {
				$.prompt.close();
				close_me();
			}
		}
	}
	return prompt;
}   

function array_intersect(arr1) {
  //  discuss at: http://phpjs.org/functions/array_intersect/
  // original by: Brett Zamir (http://brett-zamir.me)
  //        note: These only output associative arrays (would need to be
  //        note: all numeric and counting from zero to be numeric)
  //   example 1: $array1 = {'a' : 'green', 0:'red', 1: 'blue'};
  //   example 1: $array2 = {'b' : 'green', 0:'yellow', 1:'red'};
  //   example 1: $array3 = ['green', 'red'];
  //   example 1: $result = array_intersect($array1, $array2, $array3);
  //   returns 1: {0: 'red', a: 'green'}

  var retArr = {},
    argl = arguments.length,
    arglm1 = argl - 1,
    k1 = '',
    arr = {},
    i = 0,
    k = '';

  arr1keys: for (k1 in arr1) {
    arrs: for (i = 1; i < argl; i++) {
      arr = arguments[i];
      for (k in arr) {
        if (arr[k] === arr1[k1]) {
          if (i === arglm1) {
            retArr[k1] = arr1[k1];
          }
          // If the innermost loop always leads at least once to an equal value, continue the loop until done
          continue arrs;
        }
      }
      // If it reaches here, it wasn't found in at least one array, so try next value
      continue arr1keys;
    }
  }

  return retArr;
}

function close_fancybox() {
	$.fancybox.close();
}

//fun

function spectrum(){
	var hue = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
	$('div.content-box').css("background-color", hue);
	
	setTimeout(function() {spectrum();}, 100);
}

function bodyspectrum() {
	var hue = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
	$('body').css("background-color", hue);
	
	setTimeout(function() {bodyspectrum();}, 50);
}

function listCookies() {
    var theCookies = document.cookie.split(';');
    var aString = [];
    for (var i = 1 ; i <= theCookies.length; i++) {
    	var a = theCookies[i-1].split("=");
    	var name = $.trim(a[0]);
    	var value = $.trim(a[1]);
    	var size = theCookies[i-1].length; 
    	try {
    		aString.push({name:name,size:size,value:JSON.parse(value)});
    	} catch (err) {
    		//do nothing	
    	}        
    }
    return aString;
}
function super_random() {
	return ''+Math.floor((Math.random() * 99999) + 1)+$.now()+Math.floor((Math.random() * 99999)+1);	
}

function custom_sprintf(){
	var arguments_arr = [].slice.apply(arguments);
	var str = arguments_arr.slice(0,1)[0];
	var args = arguments_arr.slice(1);
	return str.replace(/{(\d+)}/g, function(match, number) { 
		return typeof args[number] != 'undefined'
			? args[number]
			: match
			;
    });
}

//use unescape to unencode
function custom_encode_string(str){
	str = str.replace(/\;/g,"%3B");
	str = str.replace(/\:/g,"%3A");
	str = str.replace(/\(/g,"%28");
	str = str.replace(/\)/g,"%29");
	str = str.replace(/\{/g,"%7B");
	str = str.replace(/\}/g,"%7D");
	str = str.replace(/\[/g,"%5B");
	str = str.replace(/\]/g,"%5D");
	str = str.replace(/\*/g,"%2A");
	str = str.replace(/\>/g,"%3E");
	str = str.replace(/\</g,"%3C");
	
	return str;
}
function format_10_digit(num) {
	if ( num.length === 10 ) {
		return num.substr(0,3)+"-"+num.substr(3,3)+"-"+num.substr(6);
	}
	return num;
}

//http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}

//http://stackoverflow.com/questions/2897155/get-cursor-position-in-characters-within-a-text-input-field
function getInputPosition(element){
    var value = element.value;
    return value.slice(0,element.selectionStart).length;
}

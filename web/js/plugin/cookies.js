/**
 * Cookies - A small class to manipulate cookies from javascript
 *
 * Compressed version: https://gist.github.com/4147384 
 * 
 * @see 	www.quirksmode.org/js/cookies.html
 * @author	Anis uddin Ahmad <anisniit@gmail.com>  
 */

window.Cookies = {

    /**
     * Set/Overwrite a cookie value
     *
     * @param name
     * @param value
     * @param days      OPTIONAL Days till this cookie will stay valid. Default is current session
     * @param path      OPTIONAL domain root will be used by default
     * Added Auto GC so that it doesn't go over the 8MB limit
     */
    set: function(name, value, days, path) {
        if (days) {
            var date = new Date();
                date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        } else var expires = "";

        var dir = path || '/';
        document.cookie = name+"="+value+expires+"; path="+dir;
        this.gc();
    },

    /**
     * Retrieve a cookie value
     *
     * @param name
     * @return String|null
     */
    get: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    },

    /**
     * Remove a cookie
     *
     * @param name
     */
    delete: function(name) {
        this.set(name,"",-1);
    },
    
    
    /**
     * Garabage clean up to prevent 8MB cap -- Doug
     * Automagically removes oldest entry until memory free.
     * @param name
     */
	gc: function() {
	    var theCookies = document.cookie.split(';');
	    var values = [];
	    var total_size = 0;
	    for (var i = 1 ; i <= theCookies.length; i++) {
	    	var a = theCookies[i-1].split("=");
	    	var name = $.trim(a[0]);
	    	var value = $.trim(a[1]);
	    	var size = theCookies[i-1].length;
	    	total_size += size; 
	    	try {
	    		values.push({name:name,size:size,value:JSON.parse(value)});
	    	} catch (err) {
	    		//do nothing	
	    	}        
	    }
	    var i = 0;
	    var t;
	    while ( total_size > 8000 ) {
	    	t = values[i++];
	    	total_size -= t.size;
	    	this.delete(t.name);	    
	    }

	} 
};
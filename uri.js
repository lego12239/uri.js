/* uri | uri 0.9.0 | License - GNU LGPL 3 */
/*
  This library is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.

  https://github.com/lego12239/uri.js
*/
"use strict";


function uri()
{
    this.load();
}

uri.prototype.load = function ()
{
    var q = "";
    var a, vp, val;
    var i;


    this.fragment = "";
    this.query = {};

    this.scheme = location.protocol.substr(0, location.protocol.length - 1);
    this.authority = location.host;
    this.host = location.hostname;
    this.port = location.port;
    this.path = location.pathname;
    if ( location.search != "" )
	q = location.search.substr(1);
    if ( location.hash != "" )
	this.fragment = decodeURIComponent(location.hash.substr(1));

    if ( q != "" ) {
	a = q.split("&");
	for(i = 0; i < a.length; i++) {
	    vp = a[i].split("=");
	    if ( this.query[decodeURIComponent(vp[0])] == undefined )
		this.query[decodeURIComponent(vp[0])] = decodeURIComponent(vp[1]);
	    else {
		if ( this.query[decodeURIComponent(vp[0])] instanceof Array )
		    this.query[decodeURIComponent(vp[0])].push(decodeURIComponent(vp[1]));
		else {
		    val = this.query[decodeURIComponent(vp[0])];
		    this.query[decodeURIComponent(vp[0])] = [ val,
							      decodeURIComponent(vp[1]) ];
		}
	    }
	}
    }
}

uri.prototype.go = function ()
{
    var href;
    var p, i;
    var is_first = 1;


    href = this.scheme + "://" + this.authority + this.path;
    if ( Object.keys(this.query).length != 0 ) {
	href += "?";
	for(p in this.query) {
	    if ( this.query[p] instanceof Array ) {
		for(i = 0; i < this.query[p].length; i++) {
		    if ( ! is_first ) {
			href += "&";
		    } else
			is_first = 0;
		    href += encodeURIComponent(p) + "=" + encodeURIComponent(this.query[p][i]);
		}
	    } else {
		if ( ! is_first ) {
		    href += "&";
		} else
		    is_first = 0;
		href += encodeURIComponent(p) + "=" + encodeURIComponent(this.query[p]);
	    }
	}
    }
    if ( this.fragment != "" )
	href += "#" + this.fragment;

    location.href = href;
}

uri.prototype.trunc = function ()
{
    this.query = {};
    this.fragment = "";
}

uri.prototype.query_fill = function (obj)
{
    var i;


    for (i in obj) {
	this.query[i] = obj[i];
    }
}


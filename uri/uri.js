/* uri | uri 0.11.0 | License - GNU LGPL 3 */
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

function uri_parse(str)
{
	var m, mauth, tmp;
	var obj = {_: {}};
	
	if ((str == null) || (str.match(/^\s*$/)))
		return null;
	m = str.match(/^(([A-Za-z][A-Za-z0-9+.-]*):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
	if (m[1] != null)
		obj._.scheme = _uri_val(m[2], "l");
	if (m[3] != null) {
		tmp = _uri_val(m[4]);
		mauth = tmp.match(/^(([^@]*)@)?(\[(.+)\]|([^:]+))(:([0-9]*))?$/);
		obj._.authority = {};
		if (mauth[1] != null)
			obj._.authority.userinfo = _uri_val(mauth[2], "d");
		if (mauth[4] != null)
			obj._.authority.host = _uri_val(mauth[4], "dl");
		else if (mauth[5] != null)
			obj._.authority.host = _uri_val(mauth[5], "dl");
		if (mauth[6] != null)
			obj._.authority.port = _uri_val(mauth[7]);
	}
	if ((m[5] != null) && (m[5] != ""))
		obj._.path = _uri_val(m[5]);
	if (m[6] != null)
		obj._.query = _uri_val(m[7]);
	if (m[8] != null)
		obj._.fragment = _uri_val(m[9]);
	
	if (uri_schemes[obj._.scheme] != null)
		uri_schemes[obj._.scheme].parse(obj);
	
	return obj;
}

function _uri_val(val, mod)
{
	var i;
	
	if ((val != null) && (val != "") && (mod != null)) {
		for(i = 0; i < mod.length; i++) {
			switch (mod.charAt(i)) {
			case 'l':
				val = val.toLowerCase();
				break;
			case 'd':
				val = decodeURIComponent(val);
				break;
			case 'e':
				val = encodeURIComponent(val);
				break;
			default:
				throw("unknown modifier: '" + mod.charAt(i) + "'");
			}
		}
	}
	return val;
}

function uri_compose(obj)
{
	var str = "";
	
	if (obj == null)
		return null;
	if (Object.prototype.toString.call(obj) != "[object Object]")
		throw("argument is not an object");

	if (uri_schemes[obj.scheme] != null)
		uri_schemes[obj.scheme].compose(obj);
	
	if (obj._.scheme != null)
		str += _uri_val(obj._.scheme, "l") + ":";
	if (obj._.authority != null) {
		if (Object.prototype.toString.call(obj._.authority) != "[object Object]")
			throw("_.authority is not an object");
		str += "//";
		if (obj._.authority.userinfo != null)
			str += _uri_val(obj._.authority.userinfo, "e") + "@";
		if (obj._.authority.host != null)
			if (obj._.authority.host.match(/:/))
				str += "[" + _uri_val(obj._.authority.host, "le") + "]";
			else
				str += _uri_val(obj._.authority.host, "le");
		if (obj._.authority.port != null)
			str += ":" + obj._.authority.port;
	}
	if (obj._.path != null)
		str += obj._.path;
	if (obj._.query != null)
		str += "?" + obj._.query;
	if (obj._.fragment != null)
		str += "#" + obj._.fragment;
	
	return str;
}

var uri_schemes = {};

/* uri | uri 1.0.0 | License - GNU LGPL 3 */
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
		if (mauth != null) {
			if (mauth[1] != null)
				obj._.authority.userinfo = _uri_val(mauth[2], "d");
			if (mauth[4] != null)
				obj._.authority.host = _uri_val(mauth[4], "dl");
			else if (mauth[5] != null)
				obj._.authority.host = _uri_val(mauth[5], "dl");
			if (mauth[6] != null)
				obj._.authority.port = _uri_val(mauth[7]);
		}
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
/**********************************************************************
 * HTTP, HTTPS
 **********************************************************************/
function uri_parse_http(obj)
{
	var a, i, vp, val;
	
	obj.scheme = obj._.scheme;
	if (obj._.authority != null) {
		obj.authority = {};
		obj.authority.userinfo = obj._.authority.userinfo;
		obj.authority.host = obj._.authority.host;
		obj.authority.port = obj._.authority.port;
		if ((obj.authority.port == null) || (obj.authority.port == ""))
			if (obj.scheme == "http")
				obj.authority.port = 80;
			else
				obj.authority.port = 443;
	}
	obj.path = _uri_val(obj._.path, "d");
	if (obj._.query != null) {
		a = obj._.query.split("&");
		obj.query = {};
		for(i = 0; i < a.length; i++) {
			vp = a[i].split("=");
			if (obj.query[decodeURIComponent(vp[0])] == null)
				obj.query[decodeURIComponent(vp[0])] = decodeURIComponent(vp[1]);
			else {
				if (obj.query[decodeURIComponent(vp[0])] instanceof Array)
					obj.query[decodeURIComponent(vp[0])].push(decodeURIComponent(vp[1]));
				else {
					val = obj.query[decodeURIComponent(vp[0])];
					obj.query[decodeURIComponent(vp[0])] = [val,
					  decodeURIComponent(vp[1])];
				}
			}
		}
	}
	obj.fragment = _uri_val(obj._.fragment, "d");
}

function uri_compose_http(obj)
{
	var p, i;
	
	obj._ = {};
	obj._.scheme = _uri_val(obj.scheme, "l");
	if (obj.authority != null) {
		if (Object.prototype.toString.call(obj.authority) != "[object Object]")
			throw("authority is not an object");
		obj._.authority = {};
		if (obj.authority.userinfo != null)
			obj._.authority.userinfo = obj.authority.userinfo;
		if (obj.authority.host != null)
			obj._.authority.host = obj.authority.host;
		if (obj.authority.port != null)
			if (((obj.authority.port != 80) && (obj._.scheme == "http")) ||
			    ((obj.authority.port != 443) && (obj._.scheme == "https")))
				obj._.authority.port = obj.authority.port;
	}
	if (obj.path == null)
		obj.path = "";
	p = obj.path.split("/");
	p = p.map(function (x) {return _uri_val(x, "e");});
	obj._.path = p.join("/");
	if (obj.query != null) {
		if (Object.prototype.toString.call(obj.query) != "[object Object]")
			throw("query is not an object");
		obj._.query = "";
		for(p in obj.query) {
			if (obj.query[p] instanceof Array) {
				for(i = 0; i < obj.query[p].length; i++) {
					if (obj._.query != "")
						obj._.query += "&";
					obj._.query += encodeURIComponent(p) + "=" +
					  encodeURIComponent(obj.query[p][i]);
				}
			} else {
				if (obj._.query != "")
					obj._.query += "&";
				obj._.query += encodeURIComponent(p) + "=" +
				  encodeURIComponent(obj.query[p]);
			}
		}
	}
	obj._.fragment = _uri_val(obj.fragment, "e");
}

uri_schemes.http = {
		parse: uri_parse_http,
		compose: uri_compose_http};
uri_schemes.https = {
		parse: uri_parse_http,
		compose: uri_compose_http};
/**********************************************************************
 * MAILTO
 * - if "scheme", "_" or "e" field is exist in query part, it is saved as
 *   a property of "e" property.
 * - for composing: to include "scheme", "_" or "e" fields, insert it
 *   into "e" property of an object
 **********************************************************************/
function uri_parse_mailto(obj)
{
	var a, i, vp;
	
	obj.scheme = obj._.scheme;
	if (obj._.authority != null)
		throw("mailto scheme mustn't contains authority");
	if (obj._.path != null)
		obj.to = obj._.path;
	if (obj._.query != null) {
		a = obj._.query.split("&");
		for(i = 0; i < a.length; i++) {
			vp = a[i].split("=");
			vp[0] = _uri_val(vp[0], "dl");
			if ((vp[0] == "_") ||
			    (vp[0] == "scheme") ||
			    (vp[0] == "e")) {
				if (obj.e == null)
					obj.e = {};
				obj.e[vp[0]] = vp[1];
			} else {
				obj[vp[0]] = vp[1];
			}
		}
	}
}

function uri_compose_mailto(obj)
{
	var p, p2, q = "", tmp;
	
	obj._ = {};
	obj._.scheme = obj.scheme;
	for(p in obj) {
		if ((p == "_") || (p == "scheme"))
			continue;
		tmp = _uri_val(p, "le");
		if (tmp == "e") {
			if (Object.prototype.toString.call(obj[p]) != "[object Object]")
				throw("mailto: e property must be an object");
			for(p2 in obj[p]) {
				tmp = _uri_val(p2, "le");
				if (q != "")
					q += "&";
				q += tmp + "=" + obj[p][p2];
			}
			continue
		}
		if (Object.prototype.toString.call(obj[p]) == "[object Object]")
			throw("mailto: \"" + p + "\" property can't be an object");
		if (tmp == "to") {
			obj._.path = obj[p];
			continue;
		}
		if (q != "")
			q += "&";
		q += tmp + "=" + obj[p];
	}
	if (q != "")
		obj._.query = q;
}

uri_schemes.mailto = {
		parse: uri_parse_mailto,
		compose: uri_compose_mailto};
/**********************************************************************
 * MAILTO advanced
 * - must be included after mailto.js
 * - see mailto.js for "scheme", "_" and "e" fields info
 * - parse multiple addresses in From, Reply-To, To, Cc, Bcc, Resent-*
 *   into array instead of string
 * - decode every field value except From, Reply-To, To, Cc, Bcc, Resent-*,
 *   Return-Path, Received
 **********************************************************************/
function uri_parse_mailto_a(obj)
{
	var a, p, p2;
	
	uri_parse_mailto(obj);
	for(p in obj) {
		if ((p == "_") || (p == "scheme") || (obj[p] == null))
			continue;
		if (p == "e") {
			for(p2 in obj[p]) {
				obj[p][p2] = _uri_val(obj[p][p2], "d");
			}
			continue;
		}
		switch (p) {
		case "from":
		case "reply-to":
		case "to":
		case "cc":
		case "bcc":
		case "resent-from":
		case "resent-to":
		case "resent-cc":
		case "resent-bcc":
			a = obj[p].split(/\s*,\s*/);
			obj[p] = a;
			break;
		case "return-path":
		case "received":
			break;
		default:
			obj[p] = _uri_val(obj[p], "d");
			break;
		}
	}
}

function uri_compose_mailto_a(obj)
{
	var p, str, tmp;
	
	for(p in obj) {
		if ((p == "_") || (p == "scheme"))
			continue;
		tmp = _uri_val(p, "le");
		if (tmp == "e") {
			for(p2 in obj[p]) {
				obj[p][p2] = _uri_val(obj[p][p2], "e");
			}
			continue;
		}
		switch (tmp) {
		case "from":
		case "reply-to":
		case "to":
		case "cc":
		case "bcc":
		case "resent-from":
		case "resent-to":
		case "resent-cc":
		case "resent-bcc":
			if (Array.isArray(obj[p]))
				obj[p] = obj[p].join(",");
			break;
		case "return-path":
		case "received":
			break;
		default:
			obj[p] = _uri_val(obj[p], "e");
			break;
		}
	}
	uri_compose_mailto(obj);
}

uri_schemes.mailto = {
		parse: uri_parse_mailto_a,
		compose: uri_compose_mailto_a};

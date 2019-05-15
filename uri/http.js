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

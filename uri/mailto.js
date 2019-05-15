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

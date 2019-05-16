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

SRC ?= uri/uri.js 

solid: uri.solid.js

uri.solid.js: $(SRC)
	cat $^ > uri.solid.js

minify: uri.solid.js
	jsmin < $^ > uri.solid.min.js
	sed -ne '1 p; 2 q' $^ > uri.solid.min.js.tmp
	cat uri.solid.min.js >> uri.solid.min.js.tmp
	mv uri.solid.min.js.tmp uri.solid.min.js

clean:
	find . -name '*~' -exec rm -f '{}' \+

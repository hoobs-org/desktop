desktop: clean paths locals lint
	./node_modules/.bin/vue-cli-service electron:build --win --mac
	rm -f builds/hoobs-desktop-v$(shell project version).exe
	rm -f builds/hoobs-desktop-v$(shell project version).dmg
	mv "dist/HOOBS Setup $(shell project version).exe" builds/hoobs-desktop-v$(shell project version).exe
	mv "dist/HOOBS-$(shell project version).dmg" builds/hoobs-desktop-v$(shell project version).dmg
	rm -fR dist

paths:
	mkdir -p builds
	mkdir -p dist
	mkdir -p src/lang/locals

locals:
	cp ../lang/builds/* src/lang/locals/
	cp ../lang/countries.json src/lang/
	cp ../lang/icons.json src/lang/

lint:
	./node_modules/.bin/vue-cli-service lint

clean:
	rm -fR dist

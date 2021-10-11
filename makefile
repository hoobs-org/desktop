desktop: clean lint paths deploy
	./node_modules/.bin/vue-cli-service electron:build --win --mac
	rm -f builds/hoobs-desktop-v$(shell project version).exe
	rm -f builds/hoobs-desktop-v$(shell project version).dmg
	mv "dist/HOOBS Setup $(shell project version).exe" builds/hoobs-desktop-v$(shell project version).exe
	mv "dist/HOOBS-$(shell project version).dmg" builds/hoobs-desktop-v$(shell project version).dmg
	rm -fR dist

lint:
	./node_modules/.bin/vue-cli-service lint

paths:
	mkdir -p builds
	mkdir -p dist
	mkdir -p lang/locals

deploy:
	cp ../lang/builds/* src/lang/locals/
	cp ../lang/countries.json src/lang/
	cp ../lang/emojis.json src/lang/

clean:
	rm -fR dist

desktop: clean lint paths
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

clean:
	rm -fR dist

REMOTE_HOST=root@$$(cat server-ip.txt)

all:
	echo "Nothing to do"

clean:
	-rm -rf dist/

build:
	wf run babelify
	wf run stylus

dist: clean build
	mkdir dist
	cp -R public dist/public
	cp -R views dist/views
	cp server.js dist/
	cp run.sh dist/
	cp package.json dist/
	cp big-band.service dist/

deploy: build
	ssh $(REMOTE_HOST) "systemctl disable --now big-band.service || true"
	ssh $(REMOTE_HOST) "rm /etc/systemd/system/big-band.service || true"
	ssh $(REMOTE_HOST) "rm -rf dist/ || true"
	scp -r dist $(REMOTE_HOST):.
	ssh $(REMOTE_HOST) "cd dist; npm install --production"
	ssh $(REMOTE_HOST) "cp dist/big-band.service /etc/systemd/system/big-band.service"
	ssh $(REMOTE_HOST) "systemctl enable --now big-band.service"
	# ssh $(REMOTE_HOST) "systemctrl disable big-band.service"


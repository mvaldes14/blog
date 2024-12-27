dev:
	npx quartz build --serve
sync:
	rsync -r /mnt/c/Users/migue/Documents/wiki/Blog/ content

clean:
	rm -rf public

publish:
	npx quartz sync


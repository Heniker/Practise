main: begin start-app

begin:
	cd client 
	npm i
	cd ../server
	npm i

start-app:
	gnome-terminal -x bash -c "cd client && npm run serve"
	gnome-terminal -x bash -c "cd server && node index"


.ONESHELL:

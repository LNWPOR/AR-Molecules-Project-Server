var shortId 	=	require('shortid'),
	User 		= 	require('../models/user'),
	Molecule    = 	require('../models/molecule'),
	bcrypt      =   require('bcrypt-nodejs');

module.exports = function(io){	
	var clients = [];

	io.on('connection', function (socket){
		console.log("socket.io avariable");
		var currentUser;
		var result = {
			code:200,
			result:"success"
		}
		socket.emit("NET_AVARIABLE",result);


		socket.on("SIGNUP", function(data){
			onSignUp(data);
		});

		socket.on("SIGNIN", function(data){
			onSignIn(data);
		});

		socket.on("ADD_MOLECULE", function(data){
			onAddMolecule(data);
		});

		socket.on("GET_All_mainEditMoleculeJSON",function(){
			onGetAllMolecule();
		});


		socket.on("disconnect", function (){
			removeUserLobby();
		});

		removeUserLobby = function(){
			// socket.broadcast.emit('USER_DISCONNECTED',currentUser);
			for (var i = 0; i < clients.length; i++) {
				if (clients[i].name === currentUser.name && clients[i].id === currentUser.id) {

					console.log("User "+clients[i].name+" id: "+clients[i].id+" has disconnected");
					clients.splice(i,1);
					// playerReadyCount--;

				};
			};
		}

		onSignUp = function(data){
			User.findOne ({username: data.username}, function(err, user) {
				var dataSent;
				if(user){
					console.log(data.username + " already exist");
					dataSent = {
						status:0,
						log:"This username is already exist"
					}
				}else if(!user){
					var hash = bcrypt.hashSync(data.password);
					var user = new User({ username:data.username ,password: hash ,highScore:0});
					user.save(function(err) {
					    if(err) {
					     	console.log(err);
					     	dataSent = {
								status:0,
								log:"some error occur during the save.please try again later"
							}
					    } else {
					      	console.log('user: ' + user.username + " saved.");
					      	dataSent = {
								status:1,
								log:"signup success"
							}
					    }
					});
				}else{
					console.log(err);
					var dataSent = {
						status:0,
						log:"some error occur"
					}
				}
				socket.emit("SIGNUP_READY", dataSent );
			});
		}

		onSignIn = function(data){
			User.findOne ({username: data.username}, function(err, user) {
				var dataSent;
				if(user){
					if(bcrypt.compareSync(data.password, user.password)){
						console.log(user.username + " signin success");
						currentUser = {
							id:user._id,
							username:user.username
						}
						dataSent = {
							status:1,
							log:"signin success",
							id:user._id,
							username:user.username
						}
						listOfUsers();
					}else{
						dataSent = {
							status:0,
							log:"wrong username or password"
						}
					}
				}else{
					console.log(err);
					dataSent = {
						status:0,
						log:"cannot find your username"
					}
				}
				socket.emit("CONNECTED", dataSent);
		  	})
		}

		onAddMolecule = function(data){
			// console.log(data);
			var molecule = new Molecule(data);
			molecule.save(function(err) {
				var dataSent;
			    if(err) {
			     	console.log(err);
			     	var dataSent = {
						status:1,
						log:"some error occur during the save.please try again later"
					}
					
			    } else {
			    	var dataSent = {
						status:1,
						log:"save success"
					}
			      	console.log(molecule.name + " saved.");
			    }
			    socket.emit("SAVED", dataSent);
			});
		}

		// onGetMolecule = function(data){
		// 	Molecule.find ({name: data.name}, function(err, molecule) {
		// 		if(molecule){
		// 			mainMolecule = {
		// 				name:molecule.name,
		// 				ownerID:molecule.ownerID,
		// 				moleculeObjectsList:molecule.moleculeObjectsList
		// 			}
		// 			socket.emit("GET_mainEditMoleculeJSON", mainMolecule );
		// 		}else{
		// 			console.log(err);
		// 		}  
		//   	});
		// }

		onGetAllMolecule = function(){
			Molecule.find(function(err, molecules) {
				var dataSent;
				if(molecules){
					//console.log(molecules);
					for(var i = 0 ; i < molecules.length;i++){
						dataSent = {
							status:1,
							log:"get molecules success",
							name:molecules[i].name,
							ownerID:molecules[i].ownerID,
							moleculeObjectsList:molecules[i].moleculeObjectsList
						}
						socket.emit("GET_All_mainEditMoleculeJSON", dataSent);
					}
					
				}else{
					console.log(err);
					dataSent = {
						status:0,
						log:"some error occur during the save.please try again later"
					}
					socket.emit("GET_All_mainEditMoleculeJSON", dataSent);
				}
		  	});
		}
	});

	listOfUsers = function (){
		for( var i = 0; i < clients.length; i++ ){
			console.log("Now "+clients[i].name+" ONLINE");
		}
		console.log('----------------------------------------');
	}

	getType = function(val){
	    if (typeof val === 'undefined') return 'undefined';
	    if (typeof val === 'object' && !val) return 'null';
	    return ({}).toString.call(val).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	}
}
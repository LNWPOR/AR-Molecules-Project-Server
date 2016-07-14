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
				if(user){
					console.log(data.username + " already exist");
					var signUpResult = {
						status:0
					}
					socket.emit("SIGNUP_READY", signUpResult );
				}else if(!user){
					var hash = bcrypt.hashSync(data.password);
					var user = new User({ username:data.username ,password: hash ,highScore:0});
					user.save(function(err) {
					    if(err) {
					     	console.log(err);
					     	var signUpResult = {
								status:0
							}
							socket.emit("SIGNUP_READY", signUpResult );
					    } else {
					      	console.log('user: ' + user.username + " saved.");
					      	var signUpResult = {
								status:1
							}
							socket.emit("SIGNUP_READY", signUpResult );
					    }
					});
				}else{
					console.log(err);
					var signUpResult = {
						status:0
					}
					socket.emit("SIGNUP_READY", signUpResult );
				}
			});
		}

		onSignIn = function(data){
			User.findOne ({username: data.username}, function(err, user) {
				if(user){
					if(bcrypt.compareSync(data.password, user.password)){
						console.log(user.username + " Signin success");
						currentUser = {
							id:user._id,
							username:user.username
						}
						socket.emit("CONNECTED", currentUser );
						listOfUsers();
					}
				}else{
					console.log(err);
				}  
		  	})
		}

		onAddMolecule = function(data){
			// console.log(data);
			var molecule = new Molecule(data);
			molecule.save(function(err) {
			    if(err) {
			     	console.log(err);
			    } else {
			      	console.log(molecule.name + " saved.");
			  //     	var signUpResult = {
					// 	status:1
					// }
					// socket.emit("SIGNUP_READY", signUpResult );
			    }
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
			//console.log("gg");
			// molecule = {
			// 	name:"gg"
			// }
			//socket.emit("GET_All_mainEditMoleculeJSON", molecule );
			Molecule.find(function(err, molecules) {
				if(molecules){
					//console.log(molecules);
					for(var i = 0 ; i < molecules.length;i++){
						molecule = {
							name:molecules[i].name,
							ownerID:molecules[i].ownerID,
							moleculeObjectsList:molecules[i].moleculeObjectsList
						}
						socket.emit("GET_All_mainEditMoleculeJSON", molecule );
					}
					
				}else{
					console.log(err);
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
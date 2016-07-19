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

		socket.on("SIGNOUT", function(){
			onUserDisconnect();
		});

		socket.on("ADD_MOLECULE", function(data){
			onAddMolecule(data);
		});

		socket.on("GET_All_mainEditMoleculeJSON",function(){
			onGetAllMolecule();
		});

		socket.on("disconnect", function (){
			onUserDisconnect();
		});

		onUserDisconnect = function(){
			currentUser = null;
			var dataSent = {
				log:"signout success"
			}
			socket.emit('USER_DISCONNECTED', dataSent);
		}

		onSignUp = function(data){
			User.findOne ({username: data.username}, function(err, user) {
				if(user){
					console.log(data.username + " already exist");
					var dataSent = {
						status:0,
						log:"This username is already exist"
					}
					socket.emit("SIGNUP_READY", dataSent );
				}else if(!user){
					var hash = bcrypt.hashSync(data.password);
					var user = new User({ username:data.username ,password: hash});
					user.save(function(err) {
					    if(err) {
					     	console.log(err);
					     	var dataSent = {
								status:0,
								log:"some error occur during the save.please try again later"
							}
							socket.emit("SIGNUP_READY", dataSent );
					    } else {
					      	console.log('user: ' + user.username + " saved");
					      	var dataSent = {
								status:1,
								log:"signup success"
							}
							socket.emit("SIGNUP_READY", dataSent );
					    }
					});
				}else{
					console.log(err);
					var dataSent = {
						status:0,
						log:"some error occur.please try again later"
					}
					socket.emit("SIGNUP_READY", dataSent );
				}
			});
		}

		onSignIn = function(data){
			User.findOne ({username: data.username}, function(err, user) {
				if(user){
					if(bcrypt.compareSync(data.password, user.password)){
						console.log(user.username + " signin success");
						currentUser = {
							id:user._id,
							username:user.username
						}
						var dataSent = {
							status:1,
							log:"signin success",
							id:user._id,
							username:user.username
						}
						socket.emit("CONNECTED", dataSent);
					}else{
						var dataSent = {
							status:0,
							log:"wrong username or password"
						}
						socket.emit("CONNECTED", dataSent);
					}
				}else if(!user){
					console.log(err);
					var dataSent = {
						status:0,
						log:"cannot find your username"
					}
					socket.emit("CONNECTED", dataSent);
				}else{
					console.log(err);
					var dataSent = {
						status:0,
						log:"some error occur.please try again later"
					}
					socket.emit("CONNECTED", dataSent);
				}
				
		  	})
		}

		onAddMolecule = function(data){
			// console.log(data);
			Molecule.findOne({name: data.name}, function(err, molecule) {
				if(!molecule){
					var newMolecule = new Molecule(data);
					newMolecule.save(function(err) {
					    if(err) {
					     	console.log(err);
					     	var dataSent = {
								status:0,
								log:"some error occur during the save.please try again later"
							}
							socket.emit("SAVED", dataSent);
							
					    } else {
					    	var dataSent = {
								status:1,
								log:"save success"
							}
							socket.emit("SAVED", dataSent);
					      	console.log(newMolecule.name + " saved.");
						}
					});
				}else if(molecule){
					console.log(err);
					var dataSent = {
						status:0,
						log:"this molecule name already exist.please try the other name"
					}
					socket.emit("SAVED", dataSent);
				}else{
					console.log(err);
					var dataSent = {
						status:0,
						log:"some error occur.please try again later"
					}
					socket.emit("SAVED", dataSent);
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
			Molecule.find(function(err, molecules) {
				if(molecules){
					//console.log(molecules);
					for(var i = 0 ; i < molecules.length;i++){
						var dataSent = {
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
					var dataSent = {
						status:0,
						log:"some error occur.please try again later"
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
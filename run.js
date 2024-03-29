var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var workers = [];

if (numCPUs == 1){
	require('./server.js')(1);
} else

if (cluster.isMaster){

	cluster.on('fork', function(worker){
		console.log('Attempting to fork worker');
	});

	cluster.on('online', function(worker){
		console.log('Successfully forked worker' , worker.process.pid);
	})

	for (var i = 0 ; i < numCPUs ; i ++){
		console.log('Forking child');
		workers[i] = cluster.fork();
	}

} else{
	console.log(cluster.worker.id);
	require('./server.js')(cluster.worker.id);
}

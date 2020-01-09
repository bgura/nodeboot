import cluster from "cluster";
import os from "os";

if(cluster.isMaster) {
    const cpus = os.cpus().length;
    console.log(`Clustering to ${cpus} CPUs`);
    for(let i = 0; i < cpus; i++) {
        cluster.fork();
    }
    cluster.on("exit", (worker, code) => {
        if(code !== 0 && !worker.exitedAfterDisconnect) {
            console.log("Worker crashed. Starting a new one");
            cluster.fork();
        }
    });
    
    // signal of workers to restart
    process.on("SIGUSR2", () => {
        const workers = Object.keys(cluster.workers);
        console.log("workers: ", workers);

        const restartWorker = (workerIndex: number) => {
            if(workerIndex >= workers.length) return;
            const worker = cluster.workers[workers[workerIndex]];
            console.log(`Stopping worker: ${worker?.process.pid}`);
            worker?.disconnect();
            worker?.on("exit", () => {
                if(!worker.exitedAfterDisconnect) return;
                const newWorker = cluster.fork();
                newWorker.on("listening", () => {
                    restartWorker(workerIndex+1);
                });
            });
        };
    });
} else {
    require("./app/server");
}
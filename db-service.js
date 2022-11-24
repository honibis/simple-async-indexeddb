export class IndexedDbService {
    db;
    async init(dbName, tables) {
        this.db = await this.openDb(dbName, tables);
    }

    openDb(name, tables) {
        return new Promise((resolve, reject) => {
            let openRequest = indexedDB.open(name, 2);

            openRequest.onsuccess = function () {
                let db = openRequest.result;
                resolve(db);
            };

            openRequest.onupgradeneeded = function (event) {
                let db = openRequest.result;
                if (tables) {
                    for (let item of tables) {
                        if (!db.objectStoreNames.contains(item)) { 
                            let os = db.createObjectStore(item.name, { keyPath: item.keyPath }); 
                            if (item.indexes) {
                                for (let idx of item.indexes) {
                                    let index = os.createIndex(idx, idx);
                                }
                            }
                        }
                    };
                }
            }
        });
    }

    deleteDb(name) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.deleteDatabase(name);
            request.onsuccess = function () { 
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    }


    updateOrCreate(tableName, entity) {
        let that = this;
        return new Promise((resolve, reject) => {
            let transaction = that.db.transaction(tableName, "readwrite");

            let table = transaction.objectStore(tableName); 
            let request = table.put(entity);

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    }

    getRepo(tableName,type='readonly', indexName = undefined){
        const transaction = this.db.transaction([tableName], type);
        const objectStore = transaction.objectStore(tableName);

        if(indexName){
            return objectStore.index(indexName);
        }
        else{
            return objectStore;
        }
    }

    get(tableName, value, indexName = undefined){
        let that = this;
        return new Promise((resolve, reject) => {
            const repo = this.getRepo(tableName,'readonly',indexName);
            const request = repo.get(value);
            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error);
            };

        });
    }


    delete(tableName, value, indexName = undefined) {
        let that = this;
        return new Promise((resolve, reject) => {

            const repo = this.getRepo(tableName,'readwrite',indexName);
            if(repo.delete){
                const request = repo.delete(value);
                request.onsuccess = function () {
                resolve(request.result);
            };

                request.onerror = function () {
                    reject(request.error);
                };

            }
            else{
                var request = repo.openCursor(IDBKeyRange.only(value)); 
                request.onsuccess = function() {
                    var cursor = pdestroy.result;
                    if (cursor) {
                        cursor.delete();
                        cursor.continue();
                        resolve();
                    }
                    else{
                        reject("Not found!");
                    }
                }
                request.onerror = function () {
                    reject(request.error);
                };
            }
        });
    }
}

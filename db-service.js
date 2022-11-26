export class IndexedDbService {
    db;
    async init(dbName, tables, verison = 1) {
        this.db = await this.openDb(dbName, tables);
    }

    openDb(name, tables, verison) {
        return new Promise((resolve, reject) => {
            let openRequest = indexedDB.open(name, verison);

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

    checkObjectStore(name) {
        if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath: 'id' });
        }
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
            transaction.commit();

        });
    }

    get(tableName, value, indexName = undefined) {
        let that = this;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], "readonly");
            const objectStore = transaction.objectStore(tableName);
            let request;
            if (indexName) {
                request = objectStore.index(indexName).get(value);
            }
            else {
                request = objectStore.get(value);
            }
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

            const transaction = this.db.transaction([tableName], "readwrite");
            const objectStore = transaction.objectStore(tableName);
            let request;
            if (indexName) {
                request = objectStore.index(indexName).openCursor(IDBKeyRange.only(value));
                request.onsuccess = function () {
                    var cursor = request.result;
                    if (cursor) {
                        cursor.delete();
                        cursor.continue();
                        transaction.commit();

                        resolve();
                    }
                    else {
                        reject("Not found!");
                    }
                }
            }
            else {
                request = repo.delete(value);
                request.onsuccess = function () {
                    resolve(request.result);
                };

                request.onerror = function () {
                    reject(request.error);
                };
            }

            request.onerror = function () {
                reject(request.error);
            };


        });
    }
}

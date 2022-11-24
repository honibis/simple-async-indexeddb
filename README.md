# simple-async-indexeddb
Javascript IndexedDb wrapper, promise based, very simple and lightweight

## Usage

### Create Service:
let dbService = new IndexedDbService();


### Initialize service
#### Parameters
-databaseName: each service instance manages 1 databese
-dataTables: array of objects with properties name, keyPath and index names
```javascript
await dbService.init("MyDatabase", [
    { name: "DataTable1", keyPath: "id", indexes: ["name"] },
    { name: "DataTable2", keyPath: "id", indexes: ["name"] },
]);
```

### Insert Data
```javascript
await dbService.updateOrCreate("DataTable1", {id:1, name:"Name1"});
```

### Update Data
```javascript
await dbService.updateOrCreate("DataTable1", {id:1, name:"Name2"});
```

### Update Data By Index
```javascript
await dbService.updateOrCreate("DataTable1", {name:"Name2", newProp:"Some Value"});
```

### Get By Id
#### Parameters
-tableName
-value (id)
```javascript
let data = await dbService.get("DataTable1", 1);
```

### Get By Index
#### Parameters
-tableName
-value
-indexName
```javascript
let data = await dbService.get("DataTable1", "Name2", "name");
```

### Delete 
#### Parameters
-tableName
-value (id)
```javascript
await dbService.delete("DataTable1", 1);
```

### Delete By Index
#### Parameters
-tableName
-value
-indexName
```javascript
await dbService.delete("DataTable1", "Name2", "name");
```


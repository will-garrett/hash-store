const knex = require("knex");

module.exports = class HashStore{
  constructor(connection, schema, hash_config) {
    this.tables = {};

    this.connection = connection ? connection : null;

    this.schema = schema ? schema : null;
    
    this.hash_config = hash_config ? schema : null;
  }
  setConnection(con){
    this.connection = con;
  }
  setSchema(schema){
    this.schema = schema;
  }
  setHashConfig(hash){
    this.hash_config = hash;
  }
  async upsert(data){
    let key = this.generateHash(data);
    let result;
    let table = this.hash_config.prefix + key;
    let checkIfTableExists = await this.checkIfTableExists(table);
    if(checkIfTableExists){
      try{
        result = await this.connection(table).insert(data);
      }
      catch(err){
        console.log(err.message);
        return false;
      }
    }
    return result;
  }
  async checkIfTableExists(table_name){
    let result = await this.connection.schema.hasTable(table_name);
    if(!result){
      //console.log(`Creating ${table_name}`);
      try{
        result = await this.connection.schema.createTable(
          table_name, 
          this.schema
        );
      }
      catch(err){
        console.log(err.message);
        return false;
      }
    }
    return true;
  }
  generateHash(data){
    let elements = this.hash_config.hashFunction(data[this.hash_config.hashKey]);
    let hash_result = [];
    for(let h of this.hash_config.hashElements){
      hash_result.push(elements[h]);
    }
    return hash_result.join('-');
  }
}
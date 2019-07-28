const HashStore = require("../index");
const knex = require("knex");
const faker = require("faker/locale/en_US");

describe('HashStorage Object', () => {
  test('should create 1000 phone numbers', () => {
    let conn = knex({
      client: 'sqlite3',
      connection: {
        filename: "./db.sqlite"
      }
    });
    let schema = (table) => {
      table.string('phone');
      table.int('batch');
      table.timestamps(['NOW()'], ['NOW()'])
      table.unique('phone');
    };
    let hash_config = {
      hashFunction: (data) =>{
        let result = {};
        result.areacode = data.substr(0,3);
        result.prefix = data.substr(3,3);
        return result;
      },
      prefix: 'hash_',
      hashKey: 'phone',
      hashElements: ['areacode','prefix']
    };

    
    const phoneHashStore = new HashStore();
    
    phoneHashStore.setConnection(conn);
    phoneHashStore.setSchema(schema);
    phoneHashStore.setHashConfig(hash_config);

    let results = [];
    
    for(let i = 0; i < 10; i++){
      let phone = faker.phone.phoneNumberFormat(0).split('-').join('');
      let insert_me = {phone, batch: i};
      results.push(insert_me);
      phoneHashStore.upsert(insert_me);
    }

    
  });
});
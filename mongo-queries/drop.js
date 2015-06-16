//conn = new Mongo("es.openpolis.it");
conn = new Mongo("mongo30");
db = conn.getDB("dossier-incomes");
db['parlamentari'].drop();

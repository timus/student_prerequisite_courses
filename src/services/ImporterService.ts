import Datastore from 'nedb';

export default class ImporterService {
    private db: Datastore;

    constructor(db: Datastore) {
        this.db = db;
    }

    public async importData(data: any) {
        return new Promise((resolve, reject) => {
            this.db.insert(data, (err, newDocs) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(newDocs);
                }
            });
        });
    }
}

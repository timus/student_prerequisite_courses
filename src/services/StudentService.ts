import Datastore from 'nedb';

export default class StudentService {
    private db: Datastore;

    constructor() {
        this.db = new Datastore({ filename: 'data/student.db', autoload: true });
    }

    public async saveStudentData(data: any[]): Promise<void> {
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

    public async clearDatabase(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.remove({}, { multi: true }, (err, numRemoved) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

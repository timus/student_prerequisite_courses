export default class CleanupService {
    private db: any;

    constructor(db: any) {
        this.db = db;
    }

    public cleanData() {
        this.db.remove({}, { multi: true }, (err: Error, numRemoved: number) => {
            if (err) console.error('Error cleaning database:', err);
            else console.log(`Cleaned ${numRemoved} entries from the database`);
        });
    }
}

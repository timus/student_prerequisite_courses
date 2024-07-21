import Datastore from 'nedb';
import csv from 'csv-parser';
import fs from 'fs';

export default class PreRequisiteService {
    private db: Datastore;

    constructor(db: Datastore) {
        this.db = db;
    }

    public async parseAndSave(filePath: string): Promise<void> {
        const results: any[] = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    const subject = data['Subject'];
                    const requisiteSubjects = data['Requisite Subject List']?.split(':').map((item: string) => item.trim()) || [];
                    requisiteSubjects.forEach((requisite: string) => {
                        results.push({ subject, requisite });
                    });
                })
                .on('end', async () => {
                    try {
                        await this.saveToDatabase(results);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    private async saveToDatabase(data: any[]): Promise<void> {
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

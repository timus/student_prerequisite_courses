import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export default class ParserService {
    public async parseCSV(filePath: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const results: any[] = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    resolve(results);
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    public async convertToCSV(data: any, outputFilePath: string) {
        if (data.length === 0) {
            console.error('No data to convert to CSV.');
            return;
        }
        const csvContent = data.map(row => Object.values(row).join(',')).join('\n');
        await fs.promises.writeFile(outputFilePath, csvContent);
        console.log(`CSV file created at ${outputFilePath}`);
    }

    public async unpivotAndSaveStudentData(filePath: string, db: any): Promise<void> {
        const results: any[] = [];
        const jsonData = await this.parseCSV(filePath);

        const courseHeaders = Object.keys(jsonData[0]).slice(4); // Extract course headers from the first row

        jsonData.forEach((row: any) => {
            const studentId = row['StudentId'];
            if (!studentId) return; // Skip rows without a studentId

            courseHeaders.forEach((course, index) => {
                const status = row[course] || 'n/a'; // Use 'n/a' if status is blank
                if (status) {
                    results.push({
                        studentId,
                        course,
                        status
                    });
                }
            });
        });

        return new Promise((resolve, reject) => {
            db.remove({}, { multi: true }, (err: any, numRemoved: any) => { // Clear old data
                if (err) {
                    reject(err);
                } else {
                    db.insert(results, (err: any, newDocs: any) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(newDocs);
                        }
                    });
                }
            });
        });
    }
}

import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export default class ParserService {
    public parseFile(filePath: string) {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        return data;
    }

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
        const csvData = xlsx.utils.json_to_sheet(data);
        const csvContent = xlsx.utils.sheet_to_csv(csvData);
        await fs.promises.writeFile(outputFilePath, csvContent);
        console.log(`CSV file created at ${outputFilePath}`);
    }
}

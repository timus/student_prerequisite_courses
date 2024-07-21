import xlsx from 'xlsx';
import path from 'path';

export default class ExporterService {
    private db: any;

    constructor(db: any) {
        this.db = db;
    }

    public async exportData() {
        return new Promise((resolve, reject) => {
            this.db.find({}, (err: Error, docs: any[]) => {
                if (err) reject(err);
                else resolve(docs);
            });
        });
    }

    public async createExcelFile(data: any) {
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const filePath = path.join(__dirname, '../public/exports/calculated.xlsx');

        xlsx.writeFile(workbook, filePath);

        return filePath;
    }
}

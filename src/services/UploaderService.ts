import { Request, Response, NextFunction } from 'express';
import Busboy from 'busboy';
import path from 'path';
import fs from 'fs';

export default class UploaderService {
    public uploadFiles = (req: Request, res: Response, next: NextFunction) => {
        const busboy = new Busboy({ headers: req.headers });
        const uploads: string[] = [];

        busboy.on('file', (fieldname, file, filename) => {
            const saveTo = path.join(__dirname, '../../public/uploads/', path.basename(filename));
            file.pipe(fs.createWriteStream(saveTo));
            uploads.push(saveTo);
            console.log(`File [${fieldname}] uploaded to ${saveTo}`);
        });

        busboy.on('finish', () => {
            (req as any).uploadedFiles = uploads;
            console.log('All files uploaded:', uploads);
            next();
        });

        req.pipe(busboy);
    };
}

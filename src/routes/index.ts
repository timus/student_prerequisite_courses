import { Router, Request, Response } from 'express';
import UploaderService from '../services/UploaderService';
import ParserService from '../services/ParserService';
import ImporterService from '../services/ImporterService';
import ProcessorService from '../services/ProcessorService';
import ExporterService from '../services/ExporterService';
import CleanupService from '../services/CleanupService';
import PreRequisiteService from '../services/PreRequisiteService';
import path from 'path';
import fs from 'fs';

const router = Router();

export default (services: any) => {
    const uploaderService = new UploaderService();
    const parserService = new ParserService();
    const importerService = new ImporterService(services.db);
    const processorService = new ProcessorService();
    const exporterService = new ExporterService(services.db);
    const cleanupService = new CleanupService(services.db);
    const preRequisiteService = new PreRequisiteService(services.db);

    router.get('/', (req: Request, res: Response) => {
        res.render('index');
    });

    router.post('/upload', uploaderService.uploadFiles, async (req: Request, res: Response) => {
        const files = (req as any).uploadedFiles as string[];
        console.log('Uploaded files:', files);

        try {
            for (const file of files) {
                const ext = path.extname(file).toLowerCase();
                const fileName = path.basename(file, ext).toLowerCase();
                if (fileName.includes('prerequisite')) {
                    if (ext === '.xlsx') {
                        const data = parserService.parseFile(file);
                        const csvFilePath = path.join(__dirname, '../../public/uploads/', fileName + '.csv');
                        await parserService.convertToCSV(data, csvFilePath);
                        await preRequisiteService.parseAndSave(csvFilePath);
                    } else {
                        await preRequisiteService.parseAndSave(file);
                    }
                } else if (fileName.includes('student') && ext === '.xlsx') {
                    const data = parserService.parseFile(file);
                    const csvFilePath = path.join(__dirname, '../../public/uploads/', fileName + '.csv');
                    await parserService.convertToCSV(data, csvFilePath);
                }
            }

            res.send('Files uploaded, processed, and converted to CSV successfully');
        } catch (error) {
            console.error('Error processing files:', error);
            res.status(500).send('An error occurred during file processing');
        }
    });

    router.get('/export', async (req: Request, res: Response) => {
        try {
            const data = await exporterService.exportData();
            const processedData = processorService.processData(data);
            const csvFilePath = await exporterService.createCSVFile(processedData);

            cleanupService.cleanData();

            res.download(csvFilePath, (err) => {
                if (err) {
                    console.error('File download error:', err);
                }
                cleanupService.deleteFile(csvFilePath);
            });
        } catch (error) {
            console.error('Error during export:', error);
            res.status(500).send('An error occurred during export');
        }
    });

    return router;
};

export default class ProcessorService {
    public processData(data: any) {
        // Perform your calculations here and return the processed data
        return data.map((doc: any) => ({
            ...doc,
            calculatedField: doc.someField * 2 // Example calculation
        }));
    }
}

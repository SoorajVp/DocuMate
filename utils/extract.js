import axios from "axios";
import officeParser from 'officeparser';


const extractTextFromDocuments = async (url) => {
    try {
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'arraybuffer' // Binary data for documents
        });

        const bufferData = response.data;
        const result = await parseDocumentAsync(bufferData);

        return result;

    } catch (error) {
        console.error('Error fetching or parsing document:', error);
        throw error;
    }
};

// Helper function to wrap the officeParser in a promise
const parseDocumentAsync = (bufferData) => {
    return new Promise((resolve, reject) => {
        officeParser.parseOffice(bufferData, (data, err) => {
            if (err) {
                reject(err); // Reject the promise with error
            } else {
                resolve(data); // Resolve the promise with parsed data
            }
        });
    });
};

export default extractTextFromDocuments;
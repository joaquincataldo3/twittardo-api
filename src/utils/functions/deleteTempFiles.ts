import { tempFilePath } from "../constants/userUtils";

const fs = require('fs');
const path = require('path');

const tempDir = tempFilePath;

// Leer el contenido del directorio temporal
export const deleteTempFiles = fs.readdir(tempDir, (err: Error, files: File[]) => {
    if (err) {
        console.error('Error al leer el directorio temporal:', err);
        return;
    }

    // Iterar sobre cada archivo en el directorio
    files.forEach((file) => {
        // Construir la ruta completa al archivo
        const filePath = path.join(tempDir, file);

        // Eliminar el archivo
        fs.unlink(filePath, (error: Error) => {
            if (error) {
                console.error(`Error al eliminar el archivo ${file}:`, error);
            } else {
                console.log(`Archivo ${file} eliminado correctamente.`);
            }
        });
    });
});